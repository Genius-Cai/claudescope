/**
 * Demo data for ClaudeScope - used when API is unavailable or in demo mode
 */

import type {
  HealthReportResponse,
  AntipatternListResponse,
  AntipatternSummaryResponse,
  StatisticsOverviewResponse,
  LLMProvidersResponse,
  InsightsHealthCheckResponse,
  EnvStatusResponse,
  RandomGoodPromptResponse,
} from "./api";

export const demoHealthReport: HealthReportResponse = {
  timestamp: new Date().toISOString(),
  overall_score: 78,
  grade: "B",
  dimensions: [
    { name: "clarity", score: 82, weight: 0.25, issues: ["Some prompts lack specific context"] },
    { name: "context", score: 75, weight: 0.25, issues: ["Missing project background in 3 prompts"] },
    { name: "structure", score: 80, weight: 0.2, issues: [] },
    { name: "specificity", score: 72, weight: 0.2, issues: ["Vague requirements in 5 prompts"] },
    { name: "efficiency", score: 85, weight: 0.1, issues: [] },
  ],
  total_prompts_analyzed: 156,
  period_days: 7,
  improvement_suggestions: [
    "Add more context about your project structure",
    "Be more specific about expected output format",
    "Break complex tasks into smaller steps",
  ],
  trend_vs_last_week: 5,
};

export const demoAntipatternSummary: AntipatternSummaryResponse = {
  total_detected: 23,
  by_type: {
    vague_request: 8,
    no_context: 6,
    too_broad: 5,
    missing_constraints: 4,
  },
  by_severity: {
    high: 3,
    medium: 12,
    low: 8,
  },
  most_common: [
    { type: "vague_request", count: 8 },
    { type: "no_context", count: 6 },
    { type: "too_broad", count: 5 },
  ],
};

export const demoAntipatternList: AntipatternListResponse = {
  total: 23,
  items: [
    {
      id: "demo-1",
      type: "vague_request",
      severity: "medium",
      prompt_excerpt: "Can you help me fix this bug?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      project: "claudescope",
      session_id: "demo-session-1",
      confidence: 0.85,
      explanation: "The request lacks specific details about the bug",
      fix_suggestion: "Describe the expected vs actual behavior, include error messages",
    },
    {
      id: "demo-2",
      type: "no_context",
      severity: "high",
      prompt_excerpt: "Make it better",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      project: "my-project",
      session_id: "demo-session-2",
      confidence: 0.92,
      explanation: "No context provided about what 'it' refers to",
      fix_suggestion: "Specify what needs improvement and the criteria for 'better'",
    },
    {
      id: "demo-3",
      type: "too_broad",
      severity: "medium",
      prompt_excerpt: "Create a full e-commerce website",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      project: "ecommerce",
      session_id: "demo-session-3",
      confidence: 0.78,
      explanation: "Request scope is too large for a single prompt",
      fix_suggestion: "Break down into smaller tasks: product listing, cart, checkout, etc.",
    },
  ],
  by_type: { vague_request: 8, no_context: 6, too_broad: 5, missing_constraints: 4 },
  by_severity: { high: 3, medium: 12, low: 8 },
};

export const demoStatisticsOverview: StatisticsOverviewResponse = {
  period_days: 30,
  thinking: {
    total_triggers: 142,
    by_trigger_word: {
      ultrathink: 89,
      megathink: 32,
      think: 21,
    },
    by_project: {
      claudescope: 67,
      "my-app": 45,
      "api-project": 30,
    },
    by_day: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
      count: Math.floor(Math.random() * 10) + 2,
    })),
    average_per_session: 3.2,
  },
  tokens: {
    total_tokens: 1250000,
    input_tokens: 450000,
    output_tokens: 800000,
    by_model: {
      "claude-sonnet-4-20250514": 750000,
      "claude-3-5-sonnet-20241022": 350000,
      "claude-3-opus-20240229": 150000,
    },
    by_project: {
      claudescope: 520000,
      "my-app": 430000,
      "api-project": 300000,
    },
  },
  sessions_count: 45,
  projects_count: 8,
  prompts_count: 1488,
  average_prompts_per_session: 33.1,
  average_prompt_length: 245,
};

export const demoLLMProviders: LLMProvidersResponse = {
  providers: [
    {
      id: "openai",
      name: "Openai",
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
      default_model: "gpt-4o",
      configured: false,
    },
    {
      id: "anthropic",
      name: "Anthropic",
      models: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
      default_model: "claude-sonnet-4-20250514",
      configured: false,
    },
    {
      id: "deepseek",
      name: "Deepseek",
      models: ["deepseek-chat", "deepseek-coder"],
      default_model: "deepseek-chat",
      configured: false,
    },
    {
      id: "ollama",
      name: "Ollama",
      models: ["llama3.2", "llama3.1", "mistral", "codellama", "qwen2.5"],
      default_model: "llama3.2",
      configured: true,
    },
  ],
  default_provider: "ollama",
};

export const demoInsightsHealthCheck: InsightsHealthCheckResponse = {
  status: "no_providers",
  configured_providers: [],
  message: "Demo mode - Configure API keys in Settings to enable AI insights",
};

export const demoEnvStatus: EnvStatusResponse = {
  env_file_path: "/demo/.env",
  env_file_exists: false,
  providers: {
    openai: { env_var: "OPENAI_API_KEY", in_file: false, in_environment: false, configured: false, key_preview: "" },
    anthropic: { env_var: "ANTHROPIC_API_KEY", in_file: false, in_environment: false, configured: false, key_preview: "" },
    deepseek: { env_var: "DEEPSEEK_API_KEY", in_file: false, in_environment: false, configured: false, key_preview: "" },
    ollama: { env_var: "OLLAMA_BASE_URL", in_file: false, in_environment: false, configured: true, key_preview: "http...1434" },
  },
};

export const demoRandomGoodPrompt: RandomGoodPromptResponse = {
  text: "Please review the authentication middleware in src/middleware/auth.ts. I need you to: 1) Check for potential security vulnerabilities, especially around token validation 2) Suggest improvements for error handling 3) Ensure it follows our existing patterns in the codebase. The middleware should validate JWT tokens and attach user info to the request object.",
  excerpt: "Please review the authentication middleware in src/middleware/auth.ts. I need you to: 1) Check for potential security vulnerabilities...",
  project: "claudescope",
  timestamp: new Date().toISOString(),
  score: 92,
  reasons: ["Clear objective", "Specific file reference", "Numbered requirements", "Context provided"],
  why_good: "This prompt clearly states the file to review, provides numbered specific tasks, and gives context about expected behavior.",
};

// Demo mode flag - set via environment variable
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
