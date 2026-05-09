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

    # Frontend URL (for email links)
    FRONTEND_URL: str = Field(
        default="http://localhost:5173",
        description="Frontend base URL for building links in emails",
    )

    # Email (SMTP)
    MAIL_HOST: str | None = Field(
        default=None,
        description="SMTP server hostname",
    )
    MAIL_PORT: int = Field(
        default=587,
        description="SMTP server port (587 for STARTTLS, 465 for SSL)",
    )
    MAIL_USERNAME: str | None = Field(
        default=None,
        description="SMTP username",
    )
    MAIL_PASSWORD: str | None = Field(
        default=None,
        description="SMTP password",
    )
    MAIL_FROM: str | None = Field(
        default=None,
        description="Sender email address (From:)",
    )
    MAIL_STARTTLS: bool = Field(
        default=True,
        description="Use STARTTLS for email",
    )
    MAIL_SSL_TLS: bool = Field(
        default=False,
        description="Use SSL/TLS for email",
    )

    @property
    def mail_configured(self) -> bool:
        """Check if email is fully configured."""
        return all([
            self.MAIL_HOST,
            self.MAIL_FROM,
        ])


# Global settings instance
settings = Settings()
