from pydantic import BaseModel
from typing import Optional, List

class InterviewStartRequest(BaseModel):
    candidate_email: str
    level: str
    domain: str

class InterviewResponse(BaseModel):
    session_id: int
    task: dict  # title, description
    ws_url: str

class AdaptTaskResponse(BaseModel):
    task: dict
