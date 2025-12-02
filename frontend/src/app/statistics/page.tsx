"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  Brain,
  Cpu,
  FileText,
  FolderKanban,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
} from "lucide-react";
import { useStatisticsOverview } from "@/hooks/use-health-report";
import { formatDate, cn } from "@/lib/utils";
import gsap from "gsap";

// Color palette for charts
const COLORS = {
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  emerald: "#10b981",
  orange: "#f59e0b",
  pink: "#ec4899",
  blue: "#3b82f6",
};

const PIE_COLORS = [COLORS.purple, COLORS.cyan, COLORS.emerald, COLORS.orange, COLORS.pink, COLORS.blue];

// Animated counter component
function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  delay = 0,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  delay?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const obj = { value: 0 };
    const animation = gsap.to(obj, {
      value: target,
      duration: 2,
      delay: delay / 1000,
      ease: "power2.out",
      onUpdate: () => setCount(obj.value),
    });

    return () => {
      animation.kill();
    };
  }, [target, delay]);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.round(count).toLocaleString();

  return (
    <span aria-live="polite" aria-atomic="true">
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// Stat card component with animations
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: number;
  subtitle?: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (cardRef.current) {
      animation = gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: delay / 1000, ease: "back.out(1.7)" }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [delay]);

  const colorClasses = {
    purple: "from-purple-500 to-purple-600",
    cyan: "from-cyan-500 to-cyan-600",
    emerald: "from-emerald-500 to-emerald-600",
    orange: "from-orange-500 to-orange-600",
  };

  const bgClasses = {
    purple: "bg-purple-100 dark:bg-purple-900/30",
    cyan: "bg-cyan-100 dark:bg-cyan-900/30",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
    orange: "bg-orange-100 dark:bg-orange-900/30",
  };

  const textClasses = {
    purple: "text-purple-600 dark:text-purple-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        "group"
      )}
    >
      {/* Gradient background on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300",
          colorClasses[color as keyof typeof colorClasses]
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className={cn("text-3xl font-black", textClasses[color as keyof typeof textClasses])}>
            <AnimatedCounter target={value} delay={delay} />
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-xs font-medium",
                trend >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(trend)}% vs last period
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", bgClasses[color as keyof typeof bgClasses])}>
          <Icon className={cn("w-6 h-6", textClasses[color as keyof typeof textClasses])} />
        </div>
      </div>
    </div>
  );
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label, valueLabel = "Value" }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-xl shadow-xl border border-gray-700">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// Token usage breakdown chart
function TokenUsageChart({ data }: { data: { total_tokens: number; input_tokens: number; output_tokens: number } }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (chartRef.current) {
      animation = gsap.fromTo(
        chartRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.3 }
      );
    }
    return () => {
      animation?.kill();
    };
  }, []);

  const pieData = [
    { name: "Input Tokens", value: data.input_tokens, color: COLORS.cyan },
    { name: "Output Tokens", value: data.output_tokens, color: COLORS.purple },
  ];

  const inputPercentage = data.total_tokens > 0 ? ((data.input_tokens / data.total_tokens) * 100).toFixed(1) : "0";
  const outputPercentage = data.total_tokens > 0 ? ((data.output_tokens / data.total_tokens) * 100).toFixed(1) : "0";

  return (
    <div
      ref={chartRef}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700",
        "hover:shadow-xl transition-all duration-300"
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
          <Cpu className="w-5 h-5 text-cyan-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Token Usage</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Input vs Output distribution</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
            <AnimatedCounter target={data.total_tokens} delay={400} />
          </p>
          <p className="text-xs text-gray-400">total tokens</p>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Input Tokens</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.input_tokens.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                  style={{ width: `${inputPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{inputPercentage}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Output Tokens</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.output_tokens.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${outputPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{outputPercentage}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Model usage breakdown
function ModelUsageChart({ data }: { data: Record<string, number> }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (chartRef.current) {
      animation = gsap.fromTo(
        chartRef.current,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", delay: 0.4 }
      );
    }
    return () => {
      animation?.kill();
    };
  }, []);

  const chartData = Object.entries(data).map(([model, tokens]) => ({
    name: model.replace("claude-", "").replace("-20", " "),
    tokens,
  }));

  if (chartData.length === 0) {
    return (
      <div
        ref={chartRef}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage by Model</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-gray-400">
          <p>No model data available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Activity className="w-5 h-5 text-purple-500" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage by Model</h3>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => v.toLocaleString()} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} width={100} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="tokens"
              fill={COLORS.purple}
              radius={[0, 4, 4, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Extended Thinking trend chart
function ThinkingTrendChart({ data }: { data: { by_day: Array<{ date: string; count: number }>; total_triggers: number; average_per_session: number } }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (chartRef.current) {
      animation = gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 }
      );
    }
    return () => {
      animation?.kill();
    };
  }, []);

  const chartData = data.by_day.map((d) => ({
    date: formatDate(d.date),
    count: d.count,
  }));

  return (
    <div
      ref={chartRef}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
            <Brain className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Extended Thinking Trend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Daily thinking triggers over time</p>
          </div>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              <AnimatedCounter target={data.total_triggers} delay={600} />
            </p>
            <p className="text-xs text-gray-400">total</p>
          </div>
          <div>
            <p className="text-2xl font-black text-gray-600 dark:text-gray-300">
              <AnimatedCounter target={data.average_per_session} decimals={1} delay={700} />
            </p>
            <p className="text-xs text-gray-400">avg/session</p>
          </div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorThinking" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Triggers"
                stroke={COLORS.emerald}
                strokeWidth={2.5}
                fill="url(#colorThinking)"
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No thinking data available</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Project breakdown chart
function ProjectBreakdownChart({
  tokensByProject,
  thinkingByProject,
}: {
  tokensByProject: Record<string, number>;
  thinkingByProject: Record<string, number>;
}) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (chartRef.current) {
      animation = gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.6 }
      );
    }
    return () => {
      animation?.kill();
    };
  }, []);

  // Combine projects from both sources
  const allProjects = new Set([...Object.keys(tokensByProject), ...Object.keys(thinkingByProject)]);
  const chartData = Array.from(allProjects).map((project) => ({
    name: project.length > 15 ? project.substring(0, 15) + "..." : project,
    fullName: project,
    tokens: tokensByProject[project] || 0,
    thinking: thinkingByProject[project] || 0,
  }));

  // Sort by tokens descending and take top 8
  chartData.sort((a, b) => b.tokens - a.tokens);
  const displayData = chartData.slice(0, 8);

  if (displayData.length === 0) {
    return (
      <div
        ref={chartRef}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <FolderKanban className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage by Project</h3>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>No project data available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
          <FolderKanban className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Usage by Project</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Top projects by token usage</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
              dataKey="tokens"
              name="Tokens"
              fill={COLORS.orange}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Bar
              dataKey="thinking"
              name="Thinking"
              fill={COLORS.cyan}
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Period selector
function PeriodSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) {
  const periods = [
    { label: "7 Days", value: 7 },
    { label: "14 Days", value: 14 },
    { label: "30 Days", value: 30 },
    { label: "90 Days", value: 90 },
  ];

  return (
    <div className="flex gap-2" role="group" aria-label="Select time period">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          aria-pressed={value === period.value}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
            value === period.value
              ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
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
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    </div>
  );
}

// Main Statistics Page
export default function StatisticsPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const { data, isLoading, error } = useStatisticsOverview(periodDays);
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;

    if (headerRef.current && data) {
      animation = gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }

    return () => {
      animation?.kill();
    };
  }, [data]);

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
        <div className="text-center">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto w-fit mb-4">
            <BarChart3 className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Statistics
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please try again later or check your connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative p-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl shadow-2xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Statistics</h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last {periodDays} days of usage data
            </p>
          </div>
        </div>
        <PeriodSelector value={periodDays} onChange={setPeriodDays} />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={data.sessions_count}
          icon={MessageSquare}
          color="purple"
          subtitle={`${(data.average_prompts_per_session ?? 0).toFixed(1)} prompts/session`}
          delay={100}
        />
        <StatCard
          title="Total Prompts"
          value={data.prompts_count}
          icon={FileText}
          color="cyan"
          subtitle={`Avg length: ${(data.average_prompt_length ?? 0).toFixed(0)} chars`}
          delay={200}
        />
        <StatCard
          title="Active Projects"
          value={data.projects_count}
          icon={FolderKanban}
          color="emerald"
          delay={300}
        />
        <StatCard
          title="Thinking Triggers"
          value={data.thinking?.total_triggers ?? 0}
          icon={Brain}
          color="orange"
          subtitle={`${(data.thinking?.average_per_session ?? 0).toFixed(1)} per session`}
          delay={400}
        />
      </div>

      {/* Token & Model Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TokenUsageChart data={data.tokens ?? { total_tokens: 0, input_tokens: 0, output_tokens: 0 }} />
        <ModelUsageChart data={data.tokens?.by_model ?? {}} />
      </div>

      {/* Thinking Trend & Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThinkingTrendChart data={data.thinking ?? { by_day: [], total_triggers: 0, average_per_session: 0 }} />
        <ProjectBreakdownChart
          tokensByProject={data.tokens?.by_project ?? {}}
          thinkingByProject={data.thinking?.by_project ?? {}}
        />
      </div>

      {/* Trigger Words Section */}
      {Object.keys(data.thinking?.by_trigger_word ?? {}).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Thinking Trigger Words
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.thinking?.by_trigger_word ?? {})
              .sort(([, a], [, b]) => b - a)
              .map(([word, count], index) => (
                <span
                  key={word}
                  className={cn(
                    "px-4 py-2 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30",
                    "text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold",
                    "transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${0.8 + index * 0.05}s` }}
                >
                  #{word}
                  <span className="ml-2 px-2 py-0.5 bg-purple-200 dark:bg-purple-800 rounded-full text-xs">
                    {count}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="flex items-center gap-2 text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">Analytics powered by ClaudeScope</span>
        </div>
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>
    </div>
  );
}
