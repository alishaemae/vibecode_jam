import asyncio
import pytest
from httpx import AsyncClient
from vibecode_jam.backend.app.main import app

@pytest.mark.asyncio
async def test_start_interview():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post("/api/interview/start", json={"level": "Junior", "domain": "Algorithms"})
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "task_data" in data
    assert "ws_url" in data

@pytest.mark.asyncio
async def test_run_code():
    # Используем фиктивный код
    code = """
def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
"""
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        # Сначала стартуем интервью, чтобы получить session_id
        start_resp = await client.post("/api/interview/start", json={"level": "Junior", "domain": "Algorithms"})
        session_id = start_resp.json()["session_id"]

        run_resp = await client.post("/api/code/run", json={"session_id": session_id, "code": code, "language": "python"})
        assert run_resp.status_code == 200
        result = run_resp.json()
        assert "stdout" in result
        assert "stderr" in result
        assert "tests_passed" in result

@pytest.mark.asyncio
async def test_submit_code():
    code = "print('Hello World')"
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        start_resp = await client.post("/api/interview/start", json={"level": "Junior", "domain": "Algorithms"})
        session_id = start_resp.json()["session_id"]

        submit_resp = await client.post("/api/code/submit", json={"session_id": session_id, "code": code})
        assert submit_resp.status_code == 200
        data = submit_resp.json()
        assert "tests_passed" in data
        assert "score" in data
        assert "evaluation" in data
