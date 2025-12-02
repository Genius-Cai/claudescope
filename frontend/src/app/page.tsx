"use client";

import { useEffect, useRef, useState } from "react";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { AntipatternSummary } from "@/components/dashboard/antipattern-summary";
import { ThinkingUsageChart } from "@/components/dashboard/thinking-usage-chart";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { Sparkles, Activity, BarChart3, Zap, Brain, TrendingUp } from "lucide-react";
import gsap from "gsap";

// Animated background particles
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
    }> = [];

    const colors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with glow
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.shadowBlur = 15;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40"
    />
  );
}

// Animated gradient orb
function GradientOrb({ className }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl animate-pulse ${className}`}
      style={{
        background:
          "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(6,182,212,0.2) 50%, transparent 70%)",
      }}
    />
  );
}

// Live status indicator
function LiveIndicator() {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-lg"
      style={{ boxShadow: "0 4px 20px rgba(16, 185, 129, 0.5)" }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
      </span>
      <span className="text-sm font-semibold text-white">
        Live Data
      </span>
    </div>
  );
}

// Hero stat color configs
const heroStatColors = {
  purple: {
    bg: "from-purple-500 to-violet-600",
    shadow: "shadow-purple-500/40",
    glow: "rgba(139, 92, 246, 0.5)",
  },
  cyan: {
    bg: "from-cyan-500 to-blue-600",
    shadow: "shadow-cyan-500/40",
    glow: "rgba(6, 182, 212, 0.5)",
  },
  emerald: {
    bg: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/40",
    glow: "rgba(16, 185, 129, 0.5)",
  },
};

// Animated counter for hero stats
function AnimatedHeroStat({
  value,
  label,
  icon: Icon,
  delay = 0,
  color = "purple"
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  delay?: number;
  color?: keyof typeof heroStatColors;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const colorConfig = heroStatColors[color];

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: delay / 1000, ease: "back.out(1.7)" }
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className="text-center opacity-0">
      <div
        className={`inline-flex items-center justify-center w-14 h-14 mb-3 rounded-2xl bg-gradient-to-br ${colorConfig.bg} shadow-lg ${colorConfig.shadow}`}
        style={{ boxShadow: `0 8px 32px ${colorConfig.glow}` }}
      >
        <Icon className="w-7 h-7 text-white drop-shadow-md" />
      </div>
      <div className="text-4xl font-black text-white tabular-nums drop-shadow-lg">
        {displayValue.toLocaleString()}
      </div>
      <div className="text-sm text-gray-300 font-medium mt-1">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state - hide everything
      gsap.set([headerRef.current, heroRef.current, statsRef.current, cardsRef.current], {
        opacity: 0,
      });

      // Create master timeline
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Hero section entrance with dramatic effect
      tl.fromTo(
        heroRef.current,
        { opacity: 0, scale: 0.9, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2 }
      );

      // Header slides in from top
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -50, filter: "blur(20px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
        "-=0.6"
      );

      // Stats grid animates in with stagger
      tl.fromTo(
        statsRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );

      // Cards animate in
      tl.fromTo(
        cardsRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4"
      );

      // Animate individual stat cards with stagger
      gsap.fromTo(
        ".stat-card-item",
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.8,
          ease: "back.out(1.7)",
        }
      );

      // Animate dashboard cards with stagger
      gsap.fromTo(
        ".dashboard-card",
        { opacity: 0, y: 40, rotateX: 10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          stagger: 0.15,
          delay: 1.2,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Animated background */}
      <ParticleField />

      {/* Gradient orbs */}
      <GradientOrb className="w-96 h-96 -top-48 -left-48" />
      <GradientOrb className="w-80 h-80 top-1/3 -right-40" />
      <GradientOrb className="w-72 h-72 -bottom-36 left-1/4" />

      {/* Main content */}
      <div className="relative z-10 space-y-8 p-6">
        {/* Hero Section with smooth gradient */}
        <div
          ref={heroRef}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl"
        >
          {/* Subtle ambient gradient - softer colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-cyan-500/5" />

          {/* Soft radial glow in corner */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div ref={headerRef} className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                {/* Animated logo */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">
                    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                      ClaudeScope
                    </span>
                  </h1>
                  <p className="text-gray-400 flex items-center gap-2 mt-1">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    AI-Powered Usage Analytics
                  </p>
                </div>
              </div>
              <LiveIndicator />
            </div>

            {/* Hero stats row */}
            <div className="grid grid-cols-3 gap-8 mt-8">
              <AnimatedHeroStat
                value={1488}
                label="Total Prompts"
                icon={Zap}
                delay={500}
                color="purple"
              />
              <AnimatedHeroStat
                value={140}
                label="Extended Thinking"
                icon={Brain}
                delay={700}
                color="cyan"
              />
              <AnimatedHeroStat
                value={96}
                label="Health Score"
                icon={TrendingUp}
                delay={900}
                color="emerald"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div ref={statsRef}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Quick Overview
            </h2>
          </div>
          <QuickStats />
        </div>

        {/* Main Dashboard Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="dashboard-card h-full">
            <HealthScoreCard />
          </div>
          <div className="dashboard-card h-full">
            <AntipatternSummary />
          </div>
          <div className="dashboard-card lg:col-span-2">
            <ThinkingUsageChart />
          </div>
        </div>

        {/* Footer with animated elements */}
        <div className="flex items-center justify-center gap-4 py-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="flex items-center gap-2 text-gray-400">
            <Activity className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Real-time analysis powered by Claude</span>
          </div>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}
