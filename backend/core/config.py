"""Application configuration using pydantic-settings."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:root@localhost:5432/foodstore_db",
        description="Database connection URL (PostgreSQL) - Override with real DB for production",
    )

    # JWT Security
    SECRET_KEY: str = Field(
        default="dev-secret-key-change-in-production-minimum-32-chars",
        description="Secret key for JWT token signing (min 32 characters)",
    )
    ALGORITHM: str = Field(
        default="HS256",
        description="JWT signing algorithm",
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=30,
        description="JWT access token expiration in minutes",
    )
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(
        default=7,
        description="JWT refresh token expiration in days",
    )

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        description="Allowed origins for CORS",
    )

    # Environment
    ENVIRONMENT: str = Field(
        default="development",
        description="Environment (development, staging, production)",
    )
    DEBUG: bool = Field(
        default=True,
        description="Enable debug mode",
    )


# Global settings instance
settings = Settings()
