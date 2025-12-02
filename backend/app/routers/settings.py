"""Settings API endpoints

Provides API key management and configuration.
"""

import os
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.agents.llm_factory import LLMProvider, LLMFactory, LLMConfig


router = APIRouter()


# Get the backend directory (where .env should be)
BACKEND_DIR = Path(__file__).parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class SaveAPIKeyRequest(BaseModel):
    """Request to save an API key"""
    provider: str = Field(description="Provider ID: openai, anthropic, deepseek, ollama")
    api_key: str = Field(description="The API key to save")


class SaveAPIKeyResponse(BaseModel):
    """Response after saving API key"""
    success: bool
    message: str
    provider: str


class TestAPIKeyRequest(BaseModel):
    """Request to test an API key"""
    provider: str = Field(description="Provider ID: openai, anthropic, deepseek, ollama")
    api_key: str = Field(description="The API key to test")


class TestAPIKeyResponse(BaseModel):
    """Response after testing API key"""
    valid: bool
    message: str
    provider: str
    model_tested: Optional[str] = None


# Map provider ID to environment variable name
PROVIDER_ENV_VARS = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "ollama": "OLLAMA_BASE_URL",
}


def read_env_file() -> dict[str, str]:
    """Read existing .env file into a dictionary"""
    env_vars = {}
    if ENV_FILE.exists():
        with open(ENV_FILE, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key.strip()] = value.strip()
    return env_vars


def write_env_file(env_vars: dict[str, str]) -> None:
    """Write dictionary back to .env file with comments"""
    content = """# ClaudeScope Backend Configuration
# LLM Provider API Keys

"""
    # Group by provider
    provider_comments = {
        "OPENAI_API_KEY": "# OpenAI - GPT-4o, GPT-4, etc.",
        "ANTHROPIC_API_KEY": "# Anthropic - Claude 3.5, Claude 3, etc.",
        "DEEPSEEK_API_KEY": "# DeepSeek - DeepSeek Chat, Coder",
        "OLLAMA_BASE_URL": "# Ollama - Local models (default: http://localhost:11434)",
    }

    # Write known provider keys first
    for env_key in PROVIDER_ENV_VARS.values():
        if env_key in env_vars:
            comment = provider_comments.get(env_key, "")
            if comment:
                content += f"{comment}\n"
            content += f"{env_key}={env_vars[env_key]}\n\n"

    # Write any other variables
    for key, value in env_vars.items():
        if key not in PROVIDER_ENV_VARS.values():
            content += f"{key}={value}\n"

    with open(ENV_FILE, "w") as f:
        f.write(content)


@router.post("/settings/api-key", response_model=SaveAPIKeyResponse)
async def save_api_key(request: SaveAPIKeyRequest):
    """
    Save an API key to the .env file.

    This will create or update the .env file in the backend directory.
    The server needs to be restarted to pick up new environment variables.
    """
    provider_id = request.provider.lower()

    if provider_id not in PROVIDER_ENV_VARS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown provider: {provider_id}. Valid providers: {list(PROVIDER_ENV_VARS.keys())}"
        )

    env_var = PROVIDER_ENV_VARS[provider_id]
    api_key = request.api_key.strip()

    # Basic validation
    if not api_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    # For non-Ollama providers, check key format
    if provider_id != "ollama":
        # OpenAI keys typically start with sk-
        if provider_id == "openai" and not api_key.startswith("sk-"):
            raise HTTPException(
                status_code=400,
                detail="OpenAI API keys typically start with 'sk-'"
            )

    try:
        # Read existing env vars
        env_vars = read_env_file()

        # Update the key
        env_vars[env_var] = api_key

        # Write back
        write_env_file(env_vars)

        # Also update the current process environment
        os.environ[env_var] = api_key

        return SaveAPIKeyResponse(
            success=True,
            message=f"API key saved to .env. The key is now active.",
            provider=provider_id
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save API key: {str(e)}"
        )


@router.post("/settings/test-api-key", response_model=TestAPIKeyResponse)
async def test_api_key(request: TestAPIKeyRequest):
    """
    Test if an API key is valid by making a simple API call.

    This will attempt to create an LLM instance and make a minimal request.
    """
    provider_id = request.provider.lower()

    if provider_id not in PROVIDER_ENV_VARS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown provider: {provider_id}"
        )

    api_key = request.api_key.strip()

    if not api_key:
        return TestAPIKeyResponse(
            valid=False,
            message="API key cannot be empty",
            provider=provider_id
        )

    try:
        # Map string to enum
        provider_enum = LLMProvider(provider_id)

        # Get default model for this provider
        default_model = LLMFactory.get_default_model(provider_enum)

        # Create config with the provided API key
        config = LLMConfig(
            provider=provider_enum,
            model=default_model,
            api_key=api_key,
            temperature=0.1,
            max_tokens=10  # Minimal tokens for test
        )

        # Create LLM instance
        llm = LLMFactory.create(config)

        # Make a simple test call
        response = llm.invoke("Say 'OK' if you can hear me.")

        # If we get here without error, the key is valid
        return TestAPIKeyResponse(
            valid=True,
            message="API key is valid and working!",
            provider=provider_id,
            model_tested=default_model
        )

    except ValueError as e:
        return TestAPIKeyResponse(
            valid=False,
            message=f"Invalid configuration: {str(e)}",
            provider=provider_id
        )
    except Exception as e:
        error_msg = str(e).lower()

        # Parse common error messages
        if "invalid api key" in error_msg or "unauthorized" in error_msg or "401" in error_msg:
            return TestAPIKeyResponse(
                valid=False,
                message="Invalid API key. Please check your key and try again.",
                provider=provider_id
            )
        elif "rate limit" in error_msg or "429" in error_msg:
            # Rate limited means the key is valid!
            return TestAPIKeyResponse(
                valid=True,
                message="API key is valid (rate limited, but working)",
                provider=provider_id
            )
        elif "insufficient" in error_msg or "quota" in error_msg:
            return TestAPIKeyResponse(
                valid=True,
                message="API key is valid but has insufficient quota/credits",
                provider=provider_id
            )
        else:
            return TestAPIKeyResponse(
                valid=False,
                message=f"Connection error: {str(e)[:100]}",
                provider=provider_id
            )


@router.get("/settings/env-status")
async def get_env_status():
    """
    Get the current status of environment configuration.

    Returns which providers have API keys configured.
    """
    env_vars = read_env_file()

    status = {}
    for provider_id, env_var in PROVIDER_ENV_VARS.items():
        # Check both .env file and current environment
        in_file = env_var in env_vars and bool(env_vars[env_var])
        in_env = bool(os.getenv(env_var))

        status[provider_id] = {
            "env_var": env_var,
            "in_file": in_file,
            "in_environment": in_env,
            "configured": in_file or in_env,
            # Show masked key if exists
            "key_preview": mask_key(env_vars.get(env_var) or os.getenv(env_var, ""))
        }

    return {
        "env_file_path": str(ENV_FILE),
        "env_file_exists": ENV_FILE.exists(),
        "providers": status
    }


def mask_key(key: str) -> str:
    """Mask an API key for display, showing only first and last 4 chars"""
    if not key or len(key) < 12:
        return "****" if key else ""
    return f"{key[:4]}...{key[-4:]}"
