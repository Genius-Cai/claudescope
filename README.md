# ClaudeScope

<div align="center">

![ClaudeScope Logo](https://img.shields.io/badge/ClaudeScope-AI%20Usage%20Analyzer-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTEyIDMtMS45MTIgNS44MTNhMiAyIDAgMCAxLTEuMjc1IDEuMjc1TDMgMTJsNS44MTMgMS45MTJhMiAyIDAgMCAxIDEuMjc1IDEuMjc1TDEyIDIxbDEuOTEyLTUuODEzYTIgMiAwIDAgMSAxLjI3NS0xLjI3NUwyMSAxMmwtNS44MTMtMS45MTJhMiAyIDAgMCAxLTEuMjc1LTEuMjc1TDEyIDN6Ii8+PC9zdmc+)

**Analyze your Claude Code usage habits with AI-powered insights**

Prompt health scoring, anti-pattern detection, and optimization suggestions

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**[🚀 Live Demo](https://claudescope.geniuscai.com)**

English | [简体中文](README_CN.md)

[Features](#features) • [Live Demo](#live-demo) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API Reference](#api-reference)

</div>

---

## Live Demo

Try ClaudeScope without any setup: **[https://claudescope.geniuscai.com](https://claudescope.geniuscai.com)**

The demo runs with sample data to showcase all features. To analyze your own Claude Code usage, follow the [Quick Start](#quick-start) guide below.

## Overview

ClaudeScope is a comprehensive analytics dashboard for analyzing your Claude Code usage patterns. It provides actionable insights to help you optimize your AI interactions, identify anti-patterns, and improve your prompting techniques.

### Key Capabilities

- **Health Scoring**: Multi-dimensional analysis of your prompt quality and Claude usage efficiency
- **Anti-pattern Detection**: Identify common mistakes and inefficient patterns in your prompts
- **Usage Statistics**: Track token usage, session patterns, and extended thinking triggers
- **AI-Powered Insights**: Get personalized recommendations based on your usage data

## Features

### Dashboard
The main dashboard provides a quick overview of your Claude usage with animated visualizations:
- Real-time health score
- Anti-pattern summary
- Extended thinking usage chart
- Quick statistics

### Health Report
Comprehensive health analysis across multiple dimensions:
- **Clarity**: How clear and understandable your prompts are
- **Context**: Whether you provide sufficient context
- **Specificity**: How specific your requests are
- **Structure**: Organization and formatting of prompts
- **Efficiency**: Token usage optimization

### Anti-patterns
Detect and fix common prompting mistakes:
- Vague instructions
- Missing context
- Overloaded prompts
- Unclear expectations
- Inefficient patterns

### Statistics
Detailed usage analytics:
- Token consumption (input vs output)
- Model usage breakdown
- Session patterns
- Project-wise statistics
- Extended thinking triggers

### AI Insights
Personalized recommendations:
- Usage pattern analysis
- Efficiency improvements
- Best practice suggestions
- Trend indicators

### Good Prompts
Learn from your best prompts:
- Automatic identification of high-quality prompts
- Multi-dimensional scoring (clarity, context, structure, specificity, efficiency)
- Random showcase of exemplary prompts with explanations
- Understand why certain prompts work well

### Settings & LLM Configuration
Flexible AI provider management:
- Support for multiple LLM providers (OpenAI, Anthropic, DeepSeek, Ollama)
- Easy API key configuration with validation
- Test connections before saving
- Model selection per provider

## Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.4](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animations**: [GSAP 3.13](https://gsap.com/)
- **Charts**: [Recharts 2.12](https://recharts.org/)
- **State**: [React Query 5](https://tanstack.com/query), [Zustand 4](https://zustand.docs.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI 0.109](https://fastapi.tiangolo.com/)
- **Language**: [Python 3.11+](https://www.python.org/)
- **Validation**: [Pydantic 2.5](https://docs.pydantic.dev/)
- **Database**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/) + SQLite
- **AI/ML**: [LangChain](https://langchain.com/), [CrewAI](https://crewai.com/)

## Project Structure

```
claudescope/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Dashboard
│   │   │   ├── health/         # Health Report page
│   │   │   ├── antipatterns/   # Anti-patterns page
│   │   │   ├── statistics/     # Statistics page
│   │   │   └── insights/       # AI Insights page
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── dashboard/      # Dashboard widgets
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utilities and API client
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                     # FastAPI backend application
│   ├── app/
│   │   ├── main.py             # Application entry point
│   │   ├── routers/            # API route handlers
│   │   │   ├── health_report.py
│   │   │   ├── antipatterns.py
│   │   │   ├── statistics.py
│   │   │   ├── good_prompts.py # Good prompts API
│   │   │   └── settings.py     # Settings & API key management
│   │   ├── services/           # Business logic
│   │   │   ├── health_scorer.py
│   │   │   ├── antipattern_engine.py
│   │   │   ├── statistics_service.py
│   │   │   ├── good_prompts_engine.py  # Prompt quality scoring
│   │   │   └── data_reader.py
│   │   ├── agents/             # LangChain/LangGraph agents
│   │   │   ├── llm_factory.py  # Multi-provider LLM support
│   │   │   └── graphs/         # LangGraph workflows
│   │   ├── models/             # Pydantic schemas
│   │   └── core/               # Configuration
│   └── requirements.txt
│
├── docker-compose.yml          # Docker configuration
├── Makefile                    # Development commands
└── package.json                # Monorepo configuration
```

## Quick Start

### Prerequisites

- Node.js 18.0+
- Python 3.11+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Genius-Cai/claudescope.git
cd claudescope
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Configure environment**
```bash
# Create .env file in backend/
cp backend/.env.example backend/.env
# Edit with your configuration
```

### Running the Application

**Development mode (both frontend and backend):**
```bash
npm run dev
```

Or run separately:

**Frontend only:**
```bash
npm run dev:frontend
# Runs on http://localhost:4000
```

**Backend only:**
```bash
npm run dev:backend
# Runs on http://localhost:6000
```

### Using Docker

```bash
docker-compose up -d
```

## API Reference

### Health Report

#### GET `/api/health-report`

Returns comprehensive health analysis.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 7 | Analysis period in days |
| `project` | string | - | Filter by project name |

**Response:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "overall_score": 85,
  "grade": "A",
  "dimensions": [
    {
      "name": "Clarity",
      "score": 90,
      "weight": 0.25,
      "issues": []
    }
  ],
  "total_prompts_analyzed": 150,
  "period_days": 7,
  "improvement_suggestions": [
    "Consider adding more context to your prompts"
  ],
  "trend_vs_last_week": 5
}
```

### Anti-patterns

#### GET `/api/antipatterns`

Returns detected anti-patterns.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 7 | Analysis period |
| `severity` | string | - | Filter: critical, warning, info |
| `type` | string[] | - | Filter by pattern types |
| `limit` | integer | 50 | Max results |
| `offset` | integer | 0 | Pagination offset |

**Response:**
```json
{
  "total": 25,
  "items": [
    {
      "id": "ap-001",
      "type": "vague_instruction",
      "severity": "warning",
      "prompt_excerpt": "Can you help me with...",
      "timestamp": "2024-01-15T10:30:00Z",
      "project": "my-project",
      "confidence": 0.85,
      "explanation": "The prompt lacks specific details",
      "fix_suggestion": "Specify exactly what help you need"
    }
  ],
  "by_type": {
    "vague_instruction": 10,
    "missing_context": 8
  },
  "by_severity": {
    "critical": 2,
    "warning": 15,
    "info": 8
  }
}
```

#### GET `/api/antipatterns/summary`

Returns anti-pattern summary statistics.

### Good Prompts

#### GET `/api/good-prompts/random`

Returns a random high-quality prompt with analysis.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Analysis period |

**Response:**
```json
{
  "text": "Full prompt text...",
  "excerpt": "Truncated preview...",
  "project": "my-project",
  "timestamp": "2024-01-15T10:30:00Z",
  "score": 92,
  "reasons": ["Clear objective", "Specific requirements"],
  "why_good": "This prompt clearly states the goal and provides context"
}
```

### Settings

#### POST `/api/settings/api-key`

Save an API key to the .env file.

**Request Body:**
```json
{
  "provider": "anthropic",
  "api_key": "sk-ant-..."
}
```

#### POST `/api/settings/test-api-key`

Test if an API key is valid.

#### GET `/api/settings/env-status`

Get configuration status of all providers.

### Statistics

#### GET `/api/statistics/overview`

Returns usage statistics overview.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Analysis period |

**Response:**
```json
{
  "period_days": 30,
  "thinking": {
    "total_triggers": 145,
    "by_trigger_word": {
      "think": 50,
      "analyze": 40,
      "reason": 55
    },
    "by_project": {},
    "by_day": [],
    "average_per_session": 2.5
  },
  "tokens": {
    "total_tokens": 500000,
    "input_tokens": 150000,
    "output_tokens": 350000,
    "by_model": {
      "claude-sonnet-4-20250514": 300000
    },
    "by_project": {}
  },
  "sessions_count": 58,
  "projects_count": 5,
  "prompts_count": 1200,
  "average_prompts_per_session": 20.7,
  "average_prompt_length": 450
}
```

## Configuration

### Environment Variables

**Backend (.env):**
```env
# Server
HOST=0.0.0.0
PORT=6000
DEBUG=true

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/claudescope.db

# Claude API (for AI features)
ANTHROPIC_API_KEY=your-api-key

# CORS
CORS_ORIGINS=["http://localhost:4000"]
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:6000/api
```

## Development

### Code Quality

**Lint frontend:**
```bash
npm run lint
```

**Build for production:**
```bash
npm run build
```

### Testing

**Backend tests:**
```bash
cd backend
pytest
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

## Roadmap

- [ ] User authentication and multi-user support
- [ ] Export reports (PDF, CSV)
- [ ] Custom anti-pattern rules
- [ ] Real-time usage monitoring
- [ ] Integration with Claude Code CLI
- [ ] Mobile responsive design improvements
- [ ] Dark/Light theme toggle
- [ ] Webhook notifications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Anthropic](https://anthropic.com/) for Claude AI
- [Vercel](https://vercel.com/) for Next.js
- [FastAPI](https://fastapi.tiangolo.com/) team
- All open-source contributors

---

<div align="center">

Made with love by the ClaudeScope team

[Report Bug](https://github.com/Genius-Cai/claudescope/issues) • [Request Feature](https://github.com/Genius-Cai/claudescope/issues)

</div>
