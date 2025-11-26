from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from app.db import get_db
from app.schemas.interview import InterviewStartRequest, InterviewResponse, AdaptTaskResponse
from app.models import Interview, Task
from vibecode_jam.backend.app.redis.redis_client import get_redis

router = APIRouter()

@router.post("/start", response_model=InterviewResponse)
async def start_interview(request: InterviewStartRequest, db: AsyncSession = Depends(get_db)):
    interview = Interview(
        candidate_email=request.candidate_email,
        level=request.level,
        domain=request.domain
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)

    task = Task(
        title="Loading...",
        description="Generating task...",
        level=request.level,
        domain=request.domain
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    redis = await get_redis()
    session_id = str(interview.id)
    await redis.set(f"session:{session_id}", str(task.id), ex=60*60*4)

    return InterviewResponse(
        session_id=interview.id,
        task={"title": task.title, "description": task.description},
        ws_url=f"/api/chat/ws/{session_id}"
    )

@router.get("/adapt_task/{session_id}", response_model=AdaptTaskResponse)
async def adapt_task(session_id: str, db: AsyncSession = Depends(get_db)):
    task = Task(
        title="Next Challenge",
        description="Adaptive task generated based on previous performance",
        level="medium",
        domain="algorithms"
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    redis = await get_redis()
    await redis.set(f"session:{session_id}:next_task", str(task.id), ex=60*60*4)

    return AdaptTaskResponse(task={"title": task.title, "description": task.description})
