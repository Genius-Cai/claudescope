"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Target,
  Zap,
  Clock,
  ArrowRight,
  Star,
  Flame,
  Shield,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useHealthReport, useStatisticsOverview, useAntipatternSummary } from "@/hooks/use-health-report";
import { cn } from "@/lib/utils";
import type { HealthReportResponse, StatisticsOverviewResponse, AntipatternSummaryResponse } from "@/lib/api";
import gsap from "gsap";

// Types for insights
interface Insight {
  id: string;
  type: "positive" | "warning" | "tip" | "achievement";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "health" | "usage" | "patterns" | "efficiency";
  actionable?: string;
}

interface Trend {
  metric: string;
  direction: "up" | "down" | "stable";
  value: number;
  description: string;
}

// Insight card component
function InsightCard({
  insight,
  delay = 0,
}: {
  insight: Insight;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: delay / 1000, ease: "back.out(1.7)" }
        );
      }
    });
    return () => {
      ctx.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount - delay is stable for component lifetime

  const typeConfig = {
    positive: {
      icon: CheckCircle2,
      color: "emerald",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    warning: {
      icon: AlertTriangle,
      color: "orange",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200 dark:border-orange-800",
    },
    tip: {
      icon: Lightbulb,
      color: "cyan",
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
      text: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-200 dark:border-cyan-800",
    },
    achievement: {
      icon: Star,
      color: "purple",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  const impactBadge = {
    high: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    low: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 shadow-lg border transition-all duration-300",
        "bg-white dark:bg-gray-800 hover:shadow-xl hover:-translate-y-1 cursor-pointer",
        config.border
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      role="button"
      aria-expanded={isExpanded}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      }}
    >
      {/* Gradient background accent */}
      <div className={cn("absolute top-0 left-0 w-1 h-full", config.bg.replace("bg-", "bg-gradient-to-b from-").replace("/30", " to-transparent"))} />

      <div className="flex items-start gap-4">
        <div className={cn("p-2.5 rounded-xl shrink-0", config.bg)}>
          <Icon className={cn("w-5 h-5", config.text)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
              {insight.title}
            </h3>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium shrink-0", impactBadge[insight.impact])}>
              {insight.impact}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {insight.description}
          </p>

          {isExpanded && insight.actionable && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Recommended Action
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                {insight.actionable}
              </p>
            </div>
          )}
        </div>

        <ArrowRight
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0",
            isExpanded && "rotate-90"
          )}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// Trend indicator component
function TrendIndicator({ trend }: { trend: Trend }) {
  const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : RefreshCw;
  const color = trend.direction === "up" ? "text-emerald-500" : trend.direction === "down" ? "text-red-500" : "text-gray-500";

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
      <div className={cn("p-2 rounded-lg bg-white dark:bg-gray-800", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{trend.metric}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{trend.description}</p>
      </div>
      <span className={cn("text-lg font-bold", color)}>
        {trend.direction === "up" ? "+" : trend.direction === "down" ? "-" : ""}
        {Math.abs(trend.value)}%
      </span>
    </div>
  );
}

// AI Score ring
function AIScoreRing({ score, label }: { score: number; label: string }) {
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (ringRef.current) {
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (score / 100) * circumference;
      animation = gsap.fromTo(
        ringRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: offset, duration: 1.5, delay: 0.5, ease: "power3.out" }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [score]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="relative w-32 h-32" role="img" aria-label={`${label} score: ${score} out of 100`}>
      <svg className="w-full h-full -rotate-90" aria-hidden="true">
        <circle
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          className="dark:stroke-gray-700"
        />
        <circle
          ref={ringRef}
          cx="64"
          cy="64"
          r="45"
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 45}
          strokeDashoffset={2 * Math.PI * 45}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-gray-900 dark:text-white">{score}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );
}

// Category filter button
function CategoryButton({
  category,
  active,
  onClick,
  count,
}: {
  category: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  const categoryIcons: Record<string, React.ElementType> = {
    all: Sparkles,
    health: Shield,
    usage: Clock,
    patterns: Brain,
    efficiency: Zap,
  };

  const Icon = categoryIcons[category] || Sparkles;

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
        active
          ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="capitalize">{category}</span>
      <span className={cn(
        "px-1.5 py-0.5 rounded-full text-xs",
        active ? "bg-white/20" : "bg-gray-200 dark:bg-gray-600"
      )}>
        {count}
      </span>
    </button>
  );
}

// Generate insights from data
function generateInsights(
  healthData: HealthReportResponse | undefined,
  statsData: StatisticsOverviewResponse | undefined,
  antipatternData: AntipatternSummaryResponse | undefined
): Insight[] {
  const insights: Insight[] = [];

  // Health-based insights
  if (healthData) {
    if (healthData.overall_score >= 90) {
      insights.push({
        id: "health-excellent",
        type: "achievement",
        title: "Excellent Health Score!",
        description: `Your usage health score of ${healthData.overall_score} is exceptional. You're using Claude efficiently and effectively.`,
        impact: "high",
        category: "health",
      });
    } else if (healthData.overall_score < 60) {
      insights.push({
        id: "health-improve",
        type: "warning",
        title: "Health Score Needs Attention",
        description: `Your health score of ${healthData.overall_score} indicates room for improvement in your Claude usage patterns.`,
        impact: "high",
        category: "health",
        actionable: "Review the Health Report for specific areas to improve. Focus on the lowest-scoring dimensions first.",
      });
    }

    // Dimension-specific insights
    healthData.dimensions?.forEach((dim: any) => {
      if (dim.score < 70 && dim.issues?.length > 0) {
        insights.push({
          id: `dim-${dim.name}`,
          type: "warning",
          title: `${dim.name} Needs Improvement`,
          description: `Score: ${dim.score}/100. ${dim.issues[0]}`,
          impact: dim.score < 50 ? "high" : "medium",
          category: "health",
          actionable: dim.issues.length > 1 ? dim.issues[1] : "Review your prompts for this dimension.",
        });
      }
    });

    // Add improvement suggestions as tips
    healthData.improvement_suggestions?.slice(0, 2).forEach((suggestion: string, index: number) => {
      insights.push({
        id: `suggestion-${index}`,
        type: "tip",
        title: "Improvement Suggestion",
        description: suggestion,
        impact: "medium",
        category: "health",
      });
    });
  }

  // Statistics-based insights
  if (statsData) {
    // Extended thinking insights
    if (statsData.thinking?.total_triggers > 50) {
      insights.push({
        id: "thinking-power-user",
        type: "achievement",
        title: "Extended Thinking Power User",
        description: `You've triggered extended thinking ${statsData.thinking.total_triggers} times! You're leveraging Claude's deep reasoning capabilities.`,
        impact: "medium",
        category: "usage",
      });
    } else if (statsData.thinking?.total_triggers < 5 && statsData.prompts_count > 50) {
      insights.push({
        id: "thinking-underused",
        type: "tip",
        title: "Try Extended Thinking",
        description: "You haven't used extended thinking much. For complex problems, try using thinking triggers for deeper analysis.",
        impact: "medium",
        category: "efficiency",
        actionable: "Use phrases like 'think step by step', 'analyze carefully', or 'reason through this' to trigger extended thinking.",
      });
    }

    // Session efficiency
    const avgPromptsPerSession = statsData.average_prompts_per_session ?? 0;
    if (avgPromptsPerSession > 20) {
      insights.push({
        id: "session-efficiency",
        type: "positive",
        title: "High Session Engagement",
        description: `You average ${avgPromptsPerSession.toFixed(1)} prompts per session, indicating deep and productive conversations.`,
        impact: "medium",
        category: "usage",
      });
    } else if (avgPromptsPerSession < 3 && statsData.sessions_count > 10) {
      insights.push({
        id: "session-short",
        type: "tip",
        title: "Consider Longer Sessions",
        description: "Your sessions are quite short. Longer sessions often lead to better context and more refined outputs.",
        impact: "low",
        category: "efficiency",
        actionable: "Try iterating on Claude's responses to refine them before starting a new session.",
      });
    }

    // Prompt length insights
    const avgLength = statsData.average_prompt_length ?? 0;
    if (avgLength > 500) {
      insights.push({
        id: "prompt-detailed",
        type: "positive",
        title: "Detailed Prompts",
        description: `Your average prompt length of ${avgLength.toFixed(0)} characters shows you provide good context for Claude.`,
        impact: "medium",
        category: "patterns",
      });
    } else if (avgLength < 50) {
      insights.push({
        id: "prompt-short",
        type: "tip",
        title: "Add More Context",
        description: "Your prompts are quite brief. More context usually leads to better responses.",
        impact: "medium",
        category: "patterns",
        actionable: "Include relevant background, constraints, and expected output format in your prompts.",
      });
    }

    // Token efficiency
    if (statsData.tokens?.total_tokens > 100000) {
      const inputRatio = statsData.tokens.input_tokens / statsData.tokens.total_tokens;
      if (inputRatio > 0.6) {
        insights.push({
          id: "token-input-heavy",
          type: "tip",
          title: "High Input Token Ratio",
          description: `${(inputRatio * 100).toFixed(0)}% of your tokens are input. Consider condensing context or using references.`,
          impact: "low",
          category: "efficiency",
          actionable: "Try summarizing large documents before including them, or reference previous context instead of repeating.",
        });
      }
    }
  }

  // Antipattern-based insights
  if (antipatternData) {
    const total = antipatternData.total_detected ?? 0;
    if (total === 0) {
      insights.push({
        id: "no-antipatterns",
        type: "achievement",
        title: "Clean Usage Patterns!",
        description: "No anti-patterns detected in your recent usage. You're following best practices!",
        impact: "high",
        category: "patterns",
      });
    } else if (total > 10) {
      insights.push({
        id: "many-antipatterns",
        type: "warning",
        title: "Multiple Anti-patterns Detected",
        description: `${total} anti-patterns found in your usage. Review them to improve your prompting techniques.`,
        impact: "high",
        category: "patterns",
        actionable: "Check the Anti-patterns page to see specific issues and fix suggestions.",
      });
    }

    // Severity-based insights
    const critical = antipatternData.by_severity?.critical ?? 0;
    if (critical > 0) {
      insights.push({
        id: "critical-antipatterns",
        type: "warning",
        title: "Critical Issues Found",
        description: `${critical} critical anti-patterns detected that may significantly impact output quality.`,
        impact: "high",
        category: "patterns",
        actionable: "Address critical issues first - they have the biggest impact on response quality.",
      });
    }

    // Most common antipattern
    const mostCommon = antipatternData.most_common?.[0];
    if (mostCommon && mostCommon.count > 3) {
      insights.push({
        id: "common-antipattern",
        type: "tip",
        title: `Frequent Pattern: ${mostCommon.type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}`,
        description: `This anti-pattern appeared ${mostCommon.count} times. Understanding it can significantly improve your results.`,
        impact: "medium",
        category: "patterns",
      });
    }
  }

  // Sort by impact priority
  const impactOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return insights;
}

// Generate trends from data
function generateTrends(
  healthData: HealthReportResponse | undefined,
  statsData: StatisticsOverviewResponse | undefined
): Trend[] {
  const trends: Trend[] = [];

  if (healthData?.trend_vs_last_week !== null && healthData?.trend_vs_last_week !== undefined) {
    trends.push({
      metric: "Health Score",
      direction: healthData.trend_vs_last_week > 0 ? "up" : healthData.trend_vs_last_week < 0 ? "down" : "stable",
      value: Math.abs(healthData.trend_vs_last_week),
      description: healthData.trend_vs_last_week > 0 ? "Improving from last week" : healthData.trend_vs_last_week < 0 ? "Declined from last week" : "Stable from last week",
    });
  }

  if (statsData?.thinking?.average_per_session) {
    trends.push({
      metric: "Thinking Usage",
      direction: statsData.thinking.average_per_session > 1 ? "up" : "stable",
      value: Math.round(statsData.thinking.average_per_session * 10),
      description: `${statsData.thinking.average_per_session.toFixed(1)} triggers per session`,
    });
  }

  return trends;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// Main Insights Page
export default function InsightsPage() {
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthReport(7);
  const { data: statsData, isLoading: statsLoading, error: statsError } = useStatisticsOverview(30);
  const { data: antipatternData, isLoading: antipatternLoading, error: antipatternError } = useAntipatternSummary(7);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [announcement, setAnnouncement] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);

  const isLoading = healthLoading || statsLoading || antipatternLoading;
  const hasError = healthError || statsError || antipatternError;

  // Generate insights from data
  const insights = useMemo(() => {
    if (!healthData && !statsData && !antipatternData) return [];
    return generateInsights(healthData, statsData, antipatternData);
  }, [healthData, statsData, antipatternData]);

  // Generate trends
  const trends = useMemo(() => {
    return generateTrends(healthData, statsData);
  }, [healthData, statsData]);

  // Filter insights by category
  const filteredInsights = useMemo(() => {
    if (selectedCategory === "all") return insights;
    return insights.filter((i) => i.category === selectedCategory);
  }, [insights, selectedCategory]);

  // Count by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: insights.length };
    insights.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [insights]);

  // Announce filter changes for screen readers
  useEffect(() => {
    if (!isLoading) {
      setAnnouncement(
        filteredInsights.length > 0
          ? `Showing ${filteredInsights.length} insights in ${selectedCategory} category`
          : `No insights found in ${selectedCategory} category`
      );
    }
  }, [filteredInsights.length, selectedCategory, isLoading]);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (headerRef.current && !isLoading && !hasError) {
      animation = gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [isLoading, hasError]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto w-fit mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Insights
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Unable to fetch data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const overallScore = healthData?.overall_score ?? 0;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {/* Header */}
      <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-2xl">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">AI Insights</h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Personalized recommendations based on your usage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <AIScoreRing score={overallScore} label="Health" />
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Insights</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{insights.length}</p>
          </div>
        </div>
      </div>

      {/* Trends Section */}
      {trends.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trends</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend) => (
              <TrendIndicator key={trend.metric} trend={trend} />
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter insights by category">
        {["all", "health", "usage", "patterns", "efficiency"].map((category) => (
          <CategoryButton
            key={category}
            category={category}
            active={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
            count={categoryCounts[category] || 0}
          />
        ))}
      </div>

      {/* Insights Grid */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((insight, index) => (
            <InsightCard key={insight.id} insight={insight} delay={100 + index * 80} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-700 w-fit mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Insights in This Category
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try selecting a different category or check back after more usage data is collected.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Flame className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/health"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all duration-300 group"
          >
            <Shield className="w-5 h-5 text-emerald-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Health Report</span>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/antipatterns"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all duration-300 group"
          >
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Check Anti-patterns</span>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="/statistics"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all duration-300 group"
          >
            <Clock className="w-5 h-5 text-cyan-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">View Statistics</span>
            <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
        <div className="flex items-center gap-2 text-gray-400">
          <Brain className="w-4 h-4" />
          <span className="text-sm">AI-powered insights by ClaudeScope</span>
        </div>
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />
      </div>
    </div>
  );
}
