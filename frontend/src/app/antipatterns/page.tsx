"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Clock,
  Folder,
  XCircle,
  AlertOctagon,
  Info,
  Flame,
} from "lucide-react";
import { useAntipatterns, useAntipatternSummary } from "@/hooks/use-health-report";
import { cn } from "@/lib/utils";
import gsap from "gsap";

// Anti-pattern type configurations
const antipatternConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bgColor: string; description: string }
> = {
  toothpaste: {
    label: "Toothpaste",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Incremental prompts that could be combined",
  },
  raw_paste: {
    label: "Raw Paste",
    icon: AlertOctagon,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Unformatted code or data dumps",
  },
  vague_instruction: {
    label: "Vague Instruction",
    icon: Info,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Unclear or ambiguous requests",
  },
  context_explosion: {
    label: "Context Explosion",
    icon: AlertCircle,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    description: "Excessively large context that could be reduced",
  },
};

// Severity configurations
const severityConfig: Record<
  string,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  low: {
    label: "Low",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  medium: {
    label: "Medium",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  high: {
    label: "High",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  critical: {
    label: "Critical",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
};

// Summary stat card
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (cardRef.current) {
      animation = gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: delay / 1000, ease: "back.out(1.7)" }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [delay]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      const duration = 1000;
      const steps = 30;
      const increment = value / steps;
      let current = 0;

      interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          if (interval) clearInterval(interval);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [value, delay]);

  return (
    <div
      ref={cardRef}
      className="opacity-0 bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-lg", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {animatedValue}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </div>
  );
}

// Anti-pattern card
function AntipatternCard({
  item,
  index,
}: {
  item: {
    id: string;
    type: string;
    severity: string;
    prompt_excerpt: string;
    timestamp: string;
    project: string;
    confidence: number;
    explanation: string;
    fix_suggestion: string;
  };
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const typeConfig = antipatternConfig[item.type] || antipatternConfig.vague_instruction;
  const sevConfig = severityConfig[item.severity] || severityConfig.medium;
  const TypeIcon = typeConfig.icon;

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (cardRef.current) {
      animation = gsap.fromTo(
        cardRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.3 + index * 0.05, ease: "power3.out" }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [index]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "opacity-0 bg-white dark:bg-gray-800 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all overflow-hidden",
        sevConfig.borderColor
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left"
        aria-expanded={isExpanded}
        aria-label={`${typeConfig.label} anti-pattern details`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn("p-2 rounded-lg flex-shrink-0", typeConfig.bgColor)}>
              <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 dark:text-white">
                  {typeConfig.label}
                </span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    sevConfig.bgColor,
                    sevConfig.color
                  )}
                >
                  {sevConfig.label}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {item.prompt_excerpt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {formatDate(item.timestamp)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Folder className="w-3 h-3" />
                {item.project}
              </div>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Explanation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Issue Explanation
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {item.explanation}
              </p>
            </div>

            {/* Fix suggestion */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suggested Fix
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 pl-6">
                {item.fix_suggestion}
              </p>
            </div>
          </div>

          {/* Confidence */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-400">Confidence:</span>
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full max-w-[200px]">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                style={{ width: `${item.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {Math.round(item.confidence * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Filter dropdown
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Filter by ${label}`}
      >
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        {value && (
          <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs">
            {options.find((o) => o.value === value)?.label}
          </span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 animate-fade-in">
          <button
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className={cn(
              "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
              !value && "bg-purple-50 dark:bg-purple-900/20"
            )}
          >
            All
          </button>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                value === option.value && "bg-purple-50 dark:bg-purple-900/20"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AntipatternPage() {
  const [days, setDays] = useState(7);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { data: summary, isLoading: summaryLoading } = useAntipatternSummary(days);
  const {
    data: antipatterns,
    isLoading: patternsLoading,
    error,
    refetch,
    isFetching,
  } = useAntipatterns({
    days,
    severity: severityFilter || undefined,
    type: typeFilter ? [typeFilter] : undefined,
    limit: 50,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!summaryLoading && !patternsLoading && containerRef.current && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [summaryLoading, patternsLoading]);

  const isLoading = summaryLoading || patternsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Unable to load anti-patterns
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please check your connection and try again
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
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

  return (
    <div ref={containerRef} className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between opacity-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Anti-patterns
            </h1>
            {isFetching && (
              <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detected prompt patterns that may reduce effectiveness
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                days === d
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Detected"
          value={summary?.total_detected || 0}
          icon={AlertTriangle}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-500"
          delay={100}
        />
        <StatCard
          title="Critical"
          value={summary?.by_severity?.critical || 0}
          icon={AlertOctagon}
          color="bg-red-100 dark:bg-red-900/30 text-red-500"
          delay={200}
        />
        <StatCard
          title="High Severity"
          value={summary?.by_severity?.high || 0}
          icon={Flame}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-500"
          delay={300}
        />
        <StatCard
          title="Toothpaste"
          value={summary?.by_type?.toothpaste || 0}
          icon={Info}
          color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500"
          delay={400}
        />
      </div>

      {/* Type breakdown */}
      {summary && Object.keys(summary.by_type).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            By Type
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(summary.by_type).map(([type, count]) => {
              const config = antipatternConfig[type] || antipatternConfig.vague_instruction;
              const Icon = config.icon;
              return (
                <div
                  key={type}
                  className={cn(
                    "p-4 rounded-lg border",
                    config.bgColor,
                    "border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("w-4 h-4", config.color)} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {config.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterDropdown
          label="Severity"
          options={[
            { value: "critical", label: "Critical" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
          value={severityFilter}
          onChange={setSeverityFilter}
        />
        <FilterDropdown
          label="Type"
          options={[
            { value: "toothpaste", label: "Toothpaste" },
            { value: "raw_paste", label: "Raw Paste" },
            { value: "vague_instruction", label: "Vague Instruction" },
            { value: "context_explosion", label: "Context Explosion" },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        {(severityFilter || typeFilter) && (
          <button
            onClick={() => {
              setSeverityFilter(null);
              setTypeFilter(null);
            }}
            className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <XCircle className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Anti-pattern list */}
      <div className="space-y-3">
        {antipatterns?.items && antipatterns.items.length > 0 ? (
          antipatterns.items.map((item, index) => (
            <AntipatternCard key={item.id} item={item} index={index} />
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <AlertTriangle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
              No anti-patterns found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {severityFilter || typeFilter
                ? "Try adjusting your filters"
                : "Great job! Your prompts are well-structured."}
            </p>
          </div>
        )}
      </div>

      {/* Total count */}
      {antipatterns && antipatterns.total > 0 && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {antipatterns.items.length} of {antipatterns.total} anti-patterns
        </div>
      )}
    </div>
  );
}
