"""File watcher service for monitoring Claude Code data changes.

Monitors ~/.claude/projects/ for new conversation data and triggers updates.
"""

import asyncio
import logging
from pathlib import Path
from typing import Callable, Optional
from datetime import datetime, timezone
import threading

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    Observer = None
    FileSystemEventHandler = object

from app.core.config import settings

logger = logging.getLogger(__name__)


class ClaudeDataHandler(FileSystemEventHandler if WATCHDOG_AVAILABLE else object):
    """Handler for Claude Code data file changes."""

    def __init__(self, callback: Callable[[str, str], None]):
        """
        Initialize handler with callback.

        Args:
            callback: Function to call when data changes.
                     Receives (event_type, file_path) arguments.
        """
        self.callback = callback
        self.last_event_time: dict[str, datetime] = {}
        self.debounce_seconds = 1.0  # Debounce rapid file changes

    def _should_process(self, path: str) -> bool:
        """Check if we should process this event (debouncing)."""
        now = datetime.now(timezone.utc)
        last_time = self.last_event_time.get(path)

        if last_time and (now - last_time).total_seconds() < self.debounce_seconds:
            return False

        self.last_event_time[path] = now
        return True

    def on_modified(self, event):
        """Handle file modification events."""
        if event.is_directory:
            return

        path = event.src_path
        if not path.endswith(".jsonl"):
            return

        if self._should_process(path):
            logger.debug(f"File modified: {path}")
            self.callback("modified", path)

    def on_created(self, event):
        """Handle file creation events."""
        if event.is_directory:
            return

        path = event.src_path
        if not path.endswith(".jsonl"):
            return

        if self._should_process(path):
            logger.debug(f"File created: {path}")
            self.callback("created", path)


class FileWatcherService:
    """Service for watching Claude Code data directory for changes."""

    def __init__(self):
        self.projects_dir = settings.projects_dir
        self.observer: Optional[Observer] = None
        self.callbacks: list[Callable[[str, str], None]] = []
        self._running = False
        self._stats = {
            "events_processed": 0,
            "last_event_time": None,
            "start_time": None,
        }

    @property
    def is_available(self) -> bool:
        """Check if watchdog is available."""
        return WATCHDOG_AVAILABLE

    @property
    def is_running(self) -> bool:
        """Check if watcher is currently running."""
        return self._running

    @property
    def stats(self) -> dict:
        """Get watcher statistics."""
        return {
            **self._stats,
            "is_running": self._running,
            "watch_path": str(self.projects_dir),
        }

    def add_callback(self, callback: Callable[[str, str], None]):
        """
        Add a callback to be called when data changes.

        Args:
            callback: Function receiving (event_type, file_path)
        """
        self.callbacks.append(callback)

    def remove_callback(self, callback: Callable[[str, str], None]):
        """Remove a callback."""
        if callback in self.callbacks:
            self.callbacks.remove(callback)

    def _on_change(self, event_type: str, file_path: str):
        """Internal handler that dispatches to all callbacks."""
        self._stats["events_processed"] += 1
        self._stats["last_event_time"] = datetime.now(timezone.utc).isoformat()

        for callback in self.callbacks:
            try:
                callback(event_type, file_path)
            except Exception as e:
                logger.error(f"Callback error: {e}")

    def start(self) -> bool:
        """
        Start watching the Claude data directory.

        Returns:
            True if started successfully, False otherwise.
        """
        if not WATCHDOG_AVAILABLE:
            logger.warning("watchdog not installed - file watching disabled")
            return False

        if not self.projects_dir.exists():
            logger.warning(f"Projects directory not found: {self.projects_dir}")
            return False

        if self._running:
            logger.info("File watcher already running")
            return True

        try:
            handler = ClaudeDataHandler(self._on_change)
            self.observer = Observer()
            self.observer.schedule(handler, str(self.projects_dir), recursive=True)
            self.observer.start()
            self._running = True
            self._stats["start_time"] = datetime.now(timezone.utc).isoformat()
            logger.info(f"Started watching: {self.projects_dir}")
            return True
        except Exception as e:
            logger.error(f"Failed to start file watcher: {e}")
            return False

    def stop(self):
        """Stop watching the directory."""
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=5)
            self.observer = None
        self._running = False
        logger.info("File watcher stopped")


# Global instance
file_watcher = FileWatcherService()


# Async wrapper for use with FastAPI
class AsyncFileWatcher:
    """Async wrapper for file watcher with event queue."""

    def __init__(self):
        self.event_queue: asyncio.Queue = asyncio.Queue()
        self._setup_done = False

    def _sync_callback(self, event_type: str, file_path: str):
        """Sync callback that puts events in async queue."""
        try:
            # Use call_soon_threadsafe for thread safety
            loop = asyncio.get_event_loop()
            loop.call_soon_threadsafe(
                self.event_queue.put_nowait,
                {"type": event_type, "path": file_path, "timestamp": datetime.now(timezone.utc).isoformat()}
            )
        except Exception:
            pass  # Queue might be full or loop not running

    def setup(self):
        """Setup the async watcher."""
        if self._setup_done:
            return

        file_watcher.add_callback(self._sync_callback)
        self._setup_done = True

    async def get_event(self, timeout: float = 30.0) -> Optional[dict]:
        """
        Get next file change event.

        Args:
            timeout: Seconds to wait for event

        Returns:
            Event dict or None if timeout
        """
        try:
            return await asyncio.wait_for(self.event_queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None

    async def events(self):
        """Async generator yielding file change events."""
        while True:
            event = await self.get_event()
            if event:
                yield event


async_file_watcher = AsyncFileWatcher()
