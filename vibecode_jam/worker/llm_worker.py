import asyncio
from asyncio import Queue
from backend.app.services.llm_service import stream_ai_response

llm_queue = Queue()

async def llm_worker():
    while True:
        session_id, conversation, send_func = await llm_queue.get()
        try:
            await stream_ai_response(conversation, send_func)
        except Exception as e:
            print(f"LLM worker error for session {session_id}: {e}")
        finally:
            llm_queue.task_done()

async def enqueue_task(session_id, conversation, send_func):
    await llm_queue.put((session_id, conversation, send_func))

# Запуск воркера
if __name__ == "__main__":
    asyncio.run(llm_worker())
