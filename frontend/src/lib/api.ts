/**
 * API client for ClaudeScope backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface HealthReportResponse {
  timestamp: string;
  overall_score: number;
  grade: string;
  dimensions: DimensionScore[];
  total_prompts_analyzed: number;
  period_days: number;
  improvement_suggestions: string[];
  trend_vs_last_week: number | null;
}

export interface DimensionScore {
  name: string;
  score: number;
  weight: number;
  issues: string[];
}

export interface AntipatternMatch {
  id: string;
  type: string;
  severity: string;
  prompt_excerpt: string;
  timestamp: string;
  project: string;
  session_id: string | null;
  confidence: number;
  explanation: string;
  fix_suggestion: string;
}

export interface AntipatternListResponse {
  total: number;
  items: AntipatternMatch[];
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export interface AntipatternSummaryResponse {
  total_detected: number;
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
  most_common: Array<{ type: string; count: number }>;
}

export interface StatisticsOverviewResponse {
  period_days: number;
  thinking: {
    total_triggers: number;
    by_trigger_word: Record<string, number>;
    by_project: Record<string, number>;
    by_day: Array<{ date: string; count: number }>;
    average_per_session: number;
  };
  tokens: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    by_model: Record<string, number>;
    by_project: Record<string, number>;
  };
  sessions_count: number;
  projects_count: number;
  prompts_count: number;
  average_prompts_per_session: number;
  average_prompt_length: number;
}

// AI Insights types
export interface InsightItem {
  type: "warning" | "tip" | "achievement";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionable?: string;
}

export interface InsightsResponse {
  insights: InsightItem[];
  summary: string;
  health_score?: number;
  error?: string;
}

export interface LLMProviderInfo {
  id: string;
  name: string;
  models: string[];
  default_model: string;
  configured: boolean;
}

export interface LLMProvidersResponse {
  providers: LLMProviderInfo[];
  default_provider: string;
}

export interface InsightsHealthCheckResponse {
  status: "ready" | "no_providers";
  configured_providers: string[];
  message: string;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export const api = {
  // Health Report
  getHealthReport: (days = 7, project?: string) =>
    fetchAPI<HealthReportResponse>(
      `/health-report?days=${days}${project ? `&project=${project}` : ""}`
    ),

  // Antipatterns
  getAntipatterns: (params?: {
    days?: number;
    severity?: string;
    type?: string[];
    limit?: number;
    offset?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.set("days", params.days.toString());
    if (params?.severity) searchParams.set("severity", params.severity);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    params?.type?.forEach((t) => searchParams.append("type", t));
    return fetchAPI<AntipatternListResponse>(`/antipatterns?${searchParams}`);
  },

  getAntipatternSummary: (days = 7) =>
    fetchAPI<AntipatternSummaryResponse>(`/antipatterns/summary?days=${days}`),

  // Statistics
  getStatisticsOverview: (days = 30) =>
    fetchAPI<StatisticsOverviewResponse>(`/statistics/overview?days=${days}`),

  // AI Insights
  getInsights: (params?: {
    days?: number;
    project?: string;
    llm_provider?: string;
    llm_model?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.set("days", params.days.toString());
    if (params?.project) searchParams.set("project", params.project);
    if (params?.llm_provider) searchParams.set("llm_provider", params.llm_provider);
    if (params?.llm_model) searchParams.set("llm_model", params.llm_model);
    return fetchAPI<InsightsResponse>(`/insights?${searchParams}`);
  },

  getLLMProviders: () => fetchAPI<LLMProvidersResponse>("/insights/providers"),

  getInsightsHealthCheck: () =>
    fetchAPI<InsightsHealthCheckResponse>("/insights/health-check"),
};
