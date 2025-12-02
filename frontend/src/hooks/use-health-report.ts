"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useHealthReport(days = 7, project?: string) {
  return useQuery({
    queryKey: ["health-report", days, project],
    queryFn: () => api.getHealthReport(days, project),
  });
}

export function useAntipatterns(params?: {
  days?: number;
  severity?: string;
  type?: string[];
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["antipatterns", params],
    queryFn: () => api.getAntipatterns(params),
  });
}

export function useAntipatternSummary(days = 7) {
  return useQuery({
    queryKey: ["antipattern-summary", days],
    queryFn: () => api.getAntipatternSummary(days),
  });
}

export function useStatisticsOverview(days = 30) {
  return useQuery({
    queryKey: ["statistics-overview", days],
    queryFn: () => api.getStatisticsOverview(days),
  });
}

export function useRandomGoodPrompt(days = 30) {
  return useQuery({
    queryKey: ["random-good-prompt", days],
    queryFn: () => api.getRandomGoodPrompt(days),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}
