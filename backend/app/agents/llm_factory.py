"""
LLM Factory - Unified LLM Provider Factory using LangChain

Supports multiple LLM providers:
- OpenAI (GPT-4o, GPT-4, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- DeepSeek (DeepSeek Chat, DeepSeek Coder)
- Ollama (Local models: Llama, Mistral, etc.)
"""

import os
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field
from langchain_core.language_models import BaseChatModel


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    DEEPSEEK = "deepseek"
    OLLAMA = "ollama"


class LLMConfig(BaseModel):
    """Configuration for LLM provider"""
    provider: LLMProvider = Field(default=LLMProvider.OPENAI)
    model: Optional[str] = Field(default=None, description="Model name, uses default if not specified")
    api_key: Optional[str] = Field(default=None, description="API key, uses env var if not specified")
    base_url: Optional[str] = Field(default=None, description="Custom base URL for API")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=None, description="Max tokens for response")


class LLMFactory:
    """
    Unified LLM Provider Factory based on LangChain

    Usage:
        config = LLMConfig(provider=LLMProvider.OPENAI)
        llm = LLMFactory.create(config)
        response = llm.invoke("Hello!")
    """

    # Default configurations for each provider
    PROVIDER_CONFIGS = {
        LLMProvider.OPENAI: {
            "default_model": "gpt-4o",
            "env_key": "OPENAI_API_KEY",
            "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]
        },
        LLMProvider.ANTHROPIC: {
            "default_model": "claude-sonnet-4-20250514",
            "env_key": "ANTHROPIC_API_KEY",
            "models": ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"]
        },
        LLMProvider.DEEPSEEK: {
            "default_model": "deepseek-chat",
            "env_key": "DEEPSEEK_API_KEY",
            "base_url": "https://api.deepseek.com/v1",
            "models": ["deepseek-chat", "deepseek-coder"]
        },
        LLMProvider.OLLAMA: {
            "default_model": "llama3.2",
            "base_url": "http://localhost:11434",
            "models": ["llama3.2", "llama3.1", "mistral", "codellama", "qwen2.5"]
        }
    }

    @classmethod
    def create(cls, config: LLMConfig) -> BaseChatModel:
        """
        Create a LangChain chat model based on configuration

        Args:
            config: LLMConfig with provider, model, and optional settings

        Returns:
            BaseChatModel instance ready for use

        Raises:
            ValueError: If provider is not supported or required API key is missing
        """
        provider_config = cls.PROVIDER_CONFIGS.get(config.provider)
        if not provider_config:
            raise ValueError(f"Unsupported provider: {config.provider}")

        # Determine model to use
        model = config.model or provider_config["default_model"]

        # Common kwargs
        common_kwargs = {
            "temperature": config.temperature,
        }
        if config.max_tokens:
            common_kwargs["max_tokens"] = config.max_tokens

        # Map provider to creator function
        creator_map = {
            LLMProvider.OPENAI: cls._create_openai,
            LLMProvider.ANTHROPIC: cls._create_anthropic,
            LLMProvider.DEEPSEEK: cls._create_deepseek,
            LLMProvider.OLLAMA: cls._create_ollama,
        }
        creator = creator_map.get(config.provider)
        if not creator:
            raise ValueError(f"Unsupported provider: {config.provider}")
        return creator(config, model, common_kwargs)

    @classmethod
    def _create_openai(cls, config: LLMConfig, model: str, common_kwargs: dict) -> BaseChatModel:
        """Create OpenAI chat model"""
        from langchain_openai import ChatOpenAI

        api_key = config.api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key is required. Set OPENAI_API_KEY env var or provide api_key")

        return ChatOpenAI(
            model=model,
            api_key=api_key,
            base_url=config.base_url,
            **common_kwargs
        )

    @classmethod
    def _create_anthropic(cls, config: LLMConfig, model: str, common_kwargs: dict) -> BaseChatModel:
        """Create Anthropic chat model"""
        from langchain_anthropic import ChatAnthropic

        api_key = config.api_key or os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Anthropic API key is required. Set ANTHROPIC_API_KEY env var or provide api_key")

        return ChatAnthropic(
            model=model,
            api_key=api_key,
            **common_kwargs
        )

    @classmethod
    def _create_deepseek(cls, config: LLMConfig, model: str, common_kwargs: dict) -> BaseChatModel:
        """Create DeepSeek chat model (uses OpenAI-compatible API)"""
        from langchain_openai import ChatOpenAI

        api_key = config.api_key or os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise ValueError("DeepSeek API key is required. Set DEEPSEEK_API_KEY env var or provide api_key")

        base_url = config.base_url or cls.PROVIDER_CONFIGS[LLMProvider.DEEPSEEK]["base_url"]

        return ChatOpenAI(
            model=model,
            api_key=api_key,
            base_url=base_url,
            **common_kwargs
        )

    @classmethod
    def _create_ollama(cls, config: LLMConfig, model: str, common_kwargs: dict) -> BaseChatModel:
        """Create Ollama chat model for local inference"""
        from langchain_ollama import ChatOllama

        base_url = config.base_url or cls.PROVIDER_CONFIGS[LLMProvider.OLLAMA]["base_url"]

        return ChatOllama(
            model=model,
            base_url=base_url,
            **common_kwargs
        )

    @classmethod
    def get_available_models(cls, provider: LLMProvider) -> list[str]:
        """Get list of available models for a provider

        Raises:
            ValueError: If provider is not supported
        """
        provider_config = cls.PROVIDER_CONFIGS.get(provider)
        if not provider_config:
            raise ValueError(f"Unsupported provider: {provider}")
        return provider_config.get("models", [])

    @classmethod
    def get_default_model(cls, provider: LLMProvider) -> str:
        """Get default model for a provider"""
        provider_config = cls.PROVIDER_CONFIGS.get(provider)
        if not provider_config:
            raise ValueError(f"Unsupported provider: {provider}")
        return provider_config["default_model"]

    @classmethod
    def is_api_key_configured(cls, provider: LLMProvider) -> bool:
        """Check if API key is configured for a provider"""
        if provider == LLMProvider.OLLAMA:
            return True  # Ollama doesn't require API key

        provider_config = cls.PROVIDER_CONFIGS.get(provider)
        if not provider_config:
            return False

        env_key = provider_config.get("env_key")
        return bool(os.getenv(env_key)) if env_key else False

    @classmethod
    def get_configured_providers(cls) -> list[LLMProvider]:
        """Get list of providers that have API keys configured"""
        return [
            provider for provider in LLMProvider
            if cls.is_api_key_configured(provider)
        ]
