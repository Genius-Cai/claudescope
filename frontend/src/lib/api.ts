/**
 * API client for ClaudeScope backend
 * Supports demo mode fallback when API is unavailable
 */

import {
  isDemoMode,
  demoHealthReport,
  demoAntipatternSummary,
  demoAntipatternList,
  demoStatisticsOverview,
  demoLLMProviders,
  demoInsightsHealthCheck,
  demoEnvStatus,
  demoRandomGoodPrompt,
} from "./demo-data";

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

// Settings API types
export interface SaveAPIKeyRequest {
  provider: string;
  api_key: string;
}

export interface SaveAPIKeyResponse {
  success: boolean;
  message: string;
  provider: string;
}

export interface TestAPIKeyRequest {
  provider: string;
  api_key: string;
}

export interface TestAPIKeyResponse {
  valid: boolean;
  message: string;
  provider: string;
  model_tested?: string;
}

export interface EnvStatusResponse {
  env_file_path: string;
  env_file_exists: boolean;
  providers: Record<string, {
    env_var: string;
    in_file: boolean;
    in_environment: boolean;
    configured: boolean;
    key_preview: string;
  }>;
}

// Good Prompts types
export interface RandomGoodPromptResponse {
  text: string;
  excerpt: string;
  project: string;
  timestamp: string;
  score: number;
  reasons: string[];
  why_good: string;
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

// Helper to try API call and fallback to demo data
async function fetchWithDemoFallback<T>(
  endpoint: string,
  demoData: T,
  options?: RequestInit
): Promise<T> {
  // If demo mode is explicitly enabled, return demo data
  if (isDemoMode) {
    return demoData;
  }

  // Try real API first
  try {
    return await fetchAPI<T>(endpoint, options);
  } catch {
    // Fallback to demo data on error
    console.warn(`API unavailable for ${endpoint}, using demo data`);
    return demoData;
  }
}

export const api = {
  // Health Report
  getHealthReport: (days = 7, project?: string) =>
    fetchWithDemoFallback<HealthReportResponse>(
      `/health-report?days=${days}${project ? `&project=${project}` : ""}`,
      demoHealthReport
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
    return fetchWithDemoFallback<AntipatternListResponse>(
      `/antipatterns?${searchParams}`,
      demoAntipatternList
    );
  },

  getAntipatternSummary: (days = 7) =>
    fetchWithDemoFallback<AntipatternSummaryResponse>(
      `/antipatterns/summary?days=${days}`,
      demoAntipatternSummary
    ),

  // Statistics
  getStatisticsOverview: (days = 30) =>
    fetchWithDemoFallback<StatisticsOverviewResponse>(
      `/statistics/overview?days=${days}`,
      demoStatisticsOverview
    ),

  // AI Insights - no demo fallback, requires real LLM
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

  getLLMProviders: () =>
    fetchWithDemoFallback<LLMProvidersResponse>(
      "/insights/providers",
      demoLLMProviders
    ),

  getInsightsHealthCheck: () =>
    fetchWithDemoFallback<InsightsHealthCheckResponse>(
      "/insights/health-check",
      demoInsightsHealthCheck
    ),

  // Settings API - no demo fallback, requires real backend
  saveAPIKey: (data: SaveAPIKeyRequest) =>
    fetchAPI<SaveAPIKeyResponse>("/settings/api-key", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  testAPIKey: (data: TestAPIKeyRequest) =>
    fetchAPI<TestAPIKeyResponse>("/settings/test-api-key", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getEnvStatus: () =>
    fetchWithDemoFallback<EnvStatusResponse>(
      "/settings/env-status",
      demoEnvStatus
    ),

  // Good Prompts
  getRandomGoodPrompt: (days = 30) =>
    fetchWithDemoFallback<RandomGoodPromptResponse>(
      `/good-prompts/random?days=${days}`,
      demoRandomGoodPrompt
    ),
};
