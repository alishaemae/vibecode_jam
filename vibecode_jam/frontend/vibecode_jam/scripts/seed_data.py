import asyncio
from backend.app.db import get_db
from backend.app.models import Task

async def seed_tasks():
    async for db in get_db():
        async with db as session:
            tasks = [
                Task(title="FizzBuzz", description="Implement FizzBuzz in Python", level="easy", domain="algorithms"),
                Task(title="Palindrome Check", description="Check if a string is palindrome", level="easy", domain="algorithms"),
            ]
            session.add_all(tasks)
            await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_tasks())
