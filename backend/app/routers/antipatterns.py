"""Anti-pattern detection API endpoints"""

from typing import Optional

from fastapi import APIRouter, Query

from app.models.schemas import (
    AntipatternListResponse,
    AntipatternSummaryResponse,
    AntipatternMatch,
    Severity,
    AntipatternType,
)
from app.services.data_reader import DataReader
from app.services.antipattern_engine import AntipatternEngine

router = APIRouter()


@router.get("/antipatterns", response_model=AntipatternListResponse)
async def list_antipatterns(
    project: Optional[str] = Query(None, description="Filter by project"),
    severity: Optional[Severity] = Query(None, description="Filter by severity"),
    type: Optional[list[AntipatternType]] = Query(None, description="Filter by type"),
    days: int = Query(7, ge=1, le=90, description="Number of days to analyze"),
    limit: int = Query(50, ge=1, le=200, description="Maximum results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    """
    Get list of detected anti-patterns with filtering and pagination.
    """
    reader = DataReader()
    engine = AntipatternEngine()

    # Load prompts
    prompts = await reader.get_prompts(project=project, days=days)

    # Detect anti-patterns
    all_matches = engine.detect_all(prompts)

    # Apply filters
    filtered = all_matches
    if severity:
        filtered = [m for m in filtered if m.severity == severity]
    if type:
        filtered = [m for m in filtered if m.type in type]

    # Calculate stats
    by_type = {}
    by_severity = {}
    for m in all_matches:
        by_type[m.type.value] = by_type.get(m.type.value, 0) + 1
        by_severity[m.severity.value] = by_severity.get(m.severity.value, 0) + 1

    # Paginate
    total = len(filtered)
    items = filtered[offset : offset + limit]

    return AntipatternListResponse(
        total=total,
        items=items,
        by_type=by_type,
        by_severity=by_severity,
    )


@router.get("/antipatterns/summary", response_model=AntipatternSummaryResponse)
async def get_antipattern_summary(
    project: Optional[str] = None,
    days: int = Query(7, ge=1, le=90),
):
    """
    Get summary of anti-patterns detected.
    """
    reader = DataReader()
    engine = AntipatternEngine()

    prompts = await reader.get_prompts(project=project, days=days)
    matches = engine.detect_all(prompts)

    # Calculate stats
    by_type = {}
    by_severity = {}
    for m in matches:
        by_type[m.type.value] = by_type.get(m.type.value, 0) + 1
        by_severity[m.severity.value] = by_severity.get(m.severity.value, 0) + 1

    # Most common patterns
    most_common = sorted(
        [{"type": k, "count": v} for k, v in by_type.items()],
        key=lambda x: x["count"],
        reverse=True,
    )[:5]

    return AntipatternSummaryResponse(
        total_detected=len(matches),
        by_type=by_type,
        by_severity=by_severity,
        most_common=most_common,
    )


@router.get("/antipatterns/{antipattern_id}", response_model=AntipatternMatch)
async def get_antipattern_detail(antipattern_id: str):
    """
    Get details of a specific anti-pattern instance.
    """
    # In a real implementation, this would fetch from a database
    # For MVP, we'll re-detect and find by ID
    reader = DataReader()
    engine = AntipatternEngine()

    prompts = await reader.get_prompts(days=30)
    matches = engine.detect_all(prompts)

    for match in matches:
        if match.id == antipattern_id:
            return match

    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Anti-pattern not found")
