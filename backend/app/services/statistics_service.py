"""Statistics Service - Calculate usage statistics"""

from datetime import datetime, timedelta
from collections import defaultdict
from typing import Optional

from app.models.schemas import (
    PromptData,
    SessionData,
    StatisticsOverviewResponse,
    ThinkingStats,
    TokenStats,
)


class StatisticsService:
    """Service for calculating usage statistics"""

    def calculate_overview(
        self,
        prompts: list[PromptData],
        sessions: list[SessionData],
        days: int,
    ) -> StatisticsOverviewResponse:
        """Calculate overview statistics"""
        thinking_stats = self.calculate_thinking_stats(prompts, sessions, "day")
        token_stats = self.calculate_token_stats(sessions, "model")

        # Calculate basic metrics
        projects = set(p.project for p in prompts)
        total_prompts = len(prompts)
        avg_prompts_per_session = (
            total_prompts / len(sessions) if sessions else 0
        )
        avg_prompt_length = (
            sum(p.char_count for p in prompts) / total_prompts
            if total_prompts > 0 else 0
        )

        return StatisticsOverviewResponse(
            period_days=days,
            thinking=thinking_stats,
            tokens=token_stats,
            sessions_count=len(sessions),
            projects_count=len(projects),
            prompts_count=total_prompts,
            average_prompts_per_session=round(avg_prompts_per_session, 1),
            average_prompt_length=round(avg_prompt_length, 1),
        )

    def calculate_thinking_stats(
        self,
        prompts: list[PromptData],
        sessions: list[SessionData],
        group_by: str,
    ) -> ThinkingStats:
        """Calculate extended thinking usage statistics"""
        # Count triggers
        total_triggers = sum(1 for p in prompts if p.has_thinking_trigger)

        # Group by trigger word
        by_trigger_word: dict[str, int] = defaultdict(int)
        for p in prompts:
            for trigger in p.thinking_triggers:
                by_trigger_word[trigger] += 1

        # Group by project
        by_project: dict[str, int] = defaultdict(int)
        for p in prompts:
            if p.has_thinking_trigger:
                by_project[p.project] += 1

        # Group by day
        by_day: list[dict] = []
        if group_by == "day":
            day_counts: dict[str, int] = defaultdict(int)
            for p in prompts:
                if p.has_thinking_trigger:
                    day_key = p.timestamp.strftime("%Y-%m-%d")
                    day_counts[day_key] += 1

            for day, count in sorted(day_counts.items()):
                by_day.append({"date": day, "count": count})

        # Calculate average per session
        sessions_with_thinking = set()
        for p in prompts:
            if p.has_thinking_trigger and p.session_id:
                sessions_with_thinking.add(p.session_id)

        avg_per_session = (
            total_triggers / len(sessions_with_thinking)
            if sessions_with_thinking else 0
        )

        return ThinkingStats(
            total_triggers=total_triggers,
            by_trigger_word=dict(by_trigger_word),
            by_project=dict(by_project),
            by_day=by_day,
            average_per_session=round(avg_per_session, 2),
        )

    def calculate_token_stats(
        self,
        sessions: list[SessionData],
        group_by: str,
    ) -> TokenStats:
        """Calculate token usage statistics"""
        total_input = sum(s.total_input_tokens for s in sessions)
        total_output = sum(s.total_output_tokens for s in sessions)
        total_tokens = total_input + total_output

        # Group by model (would need model info in session data)
        # For now, use placeholder
        by_model: dict[str, int] = {"claude-3": total_tokens}

        # Group by project
        by_project: dict[str, int] = defaultdict(int)
        for s in sessions:
            by_project[s.project] += s.total_input_tokens + s.total_output_tokens

        return TokenStats(
            total_tokens=total_tokens,
            input_tokens=total_input,
            output_tokens=total_output,
            cache_read_tokens=0,  # Would need to track this
            cache_creation_tokens=0,
            by_model=by_model,
            by_project=dict(by_project),
        )

    def calculate_project_stats(
        self,
        sessions: list[SessionData],
    ) -> list[dict]:
        """Calculate per-project statistics"""
        project_data: dict[str, dict] = defaultdict(
            lambda: {
                "name": "",
                "sessions": 0,
                "prompts": 0,
                "tokens": 0,
                "thinking_triggers": 0,
            }
        )

        for s in sessions:
            project_data[s.project]["name"] = s.project
            project_data[s.project]["sessions"] += 1
            project_data[s.project]["prompts"] += s.total_prompts
            project_data[s.project]["tokens"] += (
                s.total_input_tokens + s.total_output_tokens
            )

            # Count thinking triggers
            for p in s.prompts:
                if p.has_thinking_trigger:
                    project_data[s.project]["thinking_triggers"] += 1

        # Sort by prompts (most active first)
        sorted_projects = sorted(
            project_data.values(),
            key=lambda x: x["prompts"],
            reverse=True,
        )

        return sorted_projects
