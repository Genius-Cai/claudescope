"""Anti-pattern Detection Engine

Detects common anti-patterns in Claude Code usage:
1. Toothpaste (挤牙膏) - Short, fragmented prompts
2. Raw Paste (原始粘贴) - Large code dumps without context
3. Vague Instruction (模糊指令) - Unclear, unspecific prompts
4. Context Explosion (上下文爆炸) - Sessions that grow too large
"""

import re
import hashlib
from datetime import datetime
from typing import Optional
from collections import defaultdict

from app.models.schemas import (
    PromptData,
    SessionData,
    AntipatternMatch,
    AntipatternType,
    Severity,
)


class AntipatternEngine:
    """Engine for detecting anti-patterns in prompt usage"""

    # Toothpaste detection thresholds
    SHORT_PROMPT_THRESHOLD = 20  # characters
    CONSECUTIVE_SHORT_COUNT = 3  # triggers detection

    # Raw paste detection
    CODE_RATIO_THRESHOLD = 0.7  # 70% code = raw paste
    MIN_PASTE_LENGTH = 100

    # Vague instruction patterns
    VAGUE_WORDS = [
        "帮我", "搞一下", "弄一个", "做一下",
        "优化一下", "改改", "看看", "处理",
        "合适的", "好的", "正确的", "漂亮的",
        "更好", "更快", "更优", "等等", "之类的",
        "你先试试", "这里不对", "有问题",
    ]

    FOLLOWUP_PATTERNS = [
        r"^(还有|另外|补充一下|对了|顺便)",
        r"^(再|也|还).*一下",
        r"^(那|那么).*(呢|吗)\??$",
        r"^刚才.*忘了说",
        r"^我忘记说了",
    ]

    # Context explosion thresholds
    SESSION_LENGTH_WARNING = 50  # prompts
    SESSION_LENGTH_CRITICAL = 100

    def __init__(self):
        self._rules = [
            self._detect_toothpaste,
            self._detect_raw_paste,
            self._detect_vague_instruction,
        ]

    def detect_all(self, prompts: list[PromptData]) -> list[AntipatternMatch]:
        """
        Run all detection rules on a list of prompts.

        Args:
            prompts: List of prompt data to analyze

        Returns:
            List of detected anti-pattern matches
        """
        matches = []

        # Group prompts by session for context-aware detection
        session_prompts: dict[str, list[PromptData]] = defaultdict(list)
        for prompt in prompts:
            session_id = prompt.session_id or "unknown"
            session_prompts[session_id].append(prompt)

        # Sort each session's prompts by timestamp
        for session_id in session_prompts:
            session_prompts[session_id].sort(key=lambda p: p.timestamp)

        # Run detection rules
        for session_id, session in session_prompts.items():
            for i, prompt in enumerate(session):
                context = {
                    "session_id": session_id,
                    "previous_prompts": session[:i],
                    "position_in_session": i,
                    "session_length": len(session),
                }

                for rule in self._rules:
                    rule_matches = rule(prompt, context)
                    matches.extend(rule_matches)

        # Detect session-level anti-patterns
        for session_id, session in session_prompts.items():
            matches.extend(self._detect_context_explosion(session, session_id))

        return matches

    def _detect_toothpaste(
        self,
        prompt: PromptData,
        context: dict,
    ) -> list[AntipatternMatch]:
        """
        Detect toothpaste pattern (挤牙膏).

        Triggers when:
        1. Current prompt is short (<20 chars) AND
        2. Previous 2+ prompts were also short AND
        3. Not a simple confirmation/yes/no
        """
        matches = []
        text = prompt.text.strip()

        # Skip simple confirmations
        confirmations = ["yes", "no", "ok", "好", "是", "否", "y", "n", "确定", "取消"]
        if text.lower() in confirmations:
            return matches

        # Check if current prompt is short
        if len(text) >= self.SHORT_PROMPT_THRESHOLD:
            return matches

        # Count consecutive short prompts
        previous = context.get("previous_prompts", [])
        consecutive_short = 0

        for prev in reversed(previous[-5:]):  # Look at last 5
            if len(prev.text.strip()) < self.SHORT_PROMPT_THRESHOLD:
                consecutive_short += 1
            else:
                break

        # Trigger if we have consecutive short prompts
        if consecutive_short >= self.CONSECUTIVE_SHORT_COUNT - 1:
            matches.append(AntipatternMatch(
                id=self._generate_id(prompt, "toothpaste"),
                type=AntipatternType.TOOTHPASTE,
                severity=Severity.MEDIUM if consecutive_short < 5 else Severity.HIGH,
                prompt_excerpt=text[:100],
                timestamp=prompt.timestamp,
                project=prompt.project,
                session_id=prompt.session_id,
                confidence=min(0.5 + consecutive_short * 0.1, 0.95),
                explanation=f"连续 {consecutive_short + 1} 条短 prompt (<{self.SHORT_PROMPT_THRESHOLD}字)，信息碎片化严重",
                fix_suggestion="将相关需求整合到一个完整的 prompt 中，一次性说清楚背景、目标和约束",
            ))

        # Also check for followup patterns
        for pattern in self.FOLLOWUP_PATTERNS:
            if re.search(pattern, text):
                matches.append(AntipatternMatch(
                    id=self._generate_id(prompt, "toothpaste_followup"),
                    type=AntipatternType.TOOTHPASTE,
                    severity=Severity.LOW,
                    prompt_excerpt=text[:100],
                    timestamp=prompt.timestamp,
                    project=prompt.project,
                    session_id=prompt.session_id,
                    confidence=0.7,
                    explanation="检测到追问模式，这个信息可以在初始提问时一起提供",
                    fix_suggestion="在首次提问时就包含所有相关信息和需求",
                ))
                break

        return matches

    def _detect_raw_paste(
        self,
        prompt: PromptData,
        context: dict,
    ) -> list[AntipatternMatch]:
        """
        Detect raw paste pattern (原始粘贴).

        Triggers when:
        1. Large code block (>70% of content) without explanation
        2. Error stacktrace without context
        3. Large paste with minimal description
        """
        matches = []
        text = prompt.text

        if len(text) < self.MIN_PASTE_LENGTH:
            return matches

        # Detect code blocks
        code_blocks = re.findall(r"```[\s\S]*?```", text)
        code_length = sum(len(block) for block in code_blocks)
        code_ratio = code_length / len(text) if len(text) > 0 else 0

        # Get non-code text
        non_code_text = re.sub(r"```[\s\S]*?```", "", text).strip()
        has_explanation = len(non_code_text) > 30

        # Detect error stacktrace
        has_stacktrace = bool(re.search(
            r"(Traceback|Error:|Exception:|at \w+\.\w+\(|Stack trace:|panic:)",
            text
        ))

        # Rule 1: High code ratio without explanation
        if code_ratio > self.CODE_RATIO_THRESHOLD and not has_explanation:
            matches.append(AntipatternMatch(
                id=self._generate_id(prompt, "raw_paste_code"),
                type=AntipatternType.RAW_PASTE,
                severity=Severity.HIGH,
                prompt_excerpt=text[:150] + "..." if len(text) > 150 else text,
                timestamp=prompt.timestamp,
                project=prompt.project,
                session_id=prompt.session_id,
                confidence=0.85,
                explanation=f"代码占比 {code_ratio:.0%}，但缺少问题描述和期望结果",
                fix_suggestion="在代码前添加：1) 问题描述 2) 期望行为 3) 已尝试的方案",
            ))

        # Rule 2: Stacktrace without context
        if has_stacktrace and not has_explanation:
            matches.append(AntipatternMatch(
                id=self._generate_id(prompt, "raw_paste_error"),
                type=AntipatternType.RAW_PASTE,
                severity=Severity.CRITICAL,
                prompt_excerpt=text[:150] + "..." if len(text) > 150 else text,
                timestamp=prompt.timestamp,
                project=prompt.project,
                session_id=prompt.session_id,
                confidence=0.9,
                explanation="直接粘贴错误信息而未说明触发场景和期望",
                fix_suggestion="说明：1) 触发错误的操作 2) 环境信息 3) 期望的正确行为",
            ))

        # Rule 3: Very long paste (likely copy-paste without thought)
        if len(text) > 2000 and not has_explanation:
            matches.append(AntipatternMatch(
                id=self._generate_id(prompt, "raw_paste_long"),
                type=AntipatternType.RAW_PASTE,
                severity=Severity.MEDIUM,
                prompt_excerpt=text[:150] + "..." if len(text) > 150 else text,
                timestamp=prompt.timestamp,
                project=prompt.project,
                session_id=prompt.session_id,
                confidence=0.75,
                explanation=f"大段内容 ({len(text)} 字符) 缺少上下文说明",
                fix_suggestion="添加简要说明：这是什么内容？你希望我做什么？",
            ))

        return matches

    def _detect_vague_instruction(
        self,
        prompt: PromptData,
        context: dict,
    ) -> list[AntipatternMatch]:
        """
        Detect vague instruction pattern (模糊指令).

        Triggers when:
        1. Multiple vague words in a short prompt
        2. Very short instruction without specifics
        3. Open-ended request without criteria
        """
        matches = []
        text = prompt.text.strip()

        # Skip if it's a question (likely clarifying)
        if text.endswith("?") or text.endswith("？"):
            return matches

        # Count vague words
        text_lower = text.lower()
        found_vague = [w for w in self.VAGUE_WORDS if w in text_lower]

        # Rule 1: Multiple vague words
        if len(found_vague) >= 2:
            matches.append(AntipatternMatch(
                id=self._generate_id(prompt, "vague_words"),
                type=AntipatternType.VAGUE_INSTRUCTION,
                severity=Severity.MEDIUM,
                prompt_excerpt=text[:100],
                timestamp=prompt.timestamp,
                project=prompt.project,
                session_id=prompt.session_id,
                confidence=0.7,
                explanation=f"模糊词汇: {', '.join(found_vague[:3])}，可能导致结果不符合预期",
                fix_suggestion="用具体的数值、标准或示例替代模糊表达",
            ))

        # Rule 2: Very short instruction (not a question)
        if len(text) < 15 and not text.endswith(("?", "？")):
            matches.append(AntipatternMatch(
                id=self._generate_id(prompt, "vague_short"),
                type=AntipatternType.VAGUE_INSTRUCTION,
                severity=Severity.HIGH,
                prompt_excerpt=text,
                timestamp=prompt.timestamp,
                project=prompt.project,
                session_id=prompt.session_id,
                confidence=0.8,
                explanation=f"指令仅 {len(text)} 字，缺乏必要的上下文和约束",
                fix_suggestion="添加：背景信息、具体要求、输出格式、约束条件",
            ))

        return matches

    def _detect_context_explosion(
        self,
        session_prompts: list[PromptData],
        session_id: str,
    ) -> list[AntipatternMatch]:
        """
        Detect context explosion pattern (上下文爆炸).

        Triggers when a session grows too long without reset.
        """
        matches = []
        session_length = len(session_prompts)

        if session_length < self.SESSION_LENGTH_WARNING:
            return matches

        # Get the last prompt for timestamp
        last_prompt = session_prompts[-1] if session_prompts else None
        if not last_prompt:
            return matches

        if session_length >= self.SESSION_LENGTH_CRITICAL:
            severity = Severity.CRITICAL
            confidence = 0.95
        else:
            severity = Severity.HIGH
            confidence = 0.85

        matches.append(AntipatternMatch(
            id=self._generate_id(last_prompt, f"context_explosion_{session_length}"),
            type=AntipatternType.CONTEXT_EXPLOSION,
            severity=severity,
            prompt_excerpt=f"Session with {session_length} prompts",
            timestamp=last_prompt.timestamp,
            project=last_prompt.project,
            session_id=session_id,
            confidence=confidence,
            explanation=f"会话已有 {session_length} 条消息，上下文可能过大影响性能",
            fix_suggestion="考虑使用 /clear 开启新会话，或总结当前进展后重新开始",
        ))

        return matches

    def _generate_id(self, prompt: PromptData, rule_name: str) -> str:
        """Generate a unique ID for an anti-pattern match"""
        content = f"{prompt.timestamp.isoformat()}_{prompt.text[:50]}_{rule_name}"
        return hashlib.md5(content.encode()).hexdigest()[:12]
