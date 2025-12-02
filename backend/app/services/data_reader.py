"""JSONL Data Reader for Claude Code history files

Parses:
- ~/.claude/history.jsonl (global prompt history)
- ~/.claude/projects/*/[uuid].jsonl (project-level conversations)
"""

import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional
from collections import defaultdict
import hashlib

from app.core.config import settings
from app.models.schemas import PromptData, SessionData, PromptCategory


class DataReader:
    """Reader for Claude Code history data"""

    # Known thinking trigger words
    THINKING_TRIGGERS = [
        "ultrathink",
        "megathink",
        "think harder",
        "think deeply",
        "think step by step",
    ]

    def __init__(self):
        self.claude_home = settings.claude_home
        self.history_file = settings.history_file
        self.projects_dir = settings.projects_dir

    async def get_prompts(
        self,
        project: Optional[str] = None,
        days: int = 7,
        limit: Optional[int] = None,
    ) -> list[PromptData]:
        """
        Get prompt data from history files.

        Args:
            project: Filter by project path (substring match)
            days: Number of days to look back
            limit: Maximum number of prompts to return

        Returns:
            List of PromptData objects
        """
        prompts = []
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        # Read from history.jsonl (global history)
        if self.history_file.exists():
            prompts.extend(self._read_history_file(cutoff, project))

        # Read from project files for more detailed data
        if self.projects_dir.exists():
            prompts.extend(self._read_project_files(cutoff, project))

        # Sort by timestamp descending
        prompts.sort(key=lambda p: p.timestamp, reverse=True)

        # Remove duplicates (same text + timestamp)
        seen = set()
        unique_prompts = []
        for p in prompts:
            key = f"{p.text[:100]}_{p.timestamp.isoformat()}"
            if key not in seen:
                seen.add(key)
                unique_prompts.append(p)

        if limit:
            return unique_prompts[:limit]
        return unique_prompts

    async def get_sessions(
        self,
        project: Optional[str] = None,
        days: int = 7,
    ) -> list[SessionData]:
        """
        Get session data from project files.

        Args:
            project: Filter by project path
            days: Number of days to look back

        Returns:
            List of SessionData objects
        """
        sessions = []
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)

        if not self.projects_dir.exists():
            return sessions

        # Group prompts by session
        session_prompts: dict[str, list[PromptData]] = defaultdict(list)
        session_meta: dict[str, dict] = {}

        for project_dir in self.projects_dir.iterdir():
            if not project_dir.is_dir():
                continue

            for jsonl_file in project_dir.glob("*.jsonl"):
                session_data = self._parse_session_file(jsonl_file, cutoff, project)
                if session_data:
                    sessions.append(session_data)

        return sessions

    async def get_antipatterns(
        self,
        project: Optional[str] = None,
        days: int = 7,
    ) -> list:
        """Placeholder for cached antipattern results"""
        # In a full implementation, this would read from a cache/database
        return []

    def _read_history_file(
        self,
        cutoff: datetime,
        project_filter: Optional[str] = None,
    ) -> list[PromptData]:
        """Read from ~/.claude/history.jsonl"""
        prompts = []

        try:
            with open(self.history_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        data = json.loads(line)
                        timestamp = self._parse_timestamp(data.get("timestamp"))

                        if timestamp and timestamp >= cutoff:
                            raw_project = data.get("project", "")

                            # Convert raw path to smart project name
                            project = self._normalize_project_path(raw_project)

                            # Apply project filter
                            if project_filter and project_filter not in project:
                                continue

                            text = data.get("display", "")
                            if not text:
                                continue

                            prompt = self._create_prompt_data(
                                text=text,
                                timestamp=timestamp,
                                project=project,
                                session_id=data.get("sessionId"),
                            )
                            prompts.append(prompt)
                    except json.JSONDecodeError:
                        continue
        except FileNotFoundError:
            pass

        return prompts

    def _read_project_files(
        self,
        cutoff: datetime,
        project_filter: Optional[str] = None,
    ) -> list[PromptData]:
        """Read from ~/.claude/projects/*/[uuid].jsonl"""
        prompts = []

        if not self.projects_dir.exists():
            return prompts

        for project_dir in self.projects_dir.iterdir():
            if not project_dir.is_dir():
                continue

            # Decode project name from directory name
            project_name = self._decode_project_name(project_dir.name)

            # Apply project filter
            if project_filter and project_filter not in project_name:
                continue

            for jsonl_file in project_dir.glob("*.jsonl"):
                prompts.extend(
                    self._parse_project_jsonl(jsonl_file, cutoff, project_name)
                )

        return prompts

    def _parse_project_jsonl(
        self,
        filepath: Path,
        cutoff: datetime,
        project_name: str,
    ) -> list[PromptData]:
        """Parse a single project JSONL file"""
        prompts = []

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        data = json.loads(line)

                        # Only process user messages
                        if data.get("type") != "user":
                            continue

                        # Skip meta messages (system-generated)
                        if data.get("isMeta"):
                            continue

                        timestamp = self._parse_timestamp(data.get("timestamp"))
                        if not timestamp or timestamp < cutoff:
                            continue

                        # Extract text and image info from message content
                        message = data.get("message", {})
                        content = message.get("content", "")
                        text, has_image = self._extract_content(content)

                        if not text:
                            continue

                        # Skip command-only messages
                        if text.startswith("<command"):
                            continue

                        # Check for thinking triggers
                        thinking_meta = data.get("thinkingMetadata", {})
                        triggers = thinking_meta.get("triggers", [])
                        trigger_words = [t.get("text", "") for t in triggers if isinstance(t, dict)]

                        prompt = self._create_prompt_data(
                            text=text,
                            timestamp=timestamp,
                            project=project_name,
                            session_id=data.get("sessionId"),
                            thinking_triggers=trigger_words,
                            has_image=has_image,
                        )
                        prompts.append(prompt)

                    except json.JSONDecodeError:
                        continue
        except (FileNotFoundError, PermissionError):
            pass

        return prompts

    def _extract_content(self, content) -> tuple[str, bool]:
        """
        Extract text content and detect images from message content.
        Content can be a string or a list of content blocks.

        Returns:
            tuple of (text_content, has_image)
        """
        has_image = False

        # Handle string content directly
        if isinstance(content, str):
            return content.strip(), False

        # Handle list content (multimodal)
        if isinstance(content, list):
            text_parts = []
            for item in content:
                if isinstance(item, dict):
                    if item.get("type") == "text":
                        text_parts.append(item.get("text", ""))
                    elif item.get("type") == "image":
                        has_image = True
                elif isinstance(item, str):
                    text_parts.append(item)
            return "\n".join(text_parts).strip(), has_image

        return "", False

    def _parse_session_file(
        self,
        filepath: Path,
        cutoff: datetime,
        project_filter: Optional[str] = None,
    ) -> Optional[SessionData]:
        """Parse a session JSONL file and return SessionData"""
        prompts = []
        session_id = filepath.stem
        project_name = self._decode_project_name(filepath.parent.name)

        if project_filter and project_filter not in project_name:
            return None

        total_input_tokens = 0
        total_output_tokens = 0

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue

                    try:
                        data = json.loads(line)
                        msg_type = data.get("type")

                        if msg_type == "user":
                            # Skip meta messages
                            if data.get("isMeta"):
                                continue

                            timestamp = self._parse_timestamp(data.get("timestamp"))
                            if timestamp and timestamp >= cutoff:
                                message = data.get("message", {})
                                content = message.get("content", "")
                                text, has_image = self._extract_content(content)

                                # Skip empty or command messages
                                if not text or text.startswith("<command"):
                                    continue

                                thinking_meta = data.get("thinkingMetadata", {})
                                triggers = thinking_meta.get("triggers", [])
                                trigger_words = [t.get("text", "") for t in triggers if isinstance(t, dict)]

                                prompt = self._create_prompt_data(
                                    text=text,
                                    timestamp=timestamp,
                                    project=project_name,
                                    session_id=session_id,
                                    thinking_triggers=trigger_words,
                                    has_image=has_image,
                                )
                                prompts.append(prompt)

                        elif msg_type == "assistant":
                            # Extract token usage
                            message = data.get("message", {})
                            usage = message.get("usage", {})
                            total_input_tokens += usage.get("input_tokens", 0)
                            total_output_tokens += usage.get("output_tokens", 0)

                    except json.JSONDecodeError:
                        continue

        except (FileNotFoundError, PermissionError):
            return None

        if not prompts:
            return None

        prompts.sort(key=lambda p: p.timestamp)

        return SessionData(
            session_id=session_id,
            project=project_name,
            prompts=prompts,
            total_prompts=len(prompts),
            start_time=prompts[0].timestamp,
            end_time=prompts[-1].timestamp,
            total_input_tokens=total_input_tokens,
            total_output_tokens=total_output_tokens,
        )

    # Classification patterns
    CLASSIFICATION_PATTERNS = {
        PromptCategory.CODE_GENERATION: [
            r"write\s+(a\s+)?(code|function|script|class|module)",
            r"create\s+(a\s+)?(file|component|api|endpoint)",
            r"implement\s+",
            r"generate\s+(code|function)",
            r"add\s+(a\s+)?(feature|function|method)",
        ],
        PromptCategory.BUG_FIX: [
            r"fix\s+",
            r"bug\s+",
            r"error\s+",
            r"not\s+working",
            r"doesn't\s+work",
            r"broken",
            r"issue\s+with",
            r"problem\s+with",
        ],
        PromptCategory.CODE_REVIEW: [
            r"explain\s+",
            r"what\s+(does|is)\s+",
            r"how\s+does\s+",
            r"review\s+",
            r"understand\s+",
            r"why\s+(does|is)\s+",
        ],
        PromptCategory.REFACTORING: [
            r"refactor\s+",
            r"improve\s+",
            r"optimize\s+",
            r"clean\s+up",
            r"restructure",
        ],
        PromptCategory.TESTING: [
            r"test\s+",
            r"unit\s+test",
            r"integration\s+test",
            r"coverage",
            r"pytest",
            r"jest",
        ],
        PromptCategory.DOCUMENTATION: [
            r"document\s+",
            r"readme",
            r"docstring",
            r"comment\s+",
            r"api\s+doc",
        ],
        PromptCategory.CONFIG_SETUP: [
            r"config\s+",
            r"setup\s+",
            r"install\s+",
            r"environment",
            r"docker",
            r"deployment",
        ],
        PromptCategory.GIT_OPERATIONS: [
            r"\bgit\s+",
            r"commit\s+",
            r"branch\s+",
            r"merge\s+",
            r"pull\s+request",
            r"\bpr\b",
        ],
        PromptCategory.FILE_OPERATIONS: [
            r"read\s+(the\s+)?file",
            r"open\s+(the\s+)?file",
            r"show\s+(me\s+)?(the\s+)?file",
            r"list\s+(files|directory)",
        ],
        PromptCategory.SEARCH_EXPLORE: [
            r"search\s+",
            r"find\s+",
            r"where\s+(is|are)\s+",
            r"locate\s+",
            r"look\s+for",
        ],
        PromptCategory.EXTENDED_THINKING: [
            r"ultrathink",
            r"megathink",
            r"think\s+(hard|deep|carefully)",
            r"深度思考",
            r"仔细想",
        ],
        PromptCategory.QUESTION: [
            r"^(what|how|why|when|where|can|could|would|should|is|are|do|does)\s+",
            r"\?$",
        ],
    }

    def _classify_prompt(self, text: str) -> list[PromptCategory]:
        """Classify a prompt into categories based on content patterns."""
        categories = []
        text_lower = text.lower()

        # Check for Chinese language
        if re.search(r"[\u4e00-\u9fff]", text):
            categories.append(PromptCategory.CHINESE_LANGUAGE)

        # Check each category pattern
        for category, patterns in self.CLASSIFICATION_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    if category not in categories:
                        categories.append(category)
                    break

        # Default to general if no categories matched
        if not categories:
            categories.append(PromptCategory.GENERAL)

        return categories

    def _create_prompt_data(
        self,
        text: str,
        timestamp: datetime,
        project: str,
        session_id: Optional[str] = None,
        thinking_triggers: Optional[list[str]] = None,
        has_image: bool = False,
    ) -> PromptData:
        """Create a PromptData object from raw data"""
        triggers = thinking_triggers or []

        # Detect thinking triggers if not provided
        if not triggers:
            text_lower = text.lower()
            for trigger in self.THINKING_TRIGGERS:
                if trigger in text_lower:
                    triggers.append(trigger)

        # Check for code blocks
        has_code = bool(re.search(r"```[\s\S]*?```", text))

        # Classify the prompt
        categories = self._classify_prompt(text)

        return PromptData(
            text=text,
            timestamp=timestamp,
            project=project,
            session_id=session_id,
            char_count=len(text),
            has_code_block=has_code,
            has_thinking_trigger=len(triggers) > 0,
            thinking_triggers=triggers,
            has_image=has_image,
            categories=categories,
        )

    def _parse_timestamp(self, ts) -> Optional[datetime]:
        """Parse various timestamp formats - always returns timezone-aware datetime in UTC"""
        if ts is None:
            return None

        # Unix timestamp (milliseconds)
        if isinstance(ts, (int, float)):
            try:
                return datetime.fromtimestamp(ts / 1000, tz=timezone.utc)
            except (ValueError, OSError):
                return None

        # ISO format string
        if isinstance(ts, str):
            try:
                # Handle ISO format with Z suffix
                if ts.endswith("Z"):
                    ts = ts[:-1] + "+00:00"
                result = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                # Ensure it's timezone-aware
                if result.tzinfo is None:
                    result = result.replace(tzinfo=timezone.utc)
                return result
            except ValueError:
                pass

            # Try parsing without timezone - assume UTC
            try:
                result = datetime.fromisoformat(ts.split("+")[0].split("Z")[0])
                return result.replace(tzinfo=timezone.utc)
            except ValueError:
                return None

        return None

    def _decode_project_name(self, encoded: str) -> str:
        """
        Decode project directory name to a human-readable project name.

        Examples:
            -Users-geniusc-2026-Innovation-project -> 2026 Innovation Project
            -Users-geniusc-Desktop-COMP2521-25T3 -> COMP2521 25T3
            -Users-geniusc-Project-claudescope -> claudescope
            -Volumes-HomeLab-Academic-MATH1231-2025T3 -> MATH1231 2025T3
        """
        # Remove leading dash
        name = encoded.lstrip("-")

        # Split by dash
        parts = name.split("-")

        # Remove common prefixes
        prefixes_to_remove = ["Users", "Volumes", "geniusc", "Desktop", "Downloads", "Documents"]

        # Filter out prefix parts
        filtered_parts = []
        skip_next = False
        for i, part in enumerate(parts):
            if skip_next:
                skip_next = False
                continue
            if part in prefixes_to_remove:
                continue
            # Check for paths like "Home" in "Home-Lab" - keep meaningful parts
            filtered_parts.append(part)

        if not filtered_parts:
            return "Home"

        # Detect course codes (like COMP2521, MATH1231)
        course_pattern = re.compile(r'^[A-Z]{4}\d{4}$')

        # Detect semester patterns (like 25T3, 2025T3)
        semester_pattern = re.compile(r'^\d{2,4}T\d$')

        # Build smart name
        result_parts = []
        for part in filtered_parts:
            # Keep course codes as-is
            if course_pattern.match(part):
                result_parts.append(part)
            # Keep semester codes as-is
            elif semester_pattern.match(part):
                result_parts.append(part)
            # Keep Academic keyword but combine with next meaningful part
            elif part == "Academic":
                continue  # Skip, the course code will follow
            # Title case other parts
            else:
                # Convert to title case, handling special cases
                if part.lower() in ["api", "ui", "ai", "ml", "db", "mcp", "n8n"]:
                    result_parts.append(part.upper())
                elif part.lower() == "homelab":
                    result_parts.append("HomeLab")
                else:
                    result_parts.append(part.title() if part.islower() else part)

        # Join with spaces
        project_name = " ".join(result_parts)

        # Clean up common patterns
        project_name = project_name.replace("  ", " ").strip()

        # Remove "Project" prefix if followed by actual project name
        if project_name.startswith("Project ") and len(project_name) > 8:
            project_name = project_name[8:]

        # Remove "Output" suffix - merge with main project
        if project_name.endswith(" Output"):
            project_name = project_name[:-7]

        # If result is just "Project", try to be more specific
        if project_name == "Project":
            project_name = "General Projects"

        # Remove HomeLab prefix for academic courses
        if project_name.startswith("HomeLab ") and re.search(r'[A-Z]{4}\d{4}', project_name):
            project_name = project_name[8:]

        # Merge "HomeLab Project" into "HomeLab"
        if project_name == "HomeLab Project":
            project_name = "HomeLab"

        return project_name if project_name else "Unknown"

    def _normalize_project_path(self, path: str) -> str:
        """
        Normalize a raw project path (from history.jsonl) to a smart project name.

        Handles both formats:
            - /Users/geniusc/2026-Innovation-project
            - /Volumes/HomeLab/Project
        """
        if not path:
            return "Unknown"

        # Convert path separators to dashes (like the projects folder names)
        # /Users/geniusc/2026-Innovation-project -> -Users-geniusc-2026-Innovation-project
        encoded = path.replace("/", "-").replace("\\", "-")

        # Handle underscores in paths (convert to dashes for consistency)
        encoded = encoded.replace("_", "-")

        return self._decode_project_name(encoded)

    def get_project_category(self, project_name: str) -> str:
        """
        Categorize project into broader categories.

        Categories:
            - Academic: Course-related projects (COMP, MATH, etc.)
            - Personal: Personal projects and experiments
            - Work: Work-related projects
            - HomeLab: Home lab infrastructure
            - Other: Uncategorized
        """
        name_lower = project_name.lower()

        # Academic courses
        if re.search(r'[A-Z]{4}\d{4}', project_name):
            return "Academic"

        # HomeLab related
        if "homelab" in name_lower or "home lab" in name_lower:
            return "HomeLab"

        # Innovation/Research
        if "innovation" in name_lower or "research" in name_lower:
            return "Research"

        # Known project types
        if any(x in name_lower for x in ["claudescope", "skill", "tiktok", "web"]):
            return "Personal Projects"

        return "Other"
