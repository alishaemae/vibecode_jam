from pydantic import BaseModel
from uuid import UUID

class ChatMessageRequest(BaseModel):
    session_id: UUID
    message: str

class ChatMessageResponse(BaseModel):
    role: str
    message: str
