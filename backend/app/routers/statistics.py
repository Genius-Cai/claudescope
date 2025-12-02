"""Statistics API endpoints"""

from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import StatisticsOverviewResponse, ThinkingStats, TokenStats
from app.services.data_reader import DataReader
from app.services.statistics_service import StatisticsService

router = APIRouter()


@router.get("/statistics/overview", response_model=StatisticsOverviewResponse)
async def get_statistics_overview(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    project: Optional[str] = Query(None, description="Filter by project"),
):
    """
    Get overview statistics for Claude Code usage.
    """
    reader = DataReader()
    stats_service = StatisticsService()

    # Load all data
    prompts = await reader.get_prompts(project=project, days=days)
    sessions = await reader.get_sessions(project=project, days=days)

    # Calculate statistics
    overview = stats_service.calculate_overview(prompts, sessions, days)

    return overview


@router.get("/statistics/thinking", response_model=ThinkingStats)
async def get_thinking_stats(
    days: int = Query(30, ge=1, le=365),
    group_by: str = Query("day", pattern="^(day|week|project)$"),
    project: Optional[str] = None,
):
    """
    Get extended thinking usage statistics.
    """
    reader = DataReader()
    stats_service = StatisticsService()

    prompts = await reader.get_prompts(project=project, days=days)
    sessions = await reader.get_sessions(project=project, days=days)

    thinking_stats = stats_service.calculate_thinking_stats(prompts, sessions, group_by)

    return thinking_stats


@router.get("/statistics/tokens", response_model=TokenStats)
async def get_token_stats(
    days: int = Query(30, ge=1, le=365),
    group_by: str = Query("model", pattern="^(model|project|day)$"),
    project: Optional[str] = None,
):
    """
    Get token usage statistics.
    """
    reader = DataReader()
    stats_service = StatisticsService()

    sessions = await reader.get_sessions(project=project, days=days)

    token_stats = stats_service.calculate_token_stats(sessions, group_by)

    return token_stats


@router.get("/statistics/projects")
async def get_project_stats(days: int = Query(30, ge=1, le=365)):
    """
    Get per-project statistics.
    """
    reader = DataReader()
    stats_service = StatisticsService()

    sessions = await reader.get_sessions(days=days)

    project_stats = stats_service.calculate_project_stats(sessions)

    return {"projects": project_stats}
