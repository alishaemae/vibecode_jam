from .redis_client import get_redis
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getlogger(__name__)

SESSION_PREFIX = "session:"
def build_key(session_id: str) -> str:
    return f"{SESSION_PREFIX}{session_id}"

async def create_session(session_id: str, data: Dict[str, Any], ttl: int = 3600) -> bool:
    redis = await get_redis()
    try:
        await redis.set(build_key(session_id), json.dumps(data), ex=ttl)
        return True

    except Exception as e:
        logger.error(f"Failed to create session {session_id}: {e}")
        return False

async def get_session(session_id: str):
    redis = await get_redis()
    data = await redis.get(build_key(session_id))
    return json.loads(data) if data else None

async def delete_session(session_id: str):
    redis = await get_redis()
    await redis.delete(build_key(session_id))
