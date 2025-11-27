from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import ARRAY, FLOAT
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True)
    solution_id = Column(Integer, ForeignKey("solutions.id", ondelete="CASCADE"), nullable=False)
    kind = Column(String(64), nullable=False)
    vector = Column(ARRAY(FLOAT), nullable=False)
    hash = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    solution = relationship("Solution", back_populates="embeddings")
