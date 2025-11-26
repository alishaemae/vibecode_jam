from sqlalchemy import Column, String, Integer, JSON, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_email = Column(String, nullable=False)
    level = Column(String)
    domain = Column(String)
    started_at = Column(TIMESTAMP, default=datetime.utcnow)
    completed_at = Column(TIMESTAMP, nullable=True)
    status = Column(String, default="in_progress")
    final_score = Column(Integer, nullable=True)
    metadata = Column(JSON, default={})

class Task(Base):
    __tablename__ = "tasks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    description = Column(String)
    level = Column(String)
    domain = Column(String)
    task_data = Column(JSON, default={})
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    times_used = Column(Integer, default=0)

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id"))
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"))
    code = Column(String)
    language = Column(String)
    submitted_at = Column(TIMESTAMP, default=datetime.utcnow)
    execution_time_ms = Column(Integer, nullable=True)
    visible_tests_passed = Column(Integer, nullable=True)
    hidden_tests_passed = Column(Integer, nullable=True)
    evaluation = Column(JSON, default={})
    suspicious_score = Column(Integer, nullable=True)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    interview_id = Column(UUID(as_uuid=True), ForeignKey("interviews.id"))
    role = Column(String)  # ai/candidate
    message = Column(String)
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    evaluation = Column(JSON, default={})
