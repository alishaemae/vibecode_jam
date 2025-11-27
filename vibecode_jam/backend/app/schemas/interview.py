from pydantic import BaseModel, Field
from typing import Optional, List

class InterviewStartRequest(BaseModel):
    candidate_email: Optional[str] = Field(default="candidate@example.com", description="Email of the candidate")
    level: str
    domain: str

class InterviewResponse(BaseModel):
    session_id: int
    task: dict  # title, description
    ws_url: str

class AdaptTaskResponse(BaseModel):
    task: dict
