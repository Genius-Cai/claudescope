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
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-xs font-medium text-green-600 dark:text-green-400">
        Live Data
      </span>
    </div>
  );
}

// Animated counter for hero stats
function AnimatedHeroStat({
  value,
  label,
  icon: Icon,
  delay = 0
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

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
      <div className="inline-flex items-center justify-center w-12 h-12 mb-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
        <Icon className="w-6 h-6 text-purple-400" />
      </div>
      <div className="text-3xl font-black text-white tabular-nums">
        {displayValue.toLocaleString()}
      </div>
      <div className="text-sm text-gray-400">{label}</div>
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
    <div ref={containerRef} className="min-h-screen relative overflow-hidden">
      {/* Animated particle background */}
      <ParticleField />

      {/* Gradient orbs for ambient lighting */}
      <GradientOrb className="w-96 h-96 -top-48 -left-48" />
      <GradientOrb className="w-[500px] h-[500px] -bottom-64 -right-64" />
      <GradientOrb className="w-72 h-72 top-1/2 left-1/3 opacity-30" />

      {/* Main content */}
      <div className="relative z-10 space-y-8 p-6">
        {/* Hero Section with animated gradient */}
        <div
          ref={heroRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 p-8 border border-purple-500/20"
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-emerald-600/10 animate-gradient-shift bg-[length:400%_400%]" />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

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
              />
              <AnimatedHeroStat
                value={140}
                label="Extended Thinking"
                icon={Brain}
                delay={700}
              />
              <AnimatedHeroStat
                value={96}
                label="Health Score"
                icon={TrendingUp}
                delay={900}
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
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <HealthScoreCard />
          </div>
          <div className="dashboard-card">
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
