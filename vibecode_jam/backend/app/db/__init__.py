"""
Database configuration and session management
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
import logging

logger = logging.getLogger(__name__)

# Try to use real database, fall back to mock if unavailable
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "false").lower() == "true"

if not USE_MOCK_DB:
    try:
        # Get database URL from environment
        DATABASE_URL = os.getenv(
            "DATABASE_URL",
            "postgresql+asyncpg://postgres:password@localhost:5432/vibecode_db"
        )

        # Create async engine
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            poolclass=NullPool,
            future=True,
            connect_args={"timeout": 5}
        )

        # Create session factory
        AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False
        )

        async def get_db() -> AsyncSession:
            """
            Dependency for getting database session in FastAPI routes
            """
            async with AsyncSessionLocal() as session:
                try:
                    yield session
                except Exception as e:
                    await session.rollback()
                    logger.error(f"Database session error: {e}")
                    raise
                finally:
                    await session.close()

        logger.info("Using real PostgreSQL database")

    except Exception as e:
        logger.warning(f"Could not initialize real database: {e}. Using mock database.")
        USE_MOCK_DB = True

# If real database is not available, use mock
if USE_MOCK_DB:
    from app.db.mock import get_mock_db as get_db
    engine = None
    AsyncSessionLocal = None
    logger.info("Using mock in-memory database")


async def init_db():
    """Initialize database tables"""
    try:
        from app.db.models import Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db():
    """Close database connection"""
    await engine.dispose()
    logger.info("Database connection closed")


# Import models after engine is created to avoid circular imports
from app.db.models import Base, Interview, Task, Solution, Metric, Embedding, ChatMessage

__all__ = ["Base", "Interview", "Task", "Solution", "Metric", "Embedding", "ChatMessage", "get_db", "engine", "AsyncSessionLocal"]
