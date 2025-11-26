import aiohttp
from app.config import settings

async def call_llm(model: str, payload: dict, stream: bool = False):
    """
    Вызов LLM (qwen3-32b, qwen3-coder, bge-m3)
    """
    headers = {"Authorization": f"Bearer {settings.LLM_API_KEY}"}
    url = f"{settings.LLM_BASE_URL}/chat" if "chat" in model else f"{settings.LLM_BASE_URL}/code_eval"

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json={**payload, "model": model, "stream": stream}) as resp:
            if stream:
                async for line in resp.content:
                    yield line.decode()
            else:
                return await resp.json()


async def stream_ai_response(conversation_history: list, send_func):
    """
    Streaming response для WebSocket
    """
    async for chunk in call_llm("qwen3-32b-awq", {"messages": conversation_history}, stream=True):
        await send_func(chunk)
