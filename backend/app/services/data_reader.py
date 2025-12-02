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
from app.models.schemas import PromptData, SessionData


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
                            project = data.get("project", "")

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

                        timestamp = self._parse_timestamp(data.get("timestamp"))
                        if not timestamp or timestamp < cutoff:
                            continue

                        # Extract text from message content
                        message = data.get("message", {})
                        content = message.get("content", [])
                        text = ""
                        for item in content:
                            if isinstance(item, dict) and item.get("type") == "text":
                                text = item.get("text", "")
                                break
                            elif isinstance(item, str):
                                text = item
                                break

                        if not text:
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
                        )
                        prompts.append(prompt)

                    except json.JSONDecodeError:
                        continue
        except (FileNotFoundError, PermissionError):
            pass

        return prompts

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
                            timestamp = self._parse_timestamp(data.get("timestamp"))
                            if timestamp and timestamp >= cutoff:
                                message = data.get("message", {})
                                content = message.get("content", [])
                                text = ""
                                for item in content:
                                    if isinstance(item, dict) and item.get("type") == "text":
                                        text = item.get("text", "")
                                        break

                                if text:
                                    thinking_meta = data.get("thinkingMetadata", {})
                                    triggers = thinking_meta.get("triggers", [])
                                    trigger_words = [t.get("text", "") for t in triggers if isinstance(t, dict)]

                                    prompt = self._create_prompt_data(
                                        text=text,
                                        timestamp=timestamp,
                                        project=project_name,
                                        session_id=session_id,
                                        thinking_triggers=trigger_words,
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

    def _create_prompt_data(
        self,
        text: str,
        timestamp: datetime,
        project: str,
        session_id: Optional[str] = None,
        thinking_triggers: Optional[list[str]] = None,
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

        return PromptData(
            text=text,
            timestamp=timestamp,
            project=project,
            session_id=session_id,
            char_count=len(text),
            has_code_block=has_code,
            has_thinking_trigger=len(triggers) > 0,
            thinking_triggers=triggers,
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
        """Decode project directory name to actual path"""
        # Claude encodes project paths - this is a simplified decode
        # The actual encoding replaces / with some delimiter
        return encoded.replace("-", "/").replace("_", " ")
