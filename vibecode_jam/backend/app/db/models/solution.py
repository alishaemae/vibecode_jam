from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Solution(Base):
    __tablename__ = "solutions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    execution_time_ms = Column(Integer, nullable=True)
    visible_tests_passed = Column(Integer, nullable=True)
    hidden_tests_passed = Column(Integer, nullable=True)
    evaluation = Column(JSON, default={})
    suspicious_score = Column(Integer, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interview = relationship("Interview", back_populates="solutions")
    task = relationship("Task", back_populates="solutions")
    metrics = relationship("Metric", back_populates="solution", cascade="all, delete-orphan")
    embeddings = relationship("Embedding", back_populates="solution", cascade="all, delete-orphan")
