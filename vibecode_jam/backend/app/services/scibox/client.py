"""
Scibox API Client with rate limiting and async support
"""

import aiohttp
import asyncio
from typing import Dict, List, Optional, AsyncGenerator
from datetime import datetime, timedelta
import logging
import json

logger = logging.getLogger(__name__)


class SciboxClient:
    """Async client for Scibox API with rate limiting"""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.scibox.ai/v1"
    ):
        self.api_key = api_key
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limiter = RateLimiter({
            "qwen3-32b-awq": 2,
            "qwen3-coder-30b-a3b-instruct-fp8": 2,
            "bge-m3": 7
        })

    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Dict:
        """
        Send chat completion request to Scibox

        Args:
            model: "qwen3-32b-awq" or "qwen3-coder-30b-a3b-instruct-fp8"
            messages: List of message dicts with "role" and "content"
            temperature: 0.0 - 2.0
            max_tokens: Maximum tokens in response
            stream: Whether to use streaming

        Returns:
            Response dict with choices/content
        """
        # Wait for rate limit
        await self.rate_limiter.acquire(model)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }

        try:
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Scibox API error [{response.status}]: {error_text}")
                    raise Exception(f"Scibox API error: {response.status} - {error_text}")

                if stream:
                    return response  # Return response for streaming

                data = await response.json()
                logger.debug(f"Chat completion successful for {model}")
                return data

        except aiohttp.ClientError as e:
            logger.error(f"Scibox network error: {e}")
            raise
        except Exception as e:
            logger.error(f"Scibox error: {e}")
            raise

    async def get_embedding(
        self,
        text: str,
        model: str = "bge-m3"
    ) -> List[float]:
        """
        Get embeddings for text

        Args:
            text: Text to embed
            model: "bge-m3"

        Returns:
            Embedding vector
        """
        # Wait for rate limit
        await self.rate_limiter.acquire(model)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": model,
            "input": text
        }

        try:
            async with self.session.post(
                f"{self.base_url}/embeddings",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Embedding error [{response.status}]: {error_text}")
                    raise Exception(f"Embedding error: {response.status}")

                data = await response.json()

                # Handle different response formats
                if isinstance(data.get('data'), list) and len(data['data']) > 0:
                    embedding = data['data'][0].get('embedding')
                    if embedding:
                        logger.debug(f"Embedding obtained: {len(embedding)} dimensions")
                        return embedding

                logger.error(f"Unexpected embedding response format: {data}")
                raise Exception("Invalid embedding response format")

        except aiohttp.ClientError as e:
            logger.error(f"Embedding network error: {e}")
            raise
        except Exception as e:
            logger.error(f"Embedding error: {e}")
            raise


class RateLimiter:
    """Rate limiter for respecting API quotas"""

    def __init__(self, limits: Dict[str, int]):
        """
        Initialize rate limiter

        Args:
            limits: Dict mapping model names to RPS limits
                   e.g., {"qwen3-32b-awq": 2, "bge-m3": 7}
        """
        self.limits = limits
        self.requests = {model: [] for model in limits.keys()}
        self.locks = {model: asyncio.Lock() for model in limits.keys()}

    async def acquire(self, model: str):
        """Wait for permission to make request for given model"""
        if model not in self.limits:
            logger.warning(f"Unknown model {model}, skipping rate limit")
            return

        async with self.locks[model]:
            now = datetime.now()

            # Remove requests older than 60 seconds
            self.requests[model] = [
                req_time for req_time in self.requests[model]
                if now - req_time < timedelta(seconds=60)
            ]

            # If we've hit the limit, wait
            if len(self.requests[model]) >= self.limits[model]:
                oldest = self.requests[model][0]
                wait_time = (oldest + timedelta(seconds=60) - now).total_seconds()

                if wait_time > 0:
                    logger.info(f"Rate limit for {model}: waiting {wait_time:.1f}s")
                    await asyncio.sleep(wait_time)
                    return await self.acquire(model)

            # Add new request
            self.requests[model].append(now)
