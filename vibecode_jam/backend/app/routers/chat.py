from fastapi import APIRouter, WebSocket
from app.services.llm_service import stream_ai_response
from vibecode_jam.backend.app.redis.redis_client import get_redis

router = APIRouter()

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    redis = await get_redis()

    async def send_to_ws(message: str):
        await websocket.send_text(message)

    while True:
        try:
            data = await websocket.receive_text()
            await stream_ai_response([{"role": "candidate", "content": data}], send_to_ws)
        except Exception as e:
            print("WebSocket disconnect:", e)
            break
