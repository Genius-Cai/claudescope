"""Application configuration using Pydantic Settings"""

import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "ClaudeScope"
    app_version: str = "0.1.0"
    debug: bool = True

    # API
    api_prefix: str = "/api"

    # Claude Code data paths
    claude_home: Path = Path.home() / ".claude"
    history_file: Path = Path.home() / ".claude" / "history.jsonl"
    projects_dir: Path = Path.home() / ".claude" / "projects"

    # Database
    database_url: str = "sqlite+aiosqlite:///./claudescope.db"

    # LLM API Keys (for AI insights)
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    deepseek_api_key: Optional[str] = None

    # Ollama settings (local LLM)
    ollama_base_url: str = "http://localhost:11434"

    # Default LLM provider
    default_llm_provider: str = "openai"
    default_llm_model: Optional[str] = None

    # CORS
    cors_origins: list[str] = ["http://localhost:4000", "http://127.0.0.1:4000"]

    @property
    def claude_data_exists(self) -> bool:
        """Check if Claude Code data directory exists"""
        return self.claude_home.exists() and self.history_file.exists()


settings = Settings()
