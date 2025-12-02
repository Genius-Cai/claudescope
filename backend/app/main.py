"""ClaudeScope - Claude Code Usage Analyzer

Main FastAPI application entry point.
"""

import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.routers import health_report, antipatterns, statistics, insights, good_prompts
from app.routers import settings as settings_router
from app.services.file_watcher import file_watcher, async_file_watcher


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    if settings.claude_data_exists:
        print(f"Claude data found at: {settings.claude_home}")
    else:
        print(f"Warning: Claude data not found at {settings.claude_home}")

    # Start file watcher for real-time updates
    if file_watcher.is_available:
        if file_watcher.start():
            async_file_watcher.setup()
            print("File watcher started - real-time updates enabled")
        else:
            print("File watcher failed to start")
    else:
        print("watchdog not installed - real-time updates disabled")

    yield

    # Shutdown
    file_watcher.stop()
    print("Shutting down ClaudeScope...")


app = FastAPI(
    title=settings.app_name,
    description="Analyze your Claude Code usage habits - Prompt health scoring, anti-pattern detection, and AI-driven optimization suggestions",
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_report.router, prefix=settings.api_prefix, tags=["Health Report"])
app.include_router(antipatterns.router, prefix=settings.api_prefix, tags=["Antipatterns"])
app.include_router(statistics.router, prefix=settings.api_prefix, tags=["Statistics"])
app.include_router(insights.router, prefix=settings.api_prefix, tags=["AI Insights"])
app.include_router(settings_router.router, prefix=settings.api_prefix, tags=["Settings"])
app.include_router(good_prompts.router, prefix=settings.api_prefix, tags=["Good Prompts"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "claude_data_available": settings.claude_data_exists,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/api/events/stream")
async def event_stream():
    """
    Server-Sent Events endpoint for real-time file updates.

    Streams events when Claude Code conversation files are modified.
    Use this to get notified of new prompts without polling.
    """
    async def generate():
        # Send initial connection message
        yield f"data: {json.dumps({'type': 'connected', 'message': 'Connected to event stream'})}\n\n"

        # Stream file change events
        async for event in async_file_watcher.events():
            yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/api/watcher/status")
async def watcher_status():
    """Get file watcher status and statistics."""
    return {
        "available": file_watcher.is_available,
        "running": file_watcher.is_running,
        "stats": file_watcher.stats,
    }
