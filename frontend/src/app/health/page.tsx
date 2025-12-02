"use client";

import { useEffect, useRef, useState } from "react";
import {
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Target,
  Lightbulb,
  Activity,
  Calendar,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useHealthReport } from "@/hooks/use-health-report";
import { cn } from "@/lib/utils";
import gsap from "gsap";

const gradeConfig: Record<
  string,
  { color: string; bgColor: string; glowColor: string; description: string }
> = {
  A: {
    color: "text-emerald-500",
    bgColor: "from-emerald-500/20 to-emerald-500/5",
    glowColor: "shadow-emerald-500/50",
    description: "Excellent prompt quality!",
  },
  B: {
    color: "text-green-500",
    bgColor: "from-green-500/20 to-green-500/5",
    glowColor: "shadow-green-500/50",
    description: "Good prompt practices",
  },
  C: {
    color: "text-yellow-500",
    bgColor: "from-yellow-500/20 to-yellow-500/5",
    glowColor: "shadow-yellow-500/50",
    description: "Room for improvement",
  },
  D: {
    color: "text-orange-500",
    bgColor: "from-orange-500/20 to-orange-500/5",
    glowColor: "shadow-orange-500/50",
    description: "Needs attention",
  },
  F: {
    color: "text-red-500",
    bgColor: "from-red-500/20 to-red-500/5",
    glowColor: "shadow-red-500/50",
    description: "Significant issues detected",
  },
};

// Large animated circular progress
function LargeCircularProgress({
  score,
  grade,
}: {
  score: number;
  grade: string;
}) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = gradeConfig[grade] || gradeConfig.C;
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-56 h-56 group">
      {/* Subtle glow effect - using gradient colors */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.3))"
        }}
      />

      <svg
        className="w-56 h-56 transform -rotate-90"
        viewBox="0 0 200 200"
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#healthGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-[2000ms] ease-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient
            id="healthGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "text-7xl font-black transition-all duration-300",
            config.color
          )}
        >
          {grade}
        </span>
        <div className="flex items-center gap-1 mt-2">
          <span className="text-3xl font-bold text-gray-700 dark:text-gray-200">
            {Math.round(animatedScore)}
          </span>
          <span className="text-lg text-gray-400">/100</span>
        </div>
      </div>
    </div>
  );
}

// Dimension score bar
function DimensionBar({
  name,
  score,
  weight,
  issues,
  delay = 0,
}: {
  name: string;
  score: number;
  weight: number;
  issues: string[];
  delay?: number;
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(score);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (barRef.current) {
      animation = gsap.fromTo(
        barRef.current,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, delay: delay / 1000, ease: "power3.out" }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [delay]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-400 to-emerald-600";
    if (score >= 60) return "from-green-400 to-green-600";
    if (score >= 40) return "from-yellow-400 to-yellow-600";
    if (score >= 20) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  return (
    <div ref={barRef} className="opacity-0">
      <button
        onClick={() => issues.length > 0 && setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">
              {name.replace(/_/g, " ")}
            </span>
            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              {Math.round(weight * 100)}% weight
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {Math.round(animatedWidth)}
            </span>
            {issues.length > 0 && (
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-[1500ms] ease-out bg-gradient-to-r",
              getScoreColor(score)
            )}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
      </button>

      {/* Issues dropdown */}
      {isExpanded && issues.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-orange-400/50 space-y-2 animate-fade-in">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
            >
              <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <span>{issue}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Suggestion card
function SuggestionCard({
  suggestion,
  index,
}: {
  suggestion: string;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (cardRef.current) {
      animation = gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: 0.8 + index * 0.1,
          ease: "back.out(1.7)",
        }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="opacity-0 flex items-start gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors group"
    >
      <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
        <Lightbulb className="w-5 h-5 text-purple-400" />
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
        {suggestion}
      </p>
    </div>
  );
}

// Period selector
function PeriodSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const periods = [
    { label: "7 Days", value: 7 },
    { label: "14 Days", value: 14 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
  ];

  return (
    <div
      className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl"
      role="group"
      aria-label="Select time period for health report"
    >
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          aria-pressed={value === period.value}
          aria-label={`Show data for ${period.label.toLowerCase()}`}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            value === period.value
              ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex justify-center">
          <div className="w-56 h-56 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HealthReportPage() {
  const [days, setDays] = useState(7);
  const { data, isLoading, error, refetch, isFetching } = useHealthReport(days);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && data && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );

        gsap.fromTo(
          mainRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [isLoading, data]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Unable to load health report
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please check your connection and try again
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              "Retry"
            )}
          </button>
        </div>
      </div>
    );
  }

  const {
    overall_score,
    grade,
    dimensions,
    total_prompts_analyzed,
    period_days,
    improvement_suggestions,
    trend_vs_last_week,
  } = data;
  const config = gradeConfig[grade] || gradeConfig.C;

  return (
    <div ref={containerRef} className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between opacity-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Health Report
            </h1>
            {isFetching && (
              <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Comprehensive analysis of your prompt quality and usage patterns
          </p>
        </div>
        <PeriodSelector value={days} onChange={setDays} />
      </div>

      {/* Main Content */}
      <div ref={mainRef} className="opacity-0 space-y-8">
        {/* Score Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score Circle */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <LargeCircularProgress score={overall_score} grade={grade} />
              <p className={cn("mt-4 text-lg font-medium", config.color)}>
                {config.description}
              </p>

              {/* Trend */}
              {trend_vs_last_week !== null && (
                <div className="mt-4 flex items-center gap-2">
                  {trend_vs_last_week > 0 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +{trend_vs_last_week} pts
                      </span>
                    </div>
                  ) : trend_vs_last_week < 0 ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {trend_vs_last_week} pts
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <Minus className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-500">
                        No change
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-400">vs last week</span>
                </div>
              )}
            </div>

            {/* Dimension Scores */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Dimension Breakdown
                </h3>
              </div>
              {dimensions.map((dim, index) => (
                <DimensionBar
                  key={dim.name}
                  name={dim.name}
                  score={dim.score}
                  weight={dim.weight}
                  issues={dim.issues}
                  delay={300 + index * 100}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {total_prompts_analyzed}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Prompts Analyzed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {period_days}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Days Period
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {dimensions.filter((d) => d.score >= 70).length}/{dimensions.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dimensions Passing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Suggestions */}
        {improvement_suggestions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Improvement Suggestions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {improvement_suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
