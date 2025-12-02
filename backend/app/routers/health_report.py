"""Health Report API endpoints"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import HealthReportResponse, DimensionScore
from app.services.health_scorer import HealthScorer
from app.services.data_reader import DataReader

router = APIRouter()


@router.get("/health-report", response_model=HealthReportResponse)
async def get_health_report(
    project: Optional[str] = Query(None, description="Filter by project"),
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze"),
):
    """
    Get prompt health report with overall score and dimension breakdown.
    """
    reader = DataReader()
    scorer = HealthScorer()

    # Load data
    prompts = await reader.get_prompts(project=project, days=days)
    antipatterns = await reader.get_antipatterns(project=project, days=days)

    # Calculate health score
    report = scorer.calculate_health_report(prompts, antipatterns, days)

    return report


@router.get("/health-report/trend")
async def get_health_trend(
    period: str = Query("week", pattern="^(day|week|month)$"),
    project: Optional[str] = None,
):
    """
    Get health score trend over time.
    """
    reader = DataReader()
    scorer = HealthScorer()

    # Calculate trend data
    trend_data = await scorer.calculate_trend(reader, period, project)

    return {"period": period, "trend": trend_data}
