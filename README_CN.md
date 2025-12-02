# ClaudeScope

<div align="center">

![ClaudeScope Logo](https://img.shields.io/badge/ClaudeScope-AI%20Usage%20Analyzer-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0ibTEyIDMtMS45MTIgNS44MTNhMiAyIDAgMCAxLTEuMjc1IDEuMjc1TDMgMTJsNS44MTMgMS45MTJhMiAyIDAgMCAxIDEuMjc1IDEuMjc1TDEyIDIxbDEuOTEyLTUuODEzYTIgMiAwIDAgMSAxLjI3NS0xLjI3NUwyMSAxMmwtNS44MTMtMS45MTJhMiAyIDAgMCAxLTEuMjc1LTEuMjc1TDEyIDN6Ii8+PC9zdmc+)

**基于 AI 洞察分析你的 Claude Code 使用习惯**

提示词健康评分、反模式检测、优化建议

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[English](README.md) | 简体中文

[功能特性](#功能特性) • [快速开始](#快速开始) • [文档](#文档) • [API 参考](#api-参考)

</div>

---

## 概述

ClaudeScope 是一个全面的分析仪表板，用于分析你的 Claude Code 使用模式。它提供可操作的洞察，帮助你优化 AI 交互、识别反模式，并改进你的提示词技巧。

### 核心能力

- **健康评分**：多维度分析你的提示词质量和 Claude 使用效率
- **反模式检测**：识别提示词中的常见错误和低效模式
- **使用统计**：追踪 Token 使用量、会话模式和扩展思考触发情况
- **AI 驱动洞察**：基于你的使用数据获取个性化建议

## 功能特性

### 仪表板
主仪表板通过动画可视化快速展示你的 Claude 使用情况：
- 实时健康评分
- 反模式摘要
- 扩展思考使用图表
- 快速统计

### 健康报告
跨多个维度的全面健康分析：
- **清晰度**：你的提示词有多清晰易懂
- **上下文**：是否提供了足够的上下文
- **具体性**：你的请求有多具体
- **结构**：提示词的组织和格式
- **效率**：Token 使用优化

### 反模式
检测并修复常见的提示词错误：
- 模糊的指令
- 缺失的上下文
- 过载的提示词
- 不明确的期望
- 低效的模式

### 统计
详细的使用分析：
- Token 消耗（输入 vs 输出）
- 模型使用分布
- 会话模式
- 项目维度统计
- 扩展思考触发词

### AI 洞察
个性化建议：
- 使用模式分析
- 效率改进建议
- 最佳实践建议
- 趋势指标

## 技术栈

### 前端
- **框架**：[Next.js 14](https://nextjs.org/) + App Router
- **语言**：[TypeScript 5.4](https://www.typescriptlang.org/)
- **样式**：[Tailwind CSS 3.4](https://tailwindcss.com/)
- **动画**：[GSAP 3.13](https://gsap.com/)
- **图表**：[Recharts 2.12](https://recharts.org/)
- **状态管理**：[React Query 5](https://tanstack.com/query)、[Zustand 4](https://zustand.docs.pmnd.rs/)
- **图标**：[Lucide React](https://lucide.dev/)

### 后端
- **框架**：[FastAPI 0.109](https://fastapi.tiangolo.com/)
- **语言**：[Python 3.11+](https://www.python.org/)
- **数据验证**：[Pydantic 2.5](https://docs.pydantic.dev/)
- **数据库**：[SQLAlchemy 2.0](https://www.sqlalchemy.org/) + SQLite
- **AI/ML**：[LangChain](https://langchain.com/)、[CrewAI](https://crewai.com/)

## 项目结构

```
claudescope/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/                # App Router 页面
│   │   │   ├── page.tsx        # 仪表板
│   │   │   ├── health/         # 健康报告页面
│   │   │   ├── antipatterns/   # 反模式页面
│   │   │   ├── statistics/     # 统计页面
│   │   │   └── insights/       # AI 洞察页面
│   │   ├── components/         # React 组件
│   │   │   ├── ui/             # 可复用 UI 组件
│   │   │   └── dashboard/      # 仪表板小部件
│   │   ├── hooks/              # 自定义 React Hooks
│   │   └── lib/                # 工具函数和 API 客户端
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                     # FastAPI 后端应用
│   ├── app/
│   │   ├── main.py             # 应用入口
│   │   ├── routers/            # API 路由处理器
│   │   │   ├── health_report.py
│   │   │   ├── antipatterns.py
│   │   │   └── statistics.py
│   │   ├── services/           # 业务逻辑
│   │   │   ├── health_scorer.py
│   │   │   ├── antipattern_engine.py
│   │   │   ├── statistics_service.py
│   │   │   └── data_reader.py
│   │   ├── models/             # Pydantic 模型
│   │   └── core/               # 配置
│   └── requirements.txt
│
├── docker-compose.yml          # Docker 配置
├── Makefile                    # 开发命令
└── package.json                # Monorepo 配置
```

## 快速开始

### 前置要求

- Node.js 18.0+
- Python 3.11+
- npm 或 yarn

### 安装

1. **克隆仓库**
```bash
git clone https://github.com/Genius-Cai/claudescope.git
cd claudescope
```

2. **安装前端依赖**
```bash
npm install
```

3. **设置后端**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
# 在 backend/ 目录创建 .env 文件
cp backend/.env.example backend/.env
# 编辑配置
```

### 运行应用

**开发模式（同时运行前后端）：**
```bash
npm run dev
```

或者分别运行：

**仅前端：**
```bash
npm run dev:frontend
# 运行在 http://localhost:4000
```

**仅后端：**
```bash
npm run dev:backend
# 运行在 http://localhost:6000
```

### 使用 Docker

```bash
docker-compose up -d
```

## API 参考

### 健康报告

#### GET `/api/health-report`

返回全面的健康分析。

**查询参数：**
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `days` | integer | 7 | 分析周期（天） |
| `project` | string | - | 按项目名称过滤 |

**响应示例：**
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
    "建议为你的提示词添加更多上下文"
  ],
  "trend_vs_last_week": 5
}
```

### 反模式

#### GET `/api/antipatterns`

返回检测到的反模式。

**查询参数：**
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `days` | integer | 7 | 分析周期 |
| `severity` | string | - | 过滤：critical, warning, info |
| `type` | string[] | - | 按模式类型过滤 |
| `limit` | integer | 50 | 最大结果数 |
| `offset` | integer | 0 | 分页偏移 |

**响应示例：**
```json
{
  "total": 25,
  "items": [
    {
      "id": "ap-001",
      "type": "vague_instruction",
      "severity": "warning",
      "prompt_excerpt": "你能帮我...",
      "timestamp": "2024-01-15T10:30:00Z",
      "project": "my-project",
      "confidence": 0.85,
      "explanation": "提示词缺少具体细节",
      "fix_suggestion": "明确说明你需要什么帮助"
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

返回反模式摘要统计。

### 统计

#### GET `/api/statistics/overview`

返回使用统计概览。

**查询参数：**
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `days` | integer | 30 | 分析周期 |

**响应示例：**
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

## 配置

### 环境变量

**后端 (.env)：**
```env
# 服务器
HOST=0.0.0.0
PORT=6000
DEBUG=true

# 数据库
DATABASE_URL=sqlite+aiosqlite:///./data/claudescope.db

# Claude API（AI 功能需要）
ANTHROPIC_API_KEY=your-api-key

# CORS
CORS_ORIGINS=["http://localhost:4000"]
```

**前端 (.env.local)：**
```env
NEXT_PUBLIC_API_URL=http://localhost:6000/api
```

## 开发

### 代码质量

**前端 Lint：**
```bash
npm run lint
```

**生产构建：**
```bash
npm run build
```

### 测试

**后端测试：**
```bash
cd backend
pytest
```

### 贡献指南

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/my-feature`
3. 提交更改：`git commit -m 'feat: 添加新功能'`
4. 推送分支：`git push origin feature/my-feature`
5. 创建 Pull Request

### 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更改
- `style:` 代码样式更改
- `refactor:` 代码重构
- `test:` 测试更改
- `chore:` 构建/工具更改

## 路线图

- [ ] 用户认证和多用户支持
- [ ] 导出报告（PDF、CSV）
- [ ] 自定义反模式规则
- [ ] 实时使用监控
- [ ] 与 Claude Code CLI 集成
- [ ] 移动端响应式设计改进
- [ ] 深色/浅色主题切换
- [ ] Webhook 通知

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 致谢

- [Anthropic](https://anthropic.com/) 提供 Claude AI
- [Vercel](https://vercel.com/) 提供 Next.js
- [FastAPI](https://fastapi.tiangolo.com/) 团队
- 所有开源贡献者

---

<div align="center">

由 ClaudeScope 团队用心打造

[报告 Bug](https://github.com/Genius-Cai/claudescope/issues) • [功能请求](https://github.com/Genius-Cai/claudescope/issues)

</div>
