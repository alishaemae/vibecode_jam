"""
Caching service using Redis for performance optimization
"""

import json
import logging
import hashlib
from typing import Optional, Dict, Any
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class RedisCache:
    """Redis-based caching for Scibox API calls"""

    def __init__(self, redis_url: str = "redis://localhost:6379"):
        """
        Initialize Redis cache

        Args:
            redis_url: Redis connection URL
        """
        self.redis_url = redis_url
        self.redis: Optional[aioredis.Redis] = None

    async def connect(self) -> None:
        """Connect to Redis"""
        try:
            self.redis = await aioredis.from_url(self.redis_url)
            await self.redis.ping()
            logger.info("Connected to Redis cache")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis = None

    async def disconnect(self) -> None:
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")

    def _make_key(self, prefix: str, data: Any) -> str:
        """
        Create unique key from data

        Args:
            prefix: Key prefix
            data: Data to hash

        Returns:
            Cache key
        """
        try:
            data_str = json.dumps(data, sort_keys=True)
        except (TypeError, ValueError):
            data_str = str(data)

        hash_obj = hashlib.md5(data_str.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"

    async def get_cached_task(self, level: str, domain: str) -> Optional[Dict]:
        """
        Get cached task

        Args:
            level: Difficulty level
            domain: Programming domain

        Returns:
            Cached task or None
        """
        if not self.redis:
            return None

        try:
            key = self._make_key("task", {"level": level, "domain": domain})
            cached = await self.redis.get(key)

            if cached:
                logger.debug(f"Cache hit: {key}")
                return json.loads(cached)

            logger.debug(f"Cache miss: {key}")
            return None

        except Exception as e:
            logger.error(f"Cache get error: {e}")
            return None

    async def cache_task(
        self,
        level: str,
        domain: str,
        task: Dict,
        ttl: int = 86400
    ) -> None:
        """
        Cache a task

        Args:
            level: Difficulty level
            domain: Programming domain
            task: Task dict to cache
            ttl: Time to live in seconds (default 24 hours)
        """
        if not self.redis:
            return

        try:
            key = self._make_key("task", {"level": level, "domain": domain})
            await self.redis.setex(key, ttl, json.dumps(task))
            logger.debug(f"Cached task: {key}")

        except Exception as e:
            logger.error(f"Cache set error: {e}")

    async def get_cached_evaluation(self, code: str) -> Optional[Dict]:
        """
        Get cached evaluation

        Args:
            code: Code to look up

        Returns:
            Cached evaluation or None
        """
        if not self.redis:
            return None

        try:
            code_hash = hashlib.md5(code.encode()).hexdigest()
            key = f"eval:{code_hash}"
            cached = await self.redis.get(key)

            if cached:
                logger.debug(f"Evaluation cache hit")
                return json.loads(cached)

            return None

        except Exception as e:
            logger.error(f"Evaluation cache get error: {e}")
            return None

    async def cache_evaluation(
        self,
        code: str,
        evaluation: Dict,
        ttl: int = 3600
    ) -> None:
        """
        Cache solution evaluation

        Args:
            code: Code that was evaluated
            evaluation: Evaluation result
            ttl: Time to live in seconds (default 1 hour)
        """
        if not self.redis:
            return

        try:
            code_hash = hashlib.md5(code.encode()).hexdigest()
            key = f"eval:{code_hash}"
            await self.redis.setex(key, ttl, json.dumps(evaluation))
            logger.debug(f"Cached evaluation: {key}")

        except Exception as e:
            logger.error(f"Evaluation cache set error: {e}")

    async def get_conversation(self, session_id: str) -> Optional[list]:
        """
        Get cached conversation

        Args:
            session_id: Interview session ID

        Returns:
            Conversation history or None
        """
        if not self.redis:
            return None

        try:
            key = f"conversation:{session_id}"
            cached = await self.redis.get(key)

            if cached:
                return json.loads(cached)

            return None

        except Exception as e:
            logger.error(f"Conversation cache get error: {e}")
            return None

    async def cache_conversation(
        self,
        session_id: str,
        conversation: list,
        ttl: int = 86400
    ) -> None:
        """
        Cache conversation

        Args:
            session_id: Interview session ID
            conversation: Conversation history
            ttl: Time to live in seconds
        """
        if not self.redis:
            return

        try:
            key = f"conversation:{session_id}"
            await self.redis.setex(key, ttl, json.dumps(conversation))

        except Exception as e:
            logger.error(f"Conversation cache set error: {e}")

    async def clear_session(self, session_id: str) -> None:
        """
        Clear all cache for a session

        Args:
            session_id: Interview session ID
        """
        if not self.redis:
            return

        try:
            pattern = f"*{session_id}*"
            async for key in self.redis.scan_iter(match=pattern):
                await self.redis.delete(key)

            logger.info(f"Cleared cache for session: {session_id}")

        except Exception as e:
            logger.error(f"Cache clear error: {e}")

    async def get_stats(self) -> Dict:
        """Get cache statistics"""
        if not self.redis:
            return {"status": "disconnected"}

        try:
            info = await self.redis.info()
            return {
                "status": "connected",
                "memory_used": info.get("used_memory_human", "unknown"),
                "keys_count": await self.redis.dbsize(),
                "connected_clients": info.get("connected_clients", 0)
            }

        except Exception as e:
            logger.error(f"Stats error: {e}")
            return {"status": "error", "error": str(e)}
