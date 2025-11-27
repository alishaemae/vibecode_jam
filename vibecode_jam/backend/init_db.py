#!/usr/bin/env python3
"""
Database initialization script - Creates all tables
Run from backend directory: python init_db.py
"""

import asyncio
import sys
import os

# Set up environment
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from app.db.models.base import Base
# Import all models to register them
from app.db.models import interview, task, solution, metric, chat_message, embedding


async def init_db():
    """Create all database tables"""
    print("🔧 Creating database tables...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        await engine.dispose()


if __name__ == "__main__":
    success = asyncio.run(init_db())
    sys.exit(0 if success else 1)
