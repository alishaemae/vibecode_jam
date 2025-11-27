from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.code import SubmitCodeRequest, CodeSubmitResponse
from app.db import get_db
from app.db.models import Solution
from datetime import datetime
from worker.tasks import enqueue_submission

router = APIRouter()

@router.post("/submit", response_model=CodeSubmitResponse)
async def submit_code_endpoint(request: SubmitCodeRequest, db: AsyncSession = Depends(get_db)):
    # Сохраняем новое решение
    solution = Solution(
        interview_id=request.session_id,
        task_id=request.task_id,
        code=request.code,
        language=request.language,
        submitted_at=datetime.utcnow()
    )
    db.add(solution)
    await db.commit()
    await db.refresh(solution)

    # Поставим в очередь на асинхронную обработку
    await enqueue_submission(solution.id, request.code, request.language, db)

    return CodeSubmitResponse(
        tests_passed="Pending...",
        score=0,
        evaluation={},
        next_task_ready=True
    )
