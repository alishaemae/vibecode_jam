from pydantic import BaseModel
from typing import Optional

class RunCodeRequest(BaseModel):
    session_id: int
    code: str
    language: str

class SubmitCodeRequest(BaseModel):
    session_id: int
    task_id: int
    code: str
    language: str

class CodeRunResponse(BaseModel):
    stdout: str
    stderr: str
    tests_passed: int

class CodeSubmitResponse(BaseModel):
    tests_passed: str
    score: int
    evaluation: dict
    next_task_ready: bool
