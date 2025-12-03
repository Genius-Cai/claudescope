import axios, {AxiosInstance, AxiosError} from 'axios';
import {
  HealthReportResponse,
  StatisticsOverviewResponse,
  AntipatternMatch,
  AntipatternResponse,
  AntipatternSummary,
  InsightsResponse,
  GoodPromptItem,
  GoodPromptsResponse,
  ProjectStats,
  ProjectsResponse,
} from '../types';

// API 基础配置
// iOS 模拟器无法访问 localhost，需要使用 Mac 的实际 IP 地址
const API_BASE_URL = __DEV__
  ? 'http://192.168.50.217:8000/api' // 开发环境 - Mac IP 地址
  : 'https://api.claudescope.app/api'; // 生产环境

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 减少超时时间
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      config => {
        // 可以在这里添加认证 token
        return config;
      },
      error => Promise.reject(error),
    );

    // 响应拦截器 - 使用 console.warn 避免红色错误弹窗
    this.client.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        // 使用 warn 而不是 error，避免开发模式下的红色弹窗
        if (__DEV__) {
          console.warn('API Warning:', error.message);
        }
        return Promise.reject(error);
      },
    );
  }

  // Health Report
  async getHealthReport(): Promise<HealthReportResponse> {
    const response = await this.client.get<HealthReportResponse>(
      '/health-report',
    );
    return response.data;
  }

  // Statistics
  async getStatisticsOverview(): Promise<StatisticsOverviewResponse> {
    const response = await this.client.get<StatisticsOverviewResponse>(
      '/statistics/overview',
    );
    return response.data;
  }

  // Antipatterns - 返回完整响应（包含 items 数组和统计信息）
  async getAntipatterns(): Promise<AntipatternResponse> {
    const response = await this.client.get<AntipatternResponse>('/antipatterns');
    return response.data;
  }

  async getAntipatternsSummary(): Promise<AntipatternSummary> {
    const response = await this.client.get<AntipatternSummary>(
      '/antipatterns/summary',
    );
    return response.data;
  }

  // Good Prompts - 学习优质 Prompt（返回列表，不是单个）
  async getGoodPrompts(limit: number = 10): Promise<GoodPromptsResponse> {
    const response = await this.client.get<GoodPromptsResponse>('/good-prompts', {
      params: {limit, min_score: 65},
    });
    return response.data;
  }

  // Projects - 项目级别统计
  async getProjects(): Promise<ProjectStats[]> {
    const response = await this.client.get<ProjectsResponse>('/statistics/projects');
    return response.data.projects;
  }

  // AI Insights
  async getInsights(provider?: string): Promise<InsightsResponse> {
    const response = await this.client.get<InsightsResponse>('/insights', {
      params: provider ? {provider} : undefined,
    });
    return response.data;
  }

  // Settings
  async testApiKey(provider: string, apiKey: string): Promise<boolean> {
    const response = await this.client.post<{success: boolean}>(
      '/settings/test-api-key',
      {
        provider,
        api_key: apiKey,
      },
    );
    return response.data.success;
  }
}

export const api = new ApiClient();
