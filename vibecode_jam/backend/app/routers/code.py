from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from app.schemas.code import SubmitCodeRequest, CodeSubmitResponse
from app.db import get_db
from app.db.models import Solution, Task, Interview
from app import main
from worker.tasks import enqueue_submission

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/submit", response_model=CodeSubmitResponse)
async def submit_code_endpoint(
    request: SubmitCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit code solution and get evaluation

    Uses Scibox LLM for intelligent evaluation and anti-cheat detection
    """
    try:
        # Get interview and task
        interview = await db.get(Interview, request.session_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")

        task = await db.get(Task, request.task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        # Save solution to database
        solution = Solution(
            interview_id=request.session_id,
            task_id=request.task_id,
            code=request.code,
            language=request.language
        )
        db.add(solution)
        await db.commit()
        await db.refresh(solution)

        logger.info(f"Solution submitted: {solution.id}")

        # Check cache for evaluation
        if main.cache:
            cached_eval = await main.cache.get_cached_evaluation(request.code)
            if cached_eval:
                logger.info("Using cached evaluation")
                return CodeSubmitResponse(
                    tests_passed="From cache",
                    score=cached_eval.get("overall_score", 0),
                    evaluation=cached_eval,
                    next_task_ready=True
                )

        # Evaluate solution using Scibox
        if not main.solution_evaluator:
            raise Exception("Solution evaluator not initialized")

        evaluation = await main.solution_evaluator.evaluate_solution(
            task=task.task_data or {},
            code=request.code,
            test_results={
                "visible_passed": 0,
                "visible_total": 3,
                "hidden_passed": 0,
                "hidden_total": 5
            },
            execution_time_ms=0.0,
            language=request.language
        )

        # Check code originality
        if not main.anti_cheat_llm:
            raise Exception("Anti-cheat service not initialized")

        cheat_check = await main.anti_cheat_llm.check_code_originality(
            code=request.code,
            language=request.language,
            task_context=task.description if task else ""
        )

        # Check for exact/similar matches
        similar_solutions = []
        if main.embedding_search:
            similar_solutions = await main.embedding_search.find_similar(
                code=request.code,
                threshold=0.85
            )

        # Save evaluation to database
        solution.evaluation = evaluation
        solution.suspicious_score = cheat_check.get("similarity_score", 0)
        await db.commit()

        # Cache the evaluation
        if main.cache:
            await main.cache.cache_evaluation(request.code, evaluation)

        # Enqueue background processing
        await enqueue_submission(solution.id, request.code, request.language, db)

        return CodeSubmitResponse(
            tests_passed="Evaluating...",
            score=evaluation.get("overall_score", 0),
            evaluation={
                "scores": {
                    "correctness": evaluation.get("correctness_score", 0),
                    "code_quality": evaluation.get("code_quality_score", 0),
                    "efficiency": evaluation.get("efficiency_score", 0),
                    "overall": evaluation.get("overall_score", 0)
                },
                "feedback": evaluation.get("feedback", {}),
                "anti_cheat": {
                    "similarity_score": cheat_check.get("similarity_score", 0),
                    "is_suspicious": cheat_check.get("is_suspicious", False),
                    "recommendation": cheat_check.get("recommendation", "accept")
                },
                "similar_solutions_found": len(similar_solutions) > 0
            },
            next_task_ready=True
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Code submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hint/{session_id}/{task_id}")
async def get_hint(
    session_id: int,
    task_id: int,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Get a hint for the current task

    Scibox provides helpful hints without giving away the solution
    """
    try:
        task = await db.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        if not main.solution_evaluator:
            raise Exception("Solution evaluator not initialized")

        # Get previous code if available
        hint_code = ""  # Would come from solution history

        hint = await main.solution_evaluator.provide_hint(
            task=task.task_data or {},
            code=hint_code
        )

        logger.info(f"Hint provided for task {task_id}")

        return {"hint": hint}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Hint generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
