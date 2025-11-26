import asyncio
from asyncio import Queue
from backend.app.services.orchestrator import orchestrate_submission
from backend.app.models import Submission

submit_queue = Queue()

async def process_submission_job(submission_id, code, language, db_session):
    """
    Фоновая обработка submit: оценка + античит + запись в БД
    """
    result = await orchestrate_submission(code, language)

    submission = await db_session.get(Submission, submission_id)
    if submission:
        submission.evaluation = {
            **result["evaluation"],
            **result["coder_analysis"],
            **result["embedding_analysis"]
        }
        submission.suspicious_score = result["suspicious_score"]
        await db_session.commit()


async def submit_worker():
    while True:
        submission_id, code, language, db_session = await submit_queue.get()
        try:
            await process_submission_job(submission_id, code, language, db_session)
        except Exception as e:
            print(f"[Worker] Error processing submission {submission_id}: {e}")
        finally:
            submit_queue.task_done()


async def enqueue_submission(submission_id, code, language, db_session):
    await submit_queue.put((submission_id, code, language, db_session))
