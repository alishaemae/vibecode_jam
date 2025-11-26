from fastapi import FastAPI
from app.routers import interview, code, chat

app = FastAPI(title="Vibecode Jam Backend")

app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(code.router, prefix="/api/code", tags=["code"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
