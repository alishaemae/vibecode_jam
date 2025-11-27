import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import interview, code, chat
from app.services.scibox import (
    SciboxClient, TaskGenerator, SolutionEvaluator,
    AIDialogue, AntiCheatLLM, EmbeddingSearch
)
from app.services.cache import RedisCache
from app.services.mock_task_generator import MockTaskGenerator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global service instances
scibox_client: SciboxClient = None
task_generator: TaskGenerator = None
solution_evaluator: SolutionEvaluator = None
ai_dialogue: AIDialogue = None
anti_cheat_llm: AntiCheatLLM = None
embedding_search: EmbeddingSearch = None
cache: RedisCache = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown
    """
    global scibox_client, task_generator, solution_evaluator
    global ai_dialogue, anti_cheat_llm, embedding_search, cache

    # Startup
    logger.info("Starting VibeCode Jam Backend...")

    # Initialize Scibox client
    try:
        scibox_api_key = os.getenv("SCIBOX_API_KEY", "sk-Jw0mXI7PMgeFYVCW8e8PKw")
        scibox_client = SciboxClient(api_key=scibox_api_key)
        await scibox_client.__aenter__()
        logger.info("Scibox client initialized")

        # Initialize services
        task_generator = TaskGenerator(scibox_client)
        solution_evaluator = SolutionEvaluator(scibox_client)
        ai_dialogue = AIDialogue(scibox_client)
        anti_cheat_llm = AntiCheatLLM(scibox_client)
        embedding_search = EmbeddingSearch(scibox_client)
        logger.info("All Scibox services initialized")
    except Exception as e:
        logger.warning(f"Scibox initialization failed: {e}. Using mock services for development.")
        scibox_client = None
        task_generator = MockTaskGenerator()
        solution_evaluator = None
        ai_dialogue = None
        anti_cheat_llm = None
        embedding_search = None
        logger.info("Mock services initialized")

    # Initialize cache
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    cache = RedisCache(redis_url)
    await cache.connect()

    yield

    # Shutdown
    logger.info("Shutting down VibeCode Jam Backend...")
    await scibox_client.__aexit__(None, None, None)
    await cache.disconnect()
    logger.info("Shutdown complete")


app = FastAPI(
    title="VibeCode Jam Backend",
    description="AI-powered coding interview platform with Scibox LLM",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(code.router, prefix="/api/code", tags=["code"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - redirects to API documentation"""
    return {
        "message": "VibeCode Jam Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Health check endpoints
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "services": {
            "scibox": "connected" if scibox_client else "disconnected",
            "cache": "connected" if cache and cache.redis else "disconnected"
        }
    }


@app.get("/api/health/detailed")
async def detailed_health():
    """Detailed health check with service stats"""
    cache_stats = await cache.get_stats() if cache else {"status": "unavailable"}

    return {
        "status": "healthy",
        "services": {
            "scibox": {
                "status": "connected" if scibox_client else "disconnected",
                "rate_limiter": "active"
            },
            "cache": cache_stats,
            "embedding_search": {
                "solutions_cached": embedding_search.get_stats() if embedding_search else {}
            }
        }
    }
