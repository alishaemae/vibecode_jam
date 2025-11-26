from .redis_client import get_redis
import logging

logger = logging.getLogger(__name__)

#в этот файл можно добавить античит наверное

RATE_PREFIX = "rate:"

def build_key(session_id: str, action: str) -> str:
    return f"{RATE_PREFIX}{session_id}:{action}"

async def is_allowed(session_id: str, action: str, limit: int, period: int) -> bool:
    #return True — действие разрешено, False — превышен лимит
    try:
        redis = await get_redis()
        key = build_key(session_id, action)
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, period)
        return count <= limit

    except Exception as e:
        logger.error(f"Rate limit check failed for {session_id}:{action}: {e}")
        return True

async def reset_limit(session_id: str, action: str):
    try:
        redis = await get_redis()
        key = build_key(session_id, action)
        await redis.delete(key)
    except Exception as e:
        logger.error(f"Failed to reset rate limit for {session_id}:{action}: {e}")
