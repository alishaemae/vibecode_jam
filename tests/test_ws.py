import asyncio
import pytest
from websockets import connect

@pytest.mark.asyncio
async def test_ai_ws_interaction():
    uri = "ws://localhost:8000/ws/chat?session_id=test-session"
    async with connect(uri) as websocket:
        # Отправляем сообщение кандидата
        await websocket.send('{"type":"message","text":"Hello AI"}')

        # Ждём ответ от AI (streaming)
        response = await websocket.recv()
        assert "Hello" in response or "AI" in response
