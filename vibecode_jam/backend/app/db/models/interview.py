from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_email = Column(String(255), nullable=False)
    level = Column(String(50), nullable=True)
    domain = Column(String(100), nullable=True)
    status = Column(String(50), default="in_progress")
    final_score = Column(Integer, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    metadata = Column(JSON, default={})

    tasks = relationship("Task", back_populates="interview", cascade="all, delete-orphan")
    solutions = relationship("Solution", back_populates="interview", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="interview", cascade="all, delete-orphan")
