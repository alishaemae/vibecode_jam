from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID

class InterviewStartRequest(BaseModel):
    candidate_email: str
    level: str
    domain: str

class InterviewResponse(BaseModel):
    session_id: UUID
    task: dict  # title, description, examples
    ws_url: str

class AdaptTaskResponse(BaseModel):
    task: dict
