from .redis_client import get_redis
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

CACHE_PREFIX = "cache:"

def build_key(name: str) -> str:
    return f"{CACHE_PREFIX}{name}"

async def set_cache(key: str, value: Any, ttl: int = 300) -> bool:
    try:
        redis = await get_redis()
        await redis.set(build_key(key), json.dumps(value), ex=ttl)
        return True
    except Exception as e:
        logger.error(f"Failed to set cache '{key}': {e}")
        return False

async def get_cache(key: str) -> Optional[Any]:
    try:
        redis = await get_redis()
        data = await redis.get(build_key(key))
        return json.loads(data) if data else None
    except Exception as e:
        logger.error(f"Failed to get cache '{key}': {e}")
        return None

async def delete_cache(key: str) -> bool:
    #return True если ключ был удален
    try:
        redis = await get_redis()
        result = await redis.delete(build_key(key))
        return result > 0
    except Exception as e:
        logger.error(f"Failed to delete cache '{key}': {e}")
        return False
