"""
Mock database for development without PostgreSQL
"""

import logging
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

# In-memory mock storage
_mock_data = {
    "interviews": {},
    "tasks": {},
    "next_interview_id": 1,
    "next_task_id": 1
}


class MockAsyncSession:
    """Mock async session that stores data in memory"""

    def __init__(self):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass

    async def close(self):
        pass

    def add(self, obj):
        """Add object to mock storage"""
        if hasattr(obj, '__tablename__'):
            table = obj.__tablename__
            if table == "interviews":
                obj.id = _mock_data["next_interview_id"]
                _mock_data["next_interview_id"] += 1
                _mock_data["interviews"][obj.id] = obj
            elif table == "tasks":
                obj.id = _mock_data["next_task_id"]
                _mock_data["next_task_id"] += 1
                _mock_data["tasks"][obj.id] = obj

    async def commit(self):
        """Mock commit"""
        pass

    async def rollback(self):
        """Mock rollback"""
        pass

    async def refresh(self, obj):
        """Mock refresh"""
        pass

    async def get(self, model, id):
        """Get object from mock storage"""
        if hasattr(model, '__tablename__'):
            table = model.__tablename__
            if table == "interviews":
                return _mock_data["interviews"].get(id)
            elif table == "tasks":
                return _mock_data["tasks"].get(id)
        return None


class MockSessionFactory:
    """Mock session factory"""

    def __init__(self):
        pass

    def __call__(self):
        return MockAsyncSession()

    async def close(self):
        pass


async def get_mock_db() -> AsyncSession:
    """Dependency for getting mock database session"""
    session = MockAsyncSession()
    try:
        yield session
    finally:
        await session.close()


logger.info("Mock database initialized")
