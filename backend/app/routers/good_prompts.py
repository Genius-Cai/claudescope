"""Good Prompts API endpoints"""

from typing import Optional
import random

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from datetime import datetime

from app.services.data_reader import DataReader
from app.services.good_prompts_engine import GoodPromptsEngine


router = APIRouter()


class GoodPromptItem(BaseModel):
    """A good prompt with scoring details"""
    text: str
    excerpt: str = Field(description="Truncated text for display")
    project: str
    timestamp: datetime
    score: float
    dimension_scores: dict[str, float]
    reasons: list[str]
    categories: list[str]


class GoodPromptsListResponse(BaseModel):
    """Response for good prompts list"""
    total: int
    items: list[GoodPromptItem]
    average_score: float
    summary: dict


class RandomGoodPromptResponse(BaseModel):
    """Response for random good prompt"""
    text: str
    excerpt: str
    project: str
    timestamp: datetime
    score: float
    reasons: list[str]
    why_good: str


@router.get("/good-prompts", response_model=GoodPromptsListResponse)
async def list_good_prompts(
    project: Optional[str] = Query(None, description="Filter by project"),
    days: int = Query(30, ge=1, le=90, description="Number of days to analyze"),
    min_score: float = Query(65, ge=0, le=100, description="Minimum quality score"),
    limit: int = Query(50, ge=1, le=200, description="Maximum results"),
):
    """
    Get list of good prompts with quality scores.
    """
    reader = DataReader()
    engine = GoodPromptsEngine()

    # Load prompts
    prompts = await reader.get_prompts(project=project, days=days)

    # Get good prompts
    good_prompts = engine.get_good_prompts(prompts, min_score=min_score, limit=limit)

    # Get summary stats
    summary = engine.get_summary_stats(prompts)

    # Convert to response items
    items = []
    for gp in good_prompts:
        prompt = gp["prompt"]
        text = prompt.text

        # Create excerpt (first 150 chars, clean)
        excerpt = text[:150].strip()
        if len(text) > 150:
            excerpt += "..."

        items.append(GoodPromptItem(
            text=text,
            excerpt=excerpt,
            project=prompt.project,
            timestamp=prompt.timestamp,
            score=gp["score"],
            dimension_scores=gp["dimension_scores"],
            reasons=gp["reasons"],
            categories=[c.value for c in prompt.categories],
        ))

    return GoodPromptsListResponse(
        total=len(items),
        items=items,
        average_score=summary["average_score"],
        summary=summary,
    )


@router.get("/good-prompts/random", response_model=RandomGoodPromptResponse)
async def get_random_good_prompt(
    project: Optional[str] = Query(None, description="Filter by project"),
    days: int = Query(30, ge=1, le=90, description="Number of days to analyze"),
    min_score: float = Query(70, ge=0, le=100, description="Minimum quality score"),
):
    """
    Get a random good prompt to display as an example.
    """
    reader = DataReader()
    engine = GoodPromptsEngine()

    # Load prompts
    prompts = await reader.get_prompts(project=project, days=days)

    # Get good prompts with higher threshold for random display
    good_prompts = engine.get_good_prompts(prompts, min_score=min_score, limit=100)

    if not good_prompts:
        # Return a default if no good prompts found
        return RandomGoodPromptResponse(
            text="No good prompts found yet. Keep prompting!",
            excerpt="No good prompts found yet.",
            project="N/A",
            timestamp=datetime.now(),
            score=0,
            reasons=["Start writing clear, specific prompts to build your collection"],
            why_good="Write clear, context-rich prompts to appear here!",
        )

    # Pick a random good prompt
    selected = random.choice(good_prompts)
    prompt = selected["prompt"]
    text = prompt.text

    # Create excerpt (first 200 chars for display)
    excerpt = text[:200].strip()
    if len(text) > 200:
        # Try to cut at a word boundary
        last_space = excerpt.rfind(" ")
        if last_space > 100:
            excerpt = excerpt[:last_space]
        excerpt += "..."

    # Generate "why good" explanation
    reasons = selected["reasons"]
    why_good = _generate_why_good(selected, prompt)

    return RandomGoodPromptResponse(
        text=text,
        excerpt=excerpt,
        project=prompt.project,
        timestamp=prompt.timestamp,
        score=selected["score"],
        reasons=reasons,
        why_good=why_good,
    )


@router.get("/good-prompts/summary")
async def get_good_prompts_summary(
    project: Optional[str] = Query(None, description="Filter by project"),
    days: int = Query(30, ge=1, le=90, description="Number of days to analyze"),
):
    """
    Get summary statistics about prompt quality.
    """
    reader = DataReader()
    engine = GoodPromptsEngine()

    prompts = await reader.get_prompts(project=project, days=days)
    summary = engine.get_summary_stats(prompts)

    return summary


def _generate_why_good(scored_prompt: dict, prompt) -> str:
    """Generate a human-readable explanation of why the prompt is good"""
    reasons = scored_prompt["reasons"]
    score = scored_prompt["score"]
    dimension_scores = scored_prompt["dimension_scores"]

    # Find the strongest dimensions
    top_dimensions = sorted(
        dimension_scores.items(),
        key=lambda x: x[1],
        reverse=True
    )[:2]

    explanations = []

    # Add dimension-based explanations
    for dim, dim_score in top_dimensions:
        if dim_score >= 70:
            if dim == "clarity":
                explanations.append("clear and actionable request")
            elif dim == "context":
                explanations.append("provides good context")
            elif dim == "structure":
                explanations.append("well-organized structure")
            elif dim == "specificity":
                explanations.append("specific details included")
            elif dim == "efficiency":
                explanations.append("concise yet complete")

    # Add reason-based explanations
    if "Uses extended thinking for complex tasks" in reasons:
        explanations.append("uses extended thinking")
    if "Requests best practices" in reasons:
        explanations.append("follows best practices")

    if not explanations:
        explanations = ["well-crafted prompt"]

    # Format the explanation
    if len(explanations) == 1:
        why_good = f"This prompt scores {score:.0f}/100 because it's a {explanations[0]}."
    else:
        why_good = f"This prompt scores {score:.0f}/100 - {explanations[0]} with {explanations[1]}."

    return why_good
