"""Centralized application configuration using Pydantic Settings."""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    # Application
    app_name: str = Field(default="SentinelAI", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        alias="ENVIRONMENT",
    )
    debug: bool = Field(default=False, alias="DEBUG")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=8000, alias="PORT")

    # MongoDB
    mongo_uri: str = Field(
        default="",
        alias="MONGO_URI",
    )
    mongo_db: str = Field(
        default="sentinelai",
        alias="MONGO_DB",
    )

    # Neo4j
    neo4j_uri: str = Field(default="bolt://localhost:7687", alias="NEO4J_URI")
    neo4j_username: str = Field(default="neo4j", alias="NEO4J_USERNAME")
    neo4j_password: str = Field(default="neo4j_secret", alias="NEO4J_PASSWORD")

    # AI Services
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    hf_space_name: str = Field(
        default="Divyaksh1209/cybersec-prototype",
        alias="HF_SPACE_NAME",
    )
    hf_token: str = Field(default="", alias="HF_TOKEN")

    # Security
    secret_key: str = Field(
        default="change-me-to-a-long-random-secret-key-in-production",
        alias="SECRET_KEY",
    )

    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Ingestion
    max_upload_size_mb: int = Field(default=10, alias="MAX_UPLOAD_SIZE_MB")
    min_text_length: int = Field(default=10, alias="MIN_TEXT_LENGTH")
    article_fetch_timeout: int = Field(default=30, alias="ARTICLE_FETCH_TIMEOUT")
    article_user_agent: str = Field(
        default="SentinelAI/0.1.0 (+https://sentinelai.local)",
        alias="ARTICLE_USER_AGENT",
    )
    default_country: str = Field(default="IN", alias="DEFAULT_COUNTRY")
    ocr_enabled: bool = Field(default=True, alias="OCR_ENABLED")



    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024



    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def api_v1_prefix(self) -> str:
        return "/api/v1"


@lru_cache
def get_settings() -> Settings:
    """Return cached settings singleton for dependency injection."""
    return Settings()
