"use client";

import { useState, useRef, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined" | "glass";
  hover?: "none" | "lift" | "glow" | "tilt" | "spotlight";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className,
  variant = "default",
  hover = "lift",
  padding = "md",
  ...props
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || (hover !== "tilt" && hover !== "spotlight")) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    if (hover === "tilt") {
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    }

    if (hover === "spotlight") {
      setSpotlightPosition({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setTransform("");
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const variantClasses = {
    default: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    elevated: "bg-white dark:bg-gray-800 shadow-xl",
    outlined: "bg-transparent border-2 border-gray-300 dark:border-gray-600",
    glass: cn(
      "bg-white/10 dark:bg-gray-800/50 backdrop-blur-xl",
      "border border-white/20 dark:border-gray-700/50"
    ),
  };

  const hoverClasses = {
    none: "",
    lift: "hover:-translate-y-1 hover:shadow-xl transition-all duration-300",
    glow: cn(
      "transition-all duration-300",
      "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
      "hover:border-purple-500/50"
    ),
    tilt: "transition-shadow duration-300",
    spotlight: "transition-all duration-300 overflow-hidden",
  };

  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-2xl relative",
        variantClasses[variant],
        hoverClasses[hover],
        paddingClasses[padding],
        className
      )}
      style={{ transform: hover === "tilt" ? transform : undefined }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Spotlight effect */}
      {hover === "spotlight" && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(600px circle at ${spotlightPosition.x}px ${spotlightPosition.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Interactive card header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

// Skeleton card for loading states
interface SkeletonCardProps {
  lines?: number;
  hasHeader?: boolean;
  hasChart?: boolean;
}

export function SkeletonCard({
  lines = 3,
  hasHeader = true,
  hasChart = false,
}: SkeletonCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden relative">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

      <div className="space-y-4">
        {hasHeader && (
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
        )}

        {hasChart && <div className="skeleton h-48 w-full rounded-xl" />}

        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="skeleton h-3 w-full" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
