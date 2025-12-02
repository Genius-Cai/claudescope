"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw, MessageSquare, Folder } from "lucide-react";
import { useHealthReport, useRandomGoodPrompt } from "@/hooks/use-health-report";
import { cn } from "@/lib/utils";

const gradeConfig: Record<string, { color: string; bgColor: string; glowColor: string }> = {
  A: { color: "text-emerald-500", bgColor: "from-emerald-500/20 to-emerald-500/5", glowColor: "shadow-emerald-500/50" },
  B: { color: "text-green-500", bgColor: "from-green-500/20 to-green-500/5", glowColor: "shadow-green-500/50" },
  C: { color: "text-yellow-500", bgColor: "from-yellow-500/20 to-yellow-500/5", glowColor: "shadow-yellow-500/50" },
  D: { color: "text-orange-500", bgColor: "from-orange-500/20 to-orange-500/5", glowColor: "shadow-orange-500/50" },
  F: { color: "text-red-500", bgColor: "from-red-500/20 to-red-500/5", glowColor: "shadow-red-500/50" },
};

function CircularProgress({ score, grade }: { score: number; grade: string }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = gradeConfig[grade] || gradeConfig.C;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(
          "text-3xl font-bold transition-all duration-300",
          config.color
        )}>
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">/100</span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{Math.round(displayValue)}</>;
}

// Good Prompt Example component
function GoodPromptExample() {
  const { data, isLoading, error, refetch } = useRandomGoodPrompt();

  if (isLoading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data || data.score === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Good Prompt Example
          </span>
        </div>
        <button
          onClick={() => refetch()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Show another example"
        >
          <RefreshCw className="w-3 h-3 text-gray-400 hover:text-purple-500" />
        </button>
      </div>

      {/* Prompt text */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-2">
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
          "{data.excerpt}"
        </p>
      </div>

      {/* Project and score */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
          <Folder className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{data.project}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-purple-500 font-medium">{data.score.toFixed(0)}</span>
          <span className="text-gray-400">/100</span>
        </div>
      </div>

      {/* Why good */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
        {data.why_good}
      </p>
    </div>
  );
}

export function HealthScoreCard() {
  const { data, isLoading, error } = useHealthReport(7);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative h-full">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="flex items-center gap-6">
            <div className="skeleton h-28 w-28 rounded-full" />
            <div className="flex-1 space-y-3">
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-3/4" />
              <div className="skeleton h-3 w-5/6" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in h-full">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Prompt Health
        </h3>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
            <Sparkles className="w-6 h-6" />
          </div>
          <p>Unable to load health data</p>
        </div>
      </div>
    );
  }

  const { overall_score, grade, trend_vs_last_week, dimensions } = data;
  const config = gradeConfig[grade] || gradeConfig.C;

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700",
      "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
      "animate-fade-in-up group overflow-hidden relative h-full"
    )}>
      {/* Background gradient effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        config.bgColor
      )} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Prompt Health Score
            </h3>
          </div>
          <span className={cn(
            "text-4xl font-black transition-all duration-300",
            config.color,
            `grade-${grade}`
          )}>
            {grade}
          </span>
        </div>

        {/* Main content row */}
        <div className="flex items-start gap-4">
          {/* Circular progress */}
          <CircularProgress score={overall_score} grade={grade} />

          {/* Dimensions */}
          <div className="flex-1 space-y-2">
            {dimensions.slice(0, 4).map((dim, index) => (
              <div
                key={dim.name}
                className="space-y-0.5"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 capitalize font-medium">
                    {dim.name.replace("_", " ")}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    <AnimatedNumber value={dim.score} />
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      dim.score >= 70
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                        : dim.score >= 50
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                        : "bg-gradient-to-r from-red-400 to-red-600"
                    )}
                    style={{
                      width: `${dim.score}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trend indicator */}
        {trend_vs_last_week !== null && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend_vs_last_week > 0 ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  +{trend_vs_last_week}
                </span>
              </div>
            ) : trend_vs_last_week < 0 ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  {trend_vs_last_week}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Minus className="w-3 h-3 text-gray-400" />
                <span className="text-gray-500 font-medium">No change</span>
              </div>
            )}
            <span className="text-gray-400 dark:text-gray-500">vs last week</span>
          </div>
        )}

        {/* Good Prompt Example section */}
        <GoodPromptExample />
      </div>
    </div>
  );
}
