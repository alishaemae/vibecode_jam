from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True)
    solution_id = Column(Integer, ForeignKey("solutions.id", ondelete="CASCADE"), nullable=False)
    interview_id = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    score = Column(Integer)
    details = Column(JSON)
    is_flagged = Column(Boolean, default=False)
    log = Column(Text)

    solution = relationship("Solution", back_populates="metrics")
    interview = relationship("Interview", back_populates="metrics")
