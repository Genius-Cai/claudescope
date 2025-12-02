"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Shield, Zap, Info } from "lucide-react";
import { useAntipatternSummary } from "@/hooks/use-health-report";
import { cn, severityColors } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import gsap from "gsap";

const typeLabels: Record<string, string> = {
  toothpaste: "Toothpaste",
  raw_paste: "Raw Paste",
  vague_instruction: "Vague",
  context_explosion: "Context Explosion",
};

const typeDescriptions: Record<string, string> = {
  toothpaste: "Short, fragmented prompts sent in quick succession",
  raw_paste: "Code/text pasted without context or explanation",
  vague_instruction: "Unclear or ambiguous instructions",
  context_explosion: "Very long context that may exceed limits",
};

const typeIcons: Record<string, React.ReactNode> = {
  toothpaste: <Zap className="w-4 h-4" />,
  raw_paste: <AlertTriangle className="w-4 h-4" />,
  vague_instruction: <Shield className="w-4 h-4" />,
  context_explosion: <AlertTriangle className="w-4 h-4" />,
};

const typeColors: Record<string, { bg: string; text: string; bar: string }> = {
  toothpaste: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-600 dark:text-orange-400",
    bar: "from-orange-400 to-orange-600",
  },
  raw_paste: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    bar: "from-red-400 to-red-600",
  },
  vague_instruction: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-600 dark:text-yellow-400",
    bar: "from-yellow-400 to-yellow-600",
  },
  context_explosion: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    bar: "from-purple-400 to-purple-600",
  },
};

function AnimatedBar({
  percentage,
  color,
  delay,
}: {
  percentage: number;
  color: string;
  delay: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { scaleX: 0, transformOrigin: "left" },
        {
          scaleX: 1,
          duration: 0.8,
          delay: delay,
          ease: "power3.out",
        }
      );
    }
  }, [delay]);

  return (
    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div
        ref={barRef}
        className={cn(
          "h-full rounded-full bg-gradient-to-r",
          color
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 1.5,
      delay: 0.3,
      ease: "power2.out",
      onUpdate: () => setCount(Math.round(obj.value)),
    });
  }, [target]);

  return <span ref={countRef}>{count}</span>;
}

export function AntipatternSummary() {
  const { data, isLoading, error } = useAntipatternSummary(7);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (containerRef.current && data) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        <div className="space-y-4">
          <div className="skeleton h-5 w-48" />
          <div className="skeleton h-12 w-24" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Anti-patterns Detected
        </h3>
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p>Unable to load anti-pattern data</p>
        </div>
      </div>
    );
  }

  const { total_detected, by_type, by_severity } = data;
  const maxCount = Math.max(...Object.values(by_type), 1);

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700",
        "hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        "group overflow-hidden relative h-full"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Floating alert icon */}
      <div
        className={cn(
          "absolute -top-6 -right-6 w-20 h-20 rounded-full bg-orange-500/10 blur-xl transition-all duration-500",
          isHovered && "scale-150 bg-orange-500/20"
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 transition-transform duration-300",
              isHovered && "scale-110 rotate-12"
            )}>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Anti-patterns Detected
            </h3>
          </div>
          <Link
            href="/antipatterns"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-300 hover:gap-2"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Total count with animation */}
        <div className="mb-6">
          <span className="text-5xl font-black text-gray-900 dark:text-white">
            <AnimatedCount target={total_detected} />
          </span>
          <span className="text-gray-400 dark:text-gray-500 ml-2 text-sm">
            in the last 7 days
          </span>
        </div>

        {/* By type bars with GSAP animations */}
        <div className="space-y-4">
          {Object.entries(by_type).map(([type, count], index) => {
            const colors = typeColors[type] || typeColors.toothpaste;
            const percentage = (count / maxCount) * 100;

            return (
              <div key={type} className="group/item">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg transition-all duration-300", colors.bg)}>
                      <span className={colors.text}>{typeIcons[type]}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {typeLabels[type] || type}
                    </span>
                  </div>
                  <span className={cn("font-bold text-lg", colors.text)}>
                    {count}
                  </span>
                </div>
                <AnimatedBar
                  percentage={percentage}
                  color={colors.bar}
                  delay={0.2 + index * 0.1}
                />
              </div>
            );
          })}
        </div>

        {/* By severity badges */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
            By Severity
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(by_severity).map(([severity, count], index) => (
              <span
                key={severity}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105 cursor-default",
                  severityColors[severity as keyof typeof severityColors],
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
