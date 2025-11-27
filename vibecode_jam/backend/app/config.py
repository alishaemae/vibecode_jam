import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "vibecode"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    REDIS_URL: str = "redis://redis:6379/0"

    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "http://scibox:8000")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "secret_api_key")

    DOCKER_TIMEOUT: int = 10  # sec
    DOCKER_MEM_LIMIT: str = "128m"
    DOCKER_CPU_QUOTA: int = 50000

    ENV: str = "development"

settings = Settings()
