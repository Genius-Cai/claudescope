"""Pydantic schemas for API responses"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Severity(str, Enum):
    """Anti-pattern severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AntipatternType(str, Enum):
    """Types of anti-patterns"""
    TOOTHPASTE = "toothpaste"  # 挤牙膏
    RAW_PASTE = "raw_paste"  # 原始粘贴
    VAGUE_INSTRUCTION = "vague_instruction"  # 模糊指令
    CONTEXT_EXPLOSION = "context_explosion"  # 上下文爆炸


# === Prompt Data Models ===

class PromptCategory(str, Enum):
    """Prompt categories for classification"""
    CODE_GENERATION = "code_generation"
    BUG_FIX = "bug_fix"
    CODE_REVIEW = "code_review"
    REFACTORING = "refactoring"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    CONFIG_SETUP = "config_setup"
    GIT_OPERATIONS = "git_operations"
    FILE_OPERATIONS = "file_operations"
    SEARCH_EXPLORE = "search_explore"
    EXTENDED_THINKING = "extended_thinking"
    QUESTION = "question"
    CHINESE_LANGUAGE = "chinese_language"
    GENERAL = "general"


class PromptData(BaseModel):
    """Single prompt data from history"""
    text: str
    timestamp: datetime
    project: str
    session_id: Optional[str] = None
    char_count: int = 0
    has_code_block: bool = False
    has_thinking_trigger: bool = False
    thinking_triggers: list[str] = Field(default_factory=list)
    has_image: bool = False
    categories: list[PromptCategory] = Field(default_factory=list)


class SessionData(BaseModel):
    """Session data with multiple prompts"""
    session_id: str
    project: str
    prompts: list[PromptData]
    total_prompts: int
    start_time: datetime
    end_time: datetime
    total_input_tokens: int = 0
    total_output_tokens: int = 0


# === Anti-pattern Models ===

class AntipatternMatch(BaseModel):
    """A detected anti-pattern instance"""
    id: str
    type: AntipatternType
    severity: Severity
    prompt_excerpt: str = Field(max_length=200)
    timestamp: datetime
    project: str
    session_id: Optional[str] = None
    confidence: float = Field(ge=0, le=1)
    explanation: str
    fix_suggestion: str


class AntipatternListResponse(BaseModel):
    """Response for anti-pattern list endpoint"""
    total: int
    items: list[AntipatternMatch]
    by_type: dict[str, int]
    by_severity: dict[str, int]


class AntipatternSummaryResponse(BaseModel):
    """Summary of anti-patterns"""
    total_detected: int
    by_type: dict[str, int]
    by_severity: dict[str, int]
    most_common: list[dict]


# === Health Report Models ===

class DimensionScore(BaseModel):
    """Score for a single dimension"""
    name: str
    score: float = Field(ge=0, le=100)
    weight: float = Field(ge=0, le=1)
    issues: list[str] = Field(default_factory=list)


class HealthReportResponse(BaseModel):
    """Health report response"""
    timestamp: datetime
    overall_score: float = Field(ge=0, le=100)
    grade: str = Field(pattern="^[A-F]$")
    dimensions: list[DimensionScore]
    total_prompts_analyzed: int
    period_days: int
    improvement_suggestions: list[str]
    trend_vs_last_week: Optional[float] = None


# === Statistics Models ===

class ThinkingStats(BaseModel):
    """Extended thinking usage statistics"""
    total_triggers: int
    by_trigger_word: dict[str, int]
    by_project: dict[str, int]
    by_day: list[dict]
    average_per_session: float


class TokenStats(BaseModel):
    """Token usage statistics"""
    total_tokens: int
    input_tokens: int
    output_tokens: int
    cache_read_tokens: int
    cache_creation_tokens: int
    by_model: dict[str, int]
    by_project: dict[str, int]


class CategoryStats(BaseModel):
    """Category distribution statistics"""
    total_categorized: int
    by_category: dict[str, int]
    by_category_percentage: dict[str, float]
    prompts_with_images: int
    image_percentage: float


class StatisticsOverviewResponse(BaseModel):
    """Overview statistics response"""
    period_days: int
    thinking: ThinkingStats
    tokens: TokenStats
    categories: Optional[CategoryStats] = None
    sessions_count: int
    projects_count: int
    prompts_count: int
    average_prompts_per_session: float
    average_prompt_length: float
