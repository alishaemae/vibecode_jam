from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)  # ai/candidate
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    evaluation = Column(JSON, default={})
