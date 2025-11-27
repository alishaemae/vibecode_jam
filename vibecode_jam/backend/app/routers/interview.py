from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import traceback

from app.db import get_db
from app.schemas.interview import InterviewStartRequest, InterviewResponse, AdaptTaskResponse
from app.db.models import Interview, Task
from app.services.scibox import TaskGenerator
from app.services.cache import RedisCache

logger = logging.getLogger(__name__)

router = APIRouter()


async def get_task_generator() -> TaskGenerator:
    """
    Dependency to get initialized TaskGenerator
    Raises 503 Service Unavailable if not initialized
    """
    from app.main import task_generator
    if not task_generator:
        logger.error("Task generator not initialized - check backend startup logs")
        raise HTTPException(
            status_code=503,
            detail="Task generator service unavailable. Check backend health."
        )
    return task_generator


async def get_cache_service() -> RedisCache | None:
    """
    Dependency to get optional Redis cache
    Returns None if cache is not available (graceful degradation)
    """
    from app.main import cache
    if cache and cache.redis:
        return cache
    logger.warning("Redis cache not available - caching disabled")
    return None


@router.post("/start", response_model=InterviewResponse)
async def start_interview(
    request: InterviewStartRequest,
    db: AsyncSession = Depends(get_db),
    task_gen: TaskGenerator = Depends(get_task_generator),
    cache_service: RedisCache | None = Depends(get_cache_service)
):
    """
    Start a new interview session and generate first task

    Uses Scibox LLM to generate adaptive tasks based on level and domain
    """
    try:
        # Create interview record
        interview = Interview(
            candidate_email=request.candidate_email,
            level=request.level,
            domain=request.domain,
            status="in_progress"
        )
        db.add(interview)
        await db.commit()
        await db.refresh(interview)

        logger.info(f"Interview started: {interview.id}")

        # Generate task using Scibox
        generated_task = await task_gen.generate_task(
            level=request.level,
            domain=request.domain
        )

        # Save task to database
        task = Task(
            interview_id=interview.id,
            title=generated_task.get("title", "Task"),
            description=generated_task.get("description", ""),
            level=request.level,
            domain=request.domain,
            task_data=generated_task
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

        # Cache task in Redis if available
        if cache_service:
            try:
                await cache_service.cache_task(
                    request.level,
                    request.domain,
                    generated_task
                )
            except Exception as cache_error:
                logger.warning(f"Failed to cache task: {cache_error}")
                # Don't fail the request if cache fails

        return InterviewResponse(
            session_id=interview.id,
            task={
                "title": task.title,
                "description": task.description,
                "examples": generated_task.get("examples", [])
            },
            ws_url=f"/api/chat/ws/{interview.id}"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Interview start error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")


@router.get("/adapt_task/{session_id}", response_model=AdaptTaskResponse)
async def adapt_task(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    task_gen: TaskGenerator = Depends(get_task_generator)
):
    """
    Generate next adaptive task based on previous performance

    Scibox LLM adapts difficulty based on candidate score
    """
    try:
        # Get previous interview/score
        interview = await db.get(Interview, session_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        # For now, use a default score - should be calculated from previous solutions
        previous_score = 75.0

        # Generate adaptive task
        generated_task = await task_gen.adapt_task(
            original_task={"title": "Previous Task", "description": "Previous task description"},
            candidate_score=previous_score
        )

        # Save new task
        task = Task(
            interview_id=interview.id,
            title=generated_task.get("title", "Adapted Task"),
            description=generated_task.get("description", ""),
            level=interview.level,
            domain=interview.domain,
            task_data=generated_task
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

        logger.info(f"Adapted task generated for interview {session_id}")

        return AdaptTaskResponse(
            task={
                "title": task.title,
                "description": task.description,
                "examples": generated_task.get("examples", [])
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Task adaptation error: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to adapt task: {str(e)}")
