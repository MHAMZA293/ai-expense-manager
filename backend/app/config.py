"""
Centralized app configuration, loaded from environment variables / .env
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "change-this-to-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite:///./expense_manager.db"

    OPENAI_API_KEY: str = ""
    TESSERACT_CMD: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
