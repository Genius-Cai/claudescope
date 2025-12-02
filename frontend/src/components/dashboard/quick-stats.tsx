"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Folder, Zap, Clock, TrendingUp } from "lucide-react";
import { useStatisticsOverview } from "@/hooks/use-health-report";
import { formatNumber, cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  delay?: number;
}

function AnimatedCounter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
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

  return <>{formatNumber(displayValue)}</>;
}

function StatCard({ icon, label, value, subtext, color, delay = 0 }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "stat-card relative overflow-hidden group cursor-pointer",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br",
          color === "blue" && "from-blue-500/10 to-blue-500/5",
          color === "green" && "from-green-500/10 to-green-500/5",
          color === "yellow" && "from-yellow-500/10 to-yellow-500/5",
          color === "purple" && "from-purple-500/10 to-purple-500/5"
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        <div
          className={cn(
            "p-3 rounded-xl transition-all duration-300",
            isHovered ? "scale-110" : "scale-100",
            color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
            color === "green" && "bg-green-100 dark:bg-green-900/30",
            color === "yellow" && "bg-yellow-100 dark:bg-yellow-900/30",
            color === "purple" && "bg-purple-100 dark:bg-purple-900/30"
          )}
        >
          <div
            className={cn(
              "transition-transform duration-300",
              isHovered && "animate-bounce"
            )}
          >
            {icon}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
            {typeof value === "number" ? (
              <AnimatedCounter value={value} />
            ) : (
              value
            )}
          </p>
          {subtext && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {subtext}
            </p>
          )}
        </div>
      </div>

      {/* Decorative corner accent */}
      <div
        className={cn(
          "absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-xl transition-all duration-500",
          isHovered && "opacity-30 scale-150",
          color === "blue" && "bg-blue-500",
          color === "green" && "bg-green-500",
          color === "yellow" && "bg-yellow-500",
          color === "purple" && "bg-purple-500"
        )}
      />
    </div>
  );
}

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      <div className="flex items-center gap-4">
        <div className="skeleton h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3 w-16" />
          <div className="skeleton h-6 w-24" />
          <div className="skeleton h-2 w-20" />
        </div>
      </div>
    </div>
  );
}

export function QuickStats() {
  const { data, isLoading, error } = useStatisticsOverview(30);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 100, 200, 300].map((delay) => (
          <SkeletonCard key={delay} delay={delay} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
          label="Total Prompts"
          value="-"
          color="blue"
        />
        <StatCard
          icon={<Folder className="w-5 h-5 text-green-500" />}
          label="Projects"
          value="-"
          color="green"
          delay={100}
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-yellow-500" />}
          label="Sessions"
          value="-"
          color="yellow"
          delay={200}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-purple-500" />}
          label="Avg Length"
          value="-"
          color="purple"
          delay={300}
        />
      </div>
    );
  }

  const {
    prompts_count,
    projects_count,
    sessions_count,
    average_prompt_length,
    average_prompts_per_session,
  } = data;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
        label="Total Prompts"
        value={prompts_count}
        subtext="Last 30 days"
        color="blue"
      />
      <StatCard
        icon={<Folder className="w-5 h-5 text-green-500" />}
        label="Projects"
        value={projects_count}
        subtext="Active projects"
        color="green"
        delay={100}
      />
      <StatCard
        icon={<Zap className="w-5 h-5 text-yellow-500" />}
        label="Sessions"
        value={sessions_count}
        subtext={`~${average_prompts_per_session.toFixed(1)} prompts/session`}
        color="yellow"
        delay={200}
      />
      <StatCard
        icon={<Clock className="w-5 h-5 text-purple-500" />}
        label="Avg Length"
        value={Math.round(average_prompt_length)}
        subtext="chars per prompt"
        color="purple"
        delay={300}
      />
    </div>
  );
}
