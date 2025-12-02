"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HeartPulse,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    color: "purple",
  },
  {
    name: "Health Report",
    href: "/health",
    icon: HeartPulse,
    color: "emerald",
  },
  {
    name: "Anti-patterns",
    href: "/antipatterns",
    icon: AlertTriangle,
    color: "orange",
  },
  {
    name: "Statistics",
    href: "/statistics",
    icon: BarChart3,
    color: "cyan",
  },
  {
    name: "AI Insights",
    href: "/insights",
    icon: Lightbulb,
    color: "yellow",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate sidebar entrance
      gsap.fromTo(
        sidebarRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );

      // Animate logo
      gsap.fromTo(
        logoRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)", delay: 0.2 }
      );

      // Animate nav items with stagger
      if (navRef.current) {
        gsap.fromTo(
          navRef.current.children,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: "power2.out",
            delay: 0.3,
          }
        );
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 relative">
        <Link
          ref={logoRef}
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl blur-lg opacity-50 group-hover:opacity-80 transition-opacity duration-300" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-black text-lg bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              ClaudeScope
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Usage Analyzer
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 relative">
        <ul ref={navRef} className="space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            const isHovered = hoveredItem === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive
                      ? "text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Active/Hover background */}
                  {isActive && (
                    <div
                      className={cn(
                        "absolute inset-0 rounded-xl bg-gradient-to-r shadow-lg",
                        item.color === "purple" && "from-purple-500 to-purple-600",
                        item.color === "emerald" && "from-emerald-500 to-emerald-600",
                        item.color === "orange" && "from-orange-500 to-orange-600",
                        item.color === "cyan" && "from-cyan-500 to-cyan-600",
                        item.color === "yellow" && "from-yellow-500 to-yellow-600"
                      )}
                    />
                  )}
                  {!isActive && isHovered && (
                    <div className="absolute inset-0 rounded-xl bg-gray-100 dark:bg-gray-700/50" />
                  )}

                  {/* Icon */}
                  <div
                    className={cn(
                      "relative z-10 transition-transform duration-300",
                      (isActive || isHovered) && "scale-110"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Text */}
                  <span className="relative z-10">{item.name}</span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="relative z-10 ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
            pathname === "/settings"
              ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <Settings className={cn(
            "w-5 h-5 transition-transform duration-500",
            pathname === "/settings" && "animate-spin-slow"
          )} />
          Settings
        </Link>

        {/* Version badge */}
        <div className="mt-4 px-4 py-2 text-center">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            v0.1.0 beta
          </span>
        </div>
      </div>
    </aside>
  );
}
