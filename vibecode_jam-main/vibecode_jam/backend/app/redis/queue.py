from typing import Optional
from redis import Redis
import json


class RedisQueue:
    #Класс очереди, реализованный через Redis LIST.

    def __init__(self, redis_client: Redis, queue_name: str = "task_queue"):
        self.redis = redis_client
        self.queue_name = queue_name

    def push(self, item: dict) -> int:
        """
        Добавляет элемент в очередь.
        Элемент сериализуется в JSON.
        """
        serialized = json.dumps(item)
        return self.redis.rpush(self.queue_name, serialized)

    def pop(self, timeout: int = 0) -> Optional[dict]:
        """
        Забирает элемент из очереди.
        Если timeout > 0 — блокирующее ожидание (BLPOP).
        """
        if timeout > 0:
            result = self.redis.blpop(self.queue_name, timeout=timeout)
            if not result:
                return None
            _, data = result
        else:
            data = self.redis.lpop(self.queue_name)

        if data is None:
            return None

        return json.loads(data)

    def size(self) -> int:
        """Текущее количество элементов в очереди."""
        return self.redis.llen(self.queue_name)

    def clear(self) -> int:
        """Очистить очередь полностью."""
        return self.redis.delete(self.queue_name)

    def peek(self) -> Optional[dict]:
        """Посмотреть первый элемент, не извлекая его."""
        data = self.redis.lindex(self.queue_name, 0)
        return json.loads(data) if data else None


# ===== Пример инициализации =====

def get_queue() -> RedisQueue:
    redis_client = Redis(
        host="localhost",
        port=6379,
        db=0,
        decode_responses=True   # позволяет работать со строками без декодирования
    )
    return RedisQueue(redis_client)
