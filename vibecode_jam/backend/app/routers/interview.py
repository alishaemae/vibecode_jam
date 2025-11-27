from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.db import get_db
from app.schemas.interview import InterviewStartRequest, InterviewResponse, AdaptTaskResponse
from app.db.models import Interview, Task
from app import main

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/start", response_model=InterviewResponse)
async def start_interview(
    request: InterviewStartRequest,
    db: AsyncSession = Depends(get_db)
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
        if not main.task_generator:
            raise Exception("Task generator not initialized")

        generated_task = await main.task_generator.generate_task(
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
        if main.cache:
            await main.cache.cache_task(
                request.level,
                request.domain,
                generated_task
            )

        return InterviewResponse(
            session_id=interview.id,
            task={
                "title": task.title,
                "description": task.description,
                "examples": generated_task.get("examples", [])
            },
            ws_url=f"/api/chat/ws/{interview.id}"
        )

    except Exception as e:
        logger.error(f"Interview start error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/adapt_task/{session_id}", response_model=AdaptTaskResponse)
async def adapt_task(
    session_id: int,
    db: AsyncSession = Depends(get_db)
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
        if not main.task_generator:
            raise Exception("Task generator not initialized")

        generated_task = await main.task_generator.adapt_task(
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
        logger.error(f"Task adaptation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
