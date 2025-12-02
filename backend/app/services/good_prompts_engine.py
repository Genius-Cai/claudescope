"""Good Prompts Engine - Identifies and scores high-quality prompts

This engine analyzes prompts to identify well-structured, effective prompts
that demonstrate best practices in AI collaboration.
"""

import re
from typing import Optional
from app.models.schemas import PromptData, PromptCategory


class GoodPromptsEngine:
    """Engine for identifying and scoring good prompts"""

    # Scoring weights for different quality dimensions
    QUALITY_DIMENSIONS = {
        "clarity": 0.25,        # Clear, specific instructions
        "context": 0.20,        # Provides necessary context
        "structure": 0.20,      # Well-organized request
        "specificity": 0.20,    # Specific rather than vague
        "efficiency": 0.15,     # Concise yet complete
    }

    # Patterns indicating high-quality prompts
    POSITIVE_PATTERNS = {
        "clarity": [
            r"please\s+(implement|create|build|add|fix|update|refactor)",
            r"I\s+need\s+(to|a|an)",
            r"can\s+you\s+(help|assist|implement|create)",
            r"要\s*(实现|创建|添加|修复)",  # Chinese: need to implement/create/add/fix
        ],
        "context": [
            r"currently\s+(the|my|we|I)",
            r"the\s+(current|existing)\s+",
            r"background:\s*",
            r"context:\s*",
            r"目前\s*",  # Chinese: currently
            r"现在\s*",  # Chinese: now
        ],
        "structure": [
            r"^\d+\.\s+",  # Numbered lists
            r"^-\s+",  # Bullet points
            r"first,?\s+",
            r"then,?\s+",
            r"finally,?\s+",
            r"step\s+\d+:",
            r"首先",  # Chinese: first
            r"然后",  # Chinese: then
            r"最后",  # Chinese: finally
        ],
        "specificity": [
            r"\bfunction\s+\w+",
            r"\bclass\s+\w+",
            r"\bfile\s+[\w/]+\.\w+",
            r"in\s+the\s+\w+\s+(file|folder|directory|component)",
            r"using\s+(the\s+)?\w+\s+(library|framework|package)",
            r"在\s*[\w/]+\s*(文件|目录)",  # Chinese: in file/directory
        ],
        "efficiency": [
            # Prompts that are substantial but not excessively long
            # This is handled separately by length analysis
        ],
    }

    # Negative patterns that reduce quality score
    NEGATIVE_PATTERNS = [
        r"^(help|fix|do|make)\s*$",  # Too vague
        r"^(error|bug|issue|problem)\s*$",  # No context
        r"^(this|it|that)\s+(is\s+)?broken",  # Vague reference
        r"doesn't?\s+work",  # No specifics
        r"^(.{1,20})$",  # Too short (less than 20 chars)
    ]

    # Quality indicators for code prompts
    CODE_QUALITY_PATTERNS = [
        r"with\s+(proper|good|appropriate)\s+(error|exception)\s+handling",
        r"include\s+(tests?|testing)",
        r"add\s+(comments?|documentation|docstrings?)",
        r"follow\s+\w+\s+(conventions?|style|patterns?)",
        r"type\s*(hints?|annotations?)",
    ]

    def score_prompt(self, prompt: PromptData) -> dict:
        """
        Score a prompt across multiple quality dimensions.

        Returns:
            dict with:
                - overall_score: 0-100
                - dimension_scores: dict of dimension -> score
                - quality_indicators: list of detected positive patterns
                - reasons: list of reasons for the score
        """
        text = prompt.text
        text_lower = text.lower()

        dimension_scores = {}
        quality_indicators = []
        reasons = []

        # Score each dimension
        for dimension, weight in self.QUALITY_DIMENSIONS.items():
            score, indicators = self._score_dimension(dimension, text, text_lower)
            dimension_scores[dimension] = score
            quality_indicators.extend(indicators)

        # Check for negative patterns
        negative_count = 0
        for pattern in self.NEGATIVE_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                negative_count += 1

        # Calculate length score component
        length_score = self._score_length(text)
        dimension_scores["efficiency"] = length_score

        # Check for code quality patterns
        for pattern in self.CODE_QUALITY_PATTERNS:
            if re.search(pattern, text_lower):
                quality_indicators.append("code_best_practice")
                reasons.append("Requests best practices")

        # Check for thinking trigger usage
        if prompt.has_thinking_trigger:
            quality_indicators.append("uses_extended_thinking")
            reasons.append("Uses extended thinking for complex tasks")

        # Check for categories that typically indicate good prompts
        if PromptCategory.CODE_GENERATION in prompt.categories:
            if prompt.char_count > 100:
                quality_indicators.append("detailed_code_request")
                reasons.append("Detailed code generation request")

        if PromptCategory.REFACTORING in prompt.categories:
            quality_indicators.append("refactoring_intent")
            reasons.append("Shows refactoring mindset")

        # Calculate overall score
        weighted_sum = sum(
            dimension_scores[dim] * weight
            for dim, weight in self.QUALITY_DIMENSIONS.items()
        )

        # Apply negative penalty
        penalty = negative_count * 15
        overall_score = max(0, min(100, weighted_sum - penalty))

        # Add bonus for multiple quality indicators
        bonus = min(20, len(set(quality_indicators)) * 3)
        overall_score = min(100, overall_score + bonus)

        # Generate reasons based on dimension scores
        if dimension_scores["clarity"] >= 70:
            reasons.append("Clear and specific instructions")
        if dimension_scores["context"] >= 70:
            reasons.append("Provides good context")
        if dimension_scores["structure"] >= 70:
            reasons.append("Well-structured request")
        if dimension_scores["specificity"] >= 70:
            reasons.append("Specific rather than vague")
        if dimension_scores["efficiency"] >= 70:
            reasons.append("Good length - concise yet complete")

        return {
            "overall_score": round(overall_score, 1),
            "dimension_scores": {k: round(v, 1) for k, v in dimension_scores.items()},
            "quality_indicators": list(set(quality_indicators)),
            "reasons": list(set(reasons)),
        }

    def _score_dimension(self, dimension: str, text: str, text_lower: str) -> tuple[float, list[str]]:
        """Score a single dimension and return score + matched indicators"""
        patterns = self.POSITIVE_PATTERNS.get(dimension, [])
        matches = 0
        indicators = []

        for pattern in patterns:
            if re.search(pattern, text_lower, re.MULTILINE | re.IGNORECASE):
                matches += 1
                indicators.append(f"{dimension}_{matches}")

        # Base score starts at 50, each match adds points
        score = min(100, 50 + matches * 15)
        return score, indicators

    def _score_length(self, text: str) -> float:
        """Score the prompt length - optimal is 100-500 chars"""
        length = len(text)

        if length < 30:
            return 20  # Too short
        elif length < 50:
            return 40
        elif length < 100:
            return 60
        elif length < 200:
            return 80
        elif length < 500:
            return 100  # Optimal range
        elif length < 1000:
            return 85
        elif length < 2000:
            return 70
        elif length < 5000:
            return 60
        else:
            return 40  # Very long - might be context explosion

    def get_good_prompts(
        self,
        prompts: list[PromptData],
        min_score: float = 65,
        limit: int = 50,
    ) -> list[dict]:
        """
        Get the best prompts from a list, sorted by score.

        Args:
            prompts: List of prompts to analyze
            min_score: Minimum score threshold
            limit: Maximum number of prompts to return

        Returns:
            List of dicts with prompt data and scores
        """
        scored_prompts = []

        for prompt in prompts:
            # Skip very short prompts
            if len(prompt.text) < 30:
                continue

            # Skip prompts that are mostly code blocks
            code_block_ratio = len(re.findall(r"```[\s\S]*?```", prompt.text)) / max(1, len(prompt.text) / 100)
            if code_block_ratio > 3:  # More than 3 code blocks per 100 chars
                continue

            score_result = self.score_prompt(prompt)

            if score_result["overall_score"] >= min_score:
                scored_prompts.append({
                    "prompt": prompt,
                    "score": score_result["overall_score"],
                    "dimension_scores": score_result["dimension_scores"],
                    "quality_indicators": score_result["quality_indicators"],
                    "reasons": score_result["reasons"],
                })

        # Sort by score descending
        scored_prompts.sort(key=lambda x: x["score"], reverse=True)

        return scored_prompts[:limit]

    def get_summary_stats(self, prompts: list[PromptData]) -> dict:
        """Get summary statistics about prompt quality"""
        if not prompts:
            return {
                "total_analyzed": 0,
                "average_score": 0,
                "good_prompt_count": 0,
                "excellent_prompt_count": 0,
                "improvement_potential": 0,
            }

        scores = []
        for prompt in prompts:
            if len(prompt.text) >= 30:
                score_result = self.score_prompt(prompt)
                scores.append(score_result["overall_score"])

        if not scores:
            return {
                "total_analyzed": 0,
                "average_score": 0,
                "good_prompt_count": 0,
                "excellent_prompt_count": 0,
                "improvement_potential": 0,
            }

        good_count = sum(1 for s in scores if s >= 65)
        excellent_count = sum(1 for s in scores if s >= 85)
        avg_score = sum(scores) / len(scores)

        return {
            "total_analyzed": len(scores),
            "average_score": round(avg_score, 1),
            "good_prompt_count": good_count,
            "excellent_prompt_count": excellent_count,
            "good_percentage": round(good_count / len(scores) * 100, 1),
            "improvement_potential": round(100 - avg_score, 1),
        }
