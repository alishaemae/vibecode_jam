from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.code import SubmitCodeRequest, CodeSubmitResponse
from app.db import get_db
from app.models import Submission
from uuid import uuid4
from datetime import datetime
from worker.tasks import enqueue_submission

router = APIRouter()

@router.post("/submit", response_model=CodeSubmitResponse)
async def submit_code_endpoint(request: SubmitCodeRequest, db: AsyncSession = Depends(get_db)):
    # Сохраняем новый submission
    submission = Submission(
        interview_id=uuid4(),
        task_id=uuid4(),
        code=request.code,
        language=request.language,
        submitted_at=datetime.utcnow()
    )
    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    # Поставим в очередь на асинхронную обработку
    await enqueue_submission(submission.id, request.code, request.language, db)

    return CodeSubmitResponse(
        tests_passed="Pending...",
        score=0,
        evaluation={},
        next_task_ready=True
    )
