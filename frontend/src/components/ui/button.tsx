"use client";

import { useState, useRef, ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface RippleProps {
  x: number;
  y: number;
  size: number;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  ripple?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      loading = false,
      ripple = true,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RippleProps[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple = { x, y, size };
        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.slice(1));
        }, 600);
      }

      onClick?.(e);
    };

    const variantClasses = {
      default: cn(
        "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
        "border border-gray-300 dark:border-gray-600",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "active:bg-gray-100 dark:active:bg-gray-600"
      ),
      primary: cn(
        "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
        "hover:from-purple-600 hover:to-purple-700",
        "active:from-purple-700 active:to-purple-800",
        "shadow-lg shadow-purple-500/25"
      ),
      secondary: cn(
        "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white",
        "hover:from-cyan-600 hover:to-cyan-700",
        "active:from-cyan-700 active:to-cyan-800",
        "shadow-lg shadow-cyan-500/25"
      ),
      ghost: cn(
        "bg-transparent text-gray-600 dark:text-gray-400",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "active:bg-gray-200 dark:active:bg-gray-700"
      ),
      danger: cn(
        "bg-gradient-to-r from-red-500 to-red-600 text-white",
        "hover:from-red-600 hover:to-red-700",
        "active:from-red-700 active:to-red-800",
        "shadow-lg shadow-red-500/25"
      ),
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-4 py-2 text-sm rounded-xl",
      lg: "px-6 py-3 text-base rounded-xl",
    };

    return (
      <button
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden font-medium",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
          "transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((ripple, index) => (
          <span
            key={index}
            className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              animation: "ripple 0.6s linear",
            }}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}

        {/* Button content */}
        <span className={cn(loading && "invisible")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

// Add ripple keyframe to global styles via CSS-in-JS
const RippleStyle = () => (
  <style jsx global>{`
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
  `}</style>
);

export { RippleStyle };
