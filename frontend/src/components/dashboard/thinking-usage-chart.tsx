"use client";

import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Brain, Sparkles, Zap } from "lucide-react";
import { useStatisticsOverview } from "@/hooks/use-health-report";
import { formatDate, cn } from "@/lib/utils";
import gsap from "gsap";

function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 2,
      delay: 0.5,
      ease: "power2.out",
      onUpdate: () => setCount(Math.round(obj.value)),
    });
  }, [target]);

  return <>{count}</>;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-3 rounded-xl shadow-xl border border-gray-700 animate-fade-in">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-bold flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          {payload[0].value} triggers
        </p>
      </div>
    );
  }
  return null;
}

export function ThinkingUsageChart() {
  const { data, isLoading, error } = useStatisticsOverview(30);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (containerRef.current && data) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [data]);

  useEffect(() => {
    if (chartRef.current && data) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.4 }
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="skeleton h-5 w-48" />
            <div className="skeleton h-8 w-16" />
          </div>
          <div className="skeleton h-48 w-full rounded-xl" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Extended Thinking Usage
        </h3>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
            <Brain className="w-6 h-6" />
          </div>
          <p>Unable to load thinking data</p>
        </div>
      </div>
    );
  }

  const { thinking } = data;
  const chartData = thinking.by_day.map((d) => ({
    date: formatDate(d.date),
    count: d.count,
  }));

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700",
        "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        "group overflow-hidden relative"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating decoration */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl transition-all duration-500",
          isHovered && "scale-150 bg-purple-500/20"
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 transition-all duration-300",
              isHovered && "scale-110"
            )}>
              <Brain className={cn(
                "w-5 h-5 text-purple-500 transition-transform duration-300",
                isHovered && "animate-pulse"
              )} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Extended Thinking
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Deep thinking triggers over time
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
              <AnimatedCount target={thinking.total_triggers} />
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">total</p>
          </div>
        </div>

        {/* Chart */}
        <div ref={chartRef}>
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeOpacity={0.2}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    stroke="#4b5563"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    stroke="#4b5563"
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    fill="url(#colorCount)"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
              <Sparkles className="w-12 h-12 opacity-30" />
              <p>No thinking trigger data available</p>
            </div>
          )}
        </div>

        {/* Trigger word breakdown */}
        {Object.keys(thinking.by_trigger_word).length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Trigger Words
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(thinking.by_trigger_word).map(([word, count], index) => (
                <span
                  key={word}
                  className={cn(
                    "px-3 py-1.5 bg-gradient-to-r from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30",
                    "text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold",
                    "transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default",
                    "animate-fade-in-up"
                  )}
                  style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                >
                  <span className="opacity-70">#</span>{word}
                  <span className="ml-1.5 px-1.5 py-0.5 bg-purple-200 dark:bg-purple-800 rounded-full text-[10px]">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
