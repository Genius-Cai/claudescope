"""Health Scorer - Calculate prompt health scores

Dimensions:
1. Clarity (清晰度) - How clear and specific are the prompts
2. Completeness (完整性) - Do prompts provide enough context
3. Efficiency (效率) - Token/round-trip efficiency
4. Context Management (上下文管理) - Session hygiene
"""

from datetime import datetime
from typing import Optional

from app.models.schemas import (
    PromptData,
    AntipatternMatch,
    HealthReportResponse,
    DimensionScore,
    AntipatternType,
    Severity,
)


class HealthScorer:
    """Calculate health scores for prompt usage"""

    # Dimension weights
    WEIGHTS = {
        "clarity": 0.30,
        "completeness": 0.25,
        "efficiency": 0.25,
        "context_management": 0.20,
    }

    # Grade thresholds
    GRADE_THRESHOLDS = {
        "A": 85,
        "B": 70,
        "C": 55,
        "D": 40,
        "F": 0,
    }

    def calculate_health_report(
        self,
        prompts: list[PromptData],
        antipatterns: list[AntipatternMatch],
        days: int,
    ) -> HealthReportResponse:
        """
        Calculate comprehensive health report.

        Args:
            prompts: List of prompt data
            antipatterns: List of detected anti-patterns
            days: Period in days

        Returns:
            HealthReportResponse with scores and suggestions
        """
        if not prompts:
            return self._empty_report(days)

        # Calculate dimension scores
        clarity = self._score_clarity(prompts, antipatterns)
        completeness = self._score_completeness(prompts, antipatterns)
        efficiency = self._score_efficiency(prompts, antipatterns)
        context_mgmt = self._score_context_management(prompts, antipatterns)

        dimensions = [clarity, completeness, efficiency, context_mgmt]

        # Calculate overall score
        overall_score = sum(
            d.score * d.weight for d in dimensions
        )

        # Determine grade
        grade = self._calculate_grade(overall_score)

        # Generate suggestions
        suggestions = self._generate_suggestions(dimensions, antipatterns)

        return HealthReportResponse(
            timestamp=datetime.now(),
            overall_score=round(overall_score, 1),
            grade=grade,
            dimensions=dimensions,
            total_prompts_analyzed=len(prompts),
            period_days=days,
            improvement_suggestions=suggestions,
            trend_vs_last_week=None,  # Would need historical data
        )

    async def calculate_trend(
        self,
        reader,  # DataReader
        period: str,
        project: Optional[str],
    ) -> list[dict]:
        """Calculate health score trend over time"""
        # Simplified trend calculation
        # In a full implementation, this would calculate scores for each period
        return []

    def _score_clarity(
        self,
        prompts: list[PromptData],
        antipatterns: list[AntipatternMatch],
    ) -> DimensionScore:
        """Score clarity dimension"""
        issues = []
        score = 100.0

        # Penalize vague instructions
        vague_count = sum(
            1 for ap in antipatterns
            if ap.type == AntipatternType.VAGUE_INSTRUCTION
        )
        if vague_count > 0:
            penalty = min(vague_count * 5, 40)
            score -= penalty
            issues.append(f"{vague_count} 个模糊指令")

        # Check average prompt length (very short = likely unclear)
        avg_length = sum(p.char_count for p in prompts) / len(prompts) if prompts else 0
        if avg_length < 30:
            score -= 20
            issues.append(f"平均 prompt 长度过短 ({avg_length:.0f} 字)")
        elif avg_length < 50:
            score -= 10
            issues.append(f"平均 prompt 长度偏短 ({avg_length:.0f} 字)")

        return DimensionScore(
            name="clarity",
            score=max(0, min(100, score)),
            weight=self.WEIGHTS["clarity"],
            issues=issues,
        )

    def _score_completeness(
        self,
        prompts: list[PromptData],
        antipatterns: list[AntipatternMatch],
    ) -> DimensionScore:
        """Score completeness dimension"""
        issues = []
        score = 100.0

        # Penalize raw paste (missing context)
        raw_paste_count = sum(
            1 for ap in antipatterns
            if ap.type == AntipatternType.RAW_PASTE
        )
        if raw_paste_count > 0:
            penalty = min(raw_paste_count * 8, 50)
            score -= penalty
            issues.append(f"{raw_paste_count} 个缺少上下文的粘贴")

        # Penalize toothpaste (fragmented info)
        toothpaste_count = sum(
            1 for ap in antipatterns
            if ap.type == AntipatternType.TOOTHPASTE
        )
        if toothpaste_count > 0:
            penalty = min(toothpaste_count * 3, 30)
            score -= penalty
            issues.append(f"{toothpaste_count} 个碎片化 prompt")

        return DimensionScore(
            name="completeness",
            score=max(0, min(100, score)),
            weight=self.WEIGHTS["completeness"],
            issues=issues,
        )

    def _score_efficiency(
        self,
        prompts: list[PromptData],
        antipatterns: list[AntipatternMatch],
    ) -> DimensionScore:
        """Score efficiency dimension"""
        issues = []
        score = 100.0

        if not prompts:
            return DimensionScore(
                name="efficiency",
                score=score,
                weight=self.WEIGHTS["efficiency"],
                issues=issues,
            )

        # Calculate prompts per unique task (estimated by session)
        sessions = set(p.session_id for p in prompts if p.session_id)
        if sessions:
            prompts_per_session = len(prompts) / len(sessions)
            if prompts_per_session > 10:
                score -= 20
                issues.append(f"平均每会话 {prompts_per_session:.1f} 次交互，偏高")
            elif prompts_per_session > 5:
                score -= 10
                issues.append(f"平均每会话 {prompts_per_session:.1f} 次交互")

        # Penalize toothpaste (inefficient back-and-forth)
        toothpaste_count = sum(
            1 for ap in antipatterns
            if ap.type == AntipatternType.TOOTHPASTE
        )
        if toothpaste_count > 0:
            penalty = min(toothpaste_count * 5, 30)
            score -= penalty

        # Check thinking trigger usage (positive factor)
        thinking_usage = sum(1 for p in prompts if p.has_thinking_trigger)
        thinking_ratio = thinking_usage / len(prompts) if prompts else 0
        if thinking_ratio > 0.1:
            score += 5  # Bonus for using extended thinking
            issues.append(f"Extended thinking 使用率 {thinking_ratio:.0%} (良好)")

        return DimensionScore(
            name="efficiency",
            score=max(0, min(100, score)),
            weight=self.WEIGHTS["efficiency"],
            issues=issues,
        )

    def _score_context_management(
        self,
        prompts: list[PromptData],
        antipatterns: list[AntipatternMatch],
    ) -> DimensionScore:
        """Score context management dimension"""
        issues = []
        score = 100.0

        # Penalize context explosion
        explosion_count = sum(
            1 for ap in antipatterns
            if ap.type == AntipatternType.CONTEXT_EXPLOSION
        )
        if explosion_count > 0:
            # Critical issue
            critical = sum(
                1 for ap in antipatterns
                if ap.type == AntipatternType.CONTEXT_EXPLOSION
                and ap.severity == Severity.CRITICAL
            )
            penalty = explosion_count * 15 + critical * 10
            score -= min(penalty, 60)
            issues.append(f"{explosion_count} 个上下文爆炸会话")

        return DimensionScore(
            name="context_management",
            score=max(0, min(100, score)),
            weight=self.WEIGHTS["context_management"],
            issues=issues,
        )

    def _calculate_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        for grade, threshold in self.GRADE_THRESHOLDS.items():
            if score >= threshold:
                return grade
        return "F"

    def _generate_suggestions(
        self,
        dimensions: list[DimensionScore],
        antipatterns: list[AntipatternMatch],
    ) -> list[str]:
        """Generate improvement suggestions based on scores"""
        suggestions = []

        # Find lowest scoring dimensions
        sorted_dims = sorted(dimensions, key=lambda d: d.score)

        for dim in sorted_dims[:2]:  # Focus on worst 2
            if dim.score < 70:
                if dim.name == "clarity":
                    suggestions.append(
                        "提高清晰度：用具体的数值、示例和约束条件替代模糊表达"
                    )
                elif dim.name == "completeness":
                    suggestions.append(
                        "提高完整性：粘贴代码/错误时添加问题描述、环境信息和期望结果"
                    )
                elif dim.name == "efficiency":
                    suggestions.append(
                        "提高效率：一次性提供完整需求，减少来回追问"
                    )
                elif dim.name == "context_management":
                    suggestions.append(
                        "优化上下文：长对话后使用 /clear 开启新会话"
                    )

        # Add specific suggestions based on common anti-patterns
        type_counts = {}
        for ap in antipatterns:
            type_counts[ap.type] = type_counts.get(ap.type, 0) + 1

        if type_counts.get(AntipatternType.TOOTHPASTE, 0) > 5:
            suggestions.append(
                "减少碎片化：写 prompt 前先整理好所有需求点"
            )

        if type_counts.get(AntipatternType.RAW_PASTE, 0) > 3:
            suggestions.append(
                "避免原始粘贴：用 '我遇到了X问题，代码如下...' 的结构"
            )

        return suggestions[:5]  # Limit to 5 suggestions

    def _empty_report(self, days: int) -> HealthReportResponse:
        """Return empty report when no data"""
        return HealthReportResponse(
            timestamp=datetime.now(),
            overall_score=0,
            grade="F",
            dimensions=[],
            total_prompts_analyzed=0,
            period_days=days,
            improvement_suggestions=["没有找到可分析的数据"],
            trend_vs_last_week=None,
        )
