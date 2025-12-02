"""AI Insights API endpoints

Provides AI-powered analysis of Claude Code usage patterns.
"""

from typing import Optional

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel, Field

from app.agents.llm_factory import LLMProvider, LLMFactory
from app.agents.graphs.insights_graph import run_insights_analysis


router = APIRouter()


class InsightItem(BaseModel):
    """Single insight item"""
    type: str = Field(description="Type: warning, tip, or achievement")
    title: str = Field(description="Short title")
    description: str = Field(description="Detailed description")
    impact: str = Field(description="Impact level: high, medium, low")
    actionable: Optional[str] = Field(default=None, description="Actionable suggestion")


class InsightsResponse(BaseModel):
    """Response for insights endpoint"""
    insights: list[InsightItem] = Field(description="List of AI-generated insights")
    summary: str = Field(description="Overall summary")
    health_score: Optional[float] = Field(default=None, description="Health score if available")
    error: Optional[str] = Field(default=None, description="Error message if failed")


class LLMProviderInfo(BaseModel):
    """Information about an LLM provider"""
    id: str
    name: str
    models: list[str]
    default_model: str
    configured: bool = Field(description="Whether API key is configured")


class LLMProvidersResponse(BaseModel):
    """Response for LLM providers endpoint"""
    providers: list[LLMProviderInfo]
    default_provider: str


@router.get("/insights", response_model=InsightsResponse)
async def get_ai_insights(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    project: Optional[str] = Query(None, description="Filter by project"),
    llm_provider: str = Query("openai", description="LLM provider to use"),
    llm_model: Optional[str] = Query(None, description="Specific model to use"),
):
    """
    Generate AI-powered insights from Claude Code usage data.

    This endpoint uses LangGraph to orchestrate the analysis:
    1. Loads health report, antipatterns, and statistics
    2. Generates insights using the specified LLM
    3. Performs deep analysis if health score is low
    """
    try:
        result = await run_insights_analysis(
            days=days,
            project=project,
            llm_provider=llm_provider,
            llm_model=llm_model,
        )

        # Extract health score from result
        health_score = None
        if result.get("health_report"):
            health_score = result["health_report"].get("overall_score")

        return InsightsResponse(
            insights=[InsightItem(**i) for i in result.get("insights", [])],
            summary=result.get("summary", ""),
            health_score=health_score,
            error=result.get("error"),
        )

    except Exception as e:
        return InsightsResponse(
            insights=[],
            summary="",
            health_score=None,
            error=f"Failed to generate insights: {str(e)}",
        )


@router.get("/insights/providers", response_model=LLMProvidersResponse)
async def get_llm_providers():
    """
    Get list of available LLM providers and their configuration status.
    """
    providers = []

    for provider in LLMProvider:
        try:
            models = LLMFactory.get_available_models(provider)
            default_model = LLMFactory.get_default_model(provider)
            configured = LLMFactory.is_api_key_configured(provider)

            providers.append(LLMProviderInfo(
                id=provider.value,
                name=provider.name.title(),
                models=models,
                default_model=default_model,
                configured=configured,
            ))
        except ValueError:
            continue

    # Determine default provider (first configured one, or openai)
    configured_providers = [p for p in providers if p.configured]
    default_provider = (
        configured_providers[0].id if configured_providers
        else LLMProvider.OPENAI.value
    )

    return LLMProvidersResponse(
        providers=providers,
        default_provider=default_provider,
    )


@router.get("/insights/health-check")
async def insights_health_check():
    """
    Check if the insights service is ready.
    Returns configured LLM providers and their status.
    """
    configured = LLMFactory.get_configured_providers()

    return {
        "status": "ready" if configured else "no_providers",
        "configured_providers": [p.value for p in configured],
        "message": (
            f"{len(configured)} LLM provider(s) configured"
            if configured
            else "No LLM providers configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or DEEPSEEK_API_KEY"
        ),
    }
