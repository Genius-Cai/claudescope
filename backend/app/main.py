"""ClaudeScope - Claude Code Usage Analyzer

Main FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import health_report, antipatterns, statistics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    if settings.claude_data_exists:
        print(f"Claude data found at: {settings.claude_home}")
    else:
        print(f"Warning: Claude data not found at {settings.claude_home}")
    yield
    # Shutdown
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
