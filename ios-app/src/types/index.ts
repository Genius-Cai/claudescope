// API 响应类型 - 与 Web 版本共享

export interface HealthDimension {
  name: string;
  score: number;
  weight: number;
  details: string;
}

export interface ImprovementSuggestion {
  category: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  impact: string;
}

export interface HealthReportResponse {
  overall_score: number;
  grade: string;
  dimensions: HealthDimension[];
  improvement_suggestions: ImprovementSuggestion[];
  analysis_timestamp: string;
}

export interface TokenUsage {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  cache_creation_tokens: number;
  by_model: Record<string, number>;
  by_project: Record<string, number>;
}

export interface ThinkingDayCount {
  date: string;
  count: number;
}

export interface ThinkingUsage {
  total_triggers: number;
  by_trigger_word: Record<string, number>;
  by_project: Record<string, number>;
  by_day: ThinkingDayCount[];
  average_per_session: number;
}

export interface CategoriesStats {
  total_categorized: number;
  by_category: Record<string, number>;
  by_category_percentage: Record<string, number>;
  prompts_with_images: number;
  image_percentage: number;
}

export interface StatisticsOverviewResponse {
  period_days: number;
  thinking: ThinkingUsage;
  tokens: TokenUsage;
  categories: CategoriesStats;
  sessions_count: number;
  projects_count: number;
  prompts_count: number;
  average_prompts_per_session: number;
  average_prompt_length: number;
}

export interface AntipatternMatch {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  explanation: string;
  fix_suggestion: string;
  prompt_excerpt: string;  // 实际的 prompt 内容
  project: string;         // 所属项目
  file_path?: string;
  line_number?: number;
}

// API 返回的完整反模式响应
export interface AntipatternResponse {
  total: number;
  items: AntipatternMatch[];
  by_type: Record<string, number>;
  by_severity: Record<string, number>;
}

export interface AntipatternSummary {
  total_count: number;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
}

// 优质 Prompt 类型 - 匹配后端 GoodPromptItem
export interface GoodPromptItem {
  text: string;
  excerpt: string;
  project: string;
  timestamp: string;
  score: number;
  dimension_scores: Record<string, number>;
  reasons: string[];
  categories: string[];
}

// 优质 Prompt 列表响应
export interface GoodPromptsResponse {
  total: number;
  items: GoodPromptItem[];
  average_score: number;
  summary: {
    total_prompts: number;
    good_prompts_count: number;
    average_score: number;
    score_distribution: Record<string, number>;
  };
}

// 项目统计类型 - 匹配后端 API 响应
export interface ProjectStats {
  name: string;
  sessions: number;
  prompts: number;
  tokens: number;
  thinking_triggers: number;
}

// 项目列表响应
export interface ProjectsResponse {
  projects: ProjectStats[];
}

export interface InsightItem {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions?: string[];
}

export interface InsightsResponse {
  insights: InsightItem[];
  summary: string;
  health_score: number;
  generated_at: string;
}

// Navigation 类型
export type RootStackParamList = {
  Main: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Statistics: undefined;
  Health: undefined;
  Antipatterns: undefined;
  Insights: undefined;
};
