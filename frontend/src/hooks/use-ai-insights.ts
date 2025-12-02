"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { api, InsightsResponse, LLMProvidersResponse } from "@/lib/api";

interface UseAIInsightsOptions {
  days?: number;
  project?: string;
  enabled?: boolean;
}

export function useAIInsights(options: UseAIInsightsOptions = {}) {
  const { days = 30, project, enabled = true } = options;
  const [llmProvider, setLLMProvider] = useState<string>("openai");
  const [llmModel, setLLMModel] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch LLM providers on mount
  const providersQuery = useQuery({
    queryKey: ["llm-providers"],
    queryFn: () => api.getLLMProviders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });

  // Update default provider/model when providers are loaded
  const updateDefaultProvider = useCallback(
    (data: LLMProvidersResponse) => {
      if (!llmModel && data.providers.length > 0) {
        const defaultProvider =
          data.providers.find((p) => p.configured) ||
          data.providers.find((p) => p.id === data.default_provider);

        if (defaultProvider) {
          setLLMProvider(defaultProvider.id);
          setLLMModel(defaultProvider.default_model);
        }
      }
    },
    [llmModel]
  );

  // Set default when providers load
  if (providersQuery.data && !llmModel) {
    updateDefaultProvider(providersQuery.data);
  }

  // Main insights query - manual trigger via mutation
  const insightsMutation = useMutation({
    mutationFn: () =>
      api.getInsights({
        days,
        project,
        llm_provider: llmProvider,
        llm_model: llmModel,
      }),
    onSuccess: (data) => {
      // Cache the result
      queryClient.setQueryData(
        ["ai-insights", days, project, llmProvider, llmModel],
        data
      );
    },
  });

  // Generate insights handler
  const generateInsights = useCallback(() => {
    insightsMutation.mutate();
  }, [insightsMutation]);

  // Update LLM settings
  const setLLMSettings = useCallback(
    (provider: string, model: string) => {
      setLLMProvider(provider);
      setLLMModel(model);
      // Clear cached insights when settings change
      queryClient.removeQueries({ queryKey: ["ai-insights"] });
    },
    [queryClient]
  );

  return {
    // Insights data
    insights: insightsMutation.data?.insights || [],
    summary: insightsMutation.data?.summary || "",
    healthScore: insightsMutation.data?.health_score,
    error: insightsMutation.data?.error || insightsMutation.error?.message,

    // State
    isLoading: insightsMutation.isPending,
    isError: insightsMutation.isError,
    isSuccess: insightsMutation.isSuccess,

    // LLM providers
    providers: providersQuery.data?.providers || [],
    providersLoading: providersQuery.isLoading,

    // Current settings
    llmProvider,
    llmModel,

    // Actions
    generateInsights,
    setLLMSettings,
  };
}

// Hook for just checking insights health
export function useInsightsHealthCheck() {
  return useQuery({
    queryKey: ["insights-health-check"],
    queryFn: () => api.getInsightsHealthCheck(),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook for cached insights (auto-fetch)
export function useCachedInsights(options: UseAIInsightsOptions = {}) {
  const { days = 30, project, enabled = true } = options;
  const [llmProvider, setLLMProvider] = useState<string>("openai");
  const [llmModel, setLLMModel] = useState<string>("");

  return useQuery({
    queryKey: ["ai-insights", days, project, llmProvider, llmModel],
    queryFn: () =>
      api.getInsights({
        days,
        project,
        llm_provider: llmProvider,
        llm_model: llmModel,
      }),
    enabled: enabled && !!llmProvider,
    staleTime: 10 * 60 * 1000, // 10 minutes - insights don't change often
    retry: 1, // Only retry once for LLM calls
  });
}
