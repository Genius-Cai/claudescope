"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  Settings,
  Cpu,
  Check,
  X,
  RefreshCw,
  Server,
  Key,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Zap,
  Cloud,
  Database,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, LLMProviderInfo } from "@/lib/api";
import { cn } from "@/lib/utils";
import gsap from "gsap";

// Allowed documentation URLs for external links (security whitelist)
const ALLOWED_DOC_URLS = [
  "https://platform.openai.com",
  "https://console.anthropic.com",
  "https://platform.deepseek.com",
  "https://ollama.ai",
];

const providerConfig: Record<
  string,
  {
    icon: string;
    gradient: string;
    description: string;
    docsUrl: string;
    envVar: string;
    features: string[];
  }
> = {
  openai: {
    icon: "O",
    gradient: "from-green-500 to-emerald-600",
    description: "GPT-4o, GPT-4, and other OpenAI models",
    docsUrl: "https://platform.openai.com/api-keys",
    envVar: "OPENAI_API_KEY",
    features: ["Fast inference", "Function calling", "Vision support"],
  },
  anthropic: {
    icon: "A",
    gradient: "from-orange-500 to-amber-600",
    description: "Claude 3.5 Sonnet, Claude 3 Opus, and more",
    docsUrl: "https://console.anthropic.com/settings/keys",
    envVar: "ANTHROPIC_API_KEY",
    features: ["200K context", "Strong reasoning", "Structured output"],
  },
  deepseek: {
    icon: "D",
    gradient: "from-blue-500 to-cyan-600",
    description: "DeepSeek-V3 and chat models",
    docsUrl: "https://platform.deepseek.com/api_keys",
    envVar: "DEEPSEEK_API_KEY",
    features: ["Cost effective", "Code specialized", "Large context"],
  },
  ollama: {
    icon: "L",
    gradient: "from-purple-500 to-violet-600",
    description: "Run models locally with Ollama",
    docsUrl: "https://ollama.ai",
    envVar: "OLLAMA_BASE_URL",
    features: ["Privacy first", "No API costs", "Offline capable"],
  },
};

// Validate provider ID to prevent injection
function isValidProviderId(id: string): boolean {
  return /^[a-z0-9-]+$/.test(id);
}

// Check if URL is in allowed list
function isAllowedUrl(url: string): boolean {
  return ALLOWED_DOC_URLS.some((allowed) => url.startsWith(allowed));
}

// Provider card component
function ProviderCard({
  provider,
  delay = 0,
}: {
  provider: LLMProviderInfo;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Validate provider ID
  const safeProviderId = isValidProviderId(provider.id) ? provider.id : "unknown";

  const config = providerConfig[safeProviderId] || {
    icon: "?",
    gradient: "from-gray-500 to-gray-600",
    description: "Unknown provider",
    docsUrl: "#",
    envVar: "UNKNOWN",
    features: [],
  };

  // Cap delay to prevent long waits with many providers
  const cappedDelay = Math.min(delay, 500);

  useEffect(() => {
    let animation: gsap.core.Tween | undefined;
    if (cardRef.current) {
      animation = gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: cappedDelay / 1000,
          ease: "back.out(1.7)",
        }
      );
    }
    return () => {
      animation?.kill();
    };
  }, [cappedDelay]);

  const getStatusIcon = () => {
    if (provider.configured) {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Configured
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
        <X className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Not configured
        </span>
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "opacity-0 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl",
        provider.configured
          ? "border-green-200 dark:border-green-800"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg",
              "bg-gradient-to-br",
              config.gradient
            )}
          >
            {config.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {provider.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Provider features">
        {config.features.map((feature) => (
          <span
            key={feature}
            role="listitem"
            className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* Models */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Models
        </h4>
        <div className="flex flex-wrap gap-2">
          {provider.models.slice(0, 4).map((model) => (
            <span
              key={model}
              className={cn(
                "px-2 py-1 text-xs rounded-md",
                model === provider.default_model
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium"
                  : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400"
              )}
            >
              {model}
              {model === provider.default_model && " (default)"}
            </span>
          ))}
          {provider.models.length > 4 && (
            <span className="px-2 py-1 text-xs text-gray-400">
              +{provider.models.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Configuration info */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        {provider.configured ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Key className="w-4 h-4" />
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-xs">
              {config.envVar}
            </code>
            <span>is set</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Set{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs text-gray-700 dark:text-gray-300">
                {config.envVar}
              </code>{" "}
              in your environment
            </p>
            {isAllowedUrl(config.docsUrl) && (
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Get ${provider.name} API key (opens in new tab)`}
                className="inline-flex items-center gap-1 text-sm text-purple-500 hover:text-purple-600 transition-colors"
              >
                Get API key
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Status summary card
function StatusSummary({
  providers,
  isLoading,
}: {
  providers: LLMProviderInfo[];
  isLoading: boolean;
}) {
  const configured = useMemo(() => providers.filter((p) => p.configured).length, [providers]);
  const total = providers.length;
  const totalModels = useMemo(() => providers.reduce((sum, p) => sum + p.models.length, 0), [providers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Server className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {isLoading ? "-" : total}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Providers
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Check className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {isLoading ? "-" : configured}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configured
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
            <Cpu className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {isLoading ? "-" : totalModels}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Models
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick setup guide
function QuickSetupGuide() {
  const steps = [
    {
      icon: Key,
      title: "Get API Keys",
      description: "Sign up for your preferred LLM providers and get API keys",
    },
    {
      icon: Database,
      title: "Set Environment Variables",
      description: "Add API keys to your .env file in the backend directory",
    },
    {
      icon: Zap,
      title: "Restart Backend",
      description: "Restart the ClaudeScope backend to load new configurations",
    },
    {
      icon: Sparkles,
      title: "Generate Insights",
      description: "Go to AI Insights page and generate your first analysis",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl p-6 border border-purple-500/20 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Quick Setup Guide
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Setup steps">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex items-start gap-3" role="listitem">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-sm" aria-hidden="true">
              {idx + 1}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800 dark:text-white">
                {step.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Environment file example
function EnvFileExample({ providers }: { providers: LLMProviderInfo[] }) {
  const unconfigured = useMemo(() => providers.filter((p) => !p.configured), [providers]);

  if (unconfigured.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Environment Configuration
        </h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Add these to your <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">.env</code> file in the backend directory:
      </p>
      <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
        <pre className="text-sm text-gray-300 font-mono">
          {`# LLM Provider Configuration
# Uncomment and set the providers you want to use

`}
          {unconfigured.map((p) => {
            const config = providerConfig[p.id];
            return `# ${p.name}\n${config?.envVar || `${p.id.toUpperCase()}_API_KEY`}=your-api-key-here\n\n`;
          }).join("")}
        </pre>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const {
    data: providersData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["llm-providers"],
    queryFn: () => api.getLLMProviders(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const providers: LLMProviderInfo[] = providersData?.providers ?? [];

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [isLoading]);

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
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Unable to load settings
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please check your connection and try again
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label={isFetching ? "Retrying to load settings" : "Retry loading settings"}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
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
    <div ref={containerRef} className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div ref={headerRef} className="flex items-center justify-between opacity-0">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Settings
            </h1>
            {isFetching && (
              <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure LLM providers and manage your ClaudeScope preferences
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label={isFetching ? "Refreshing provider data" : "Refresh provider data"}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <StatusSummary providers={providers} isLoading={isLoading} />

      {/* Quick Setup Guide */}
      <QuickSetupGuide />

      {/* LLM Providers Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            LLM Providers
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider, idx) => (
            <ProviderCard key={provider.id} provider={provider} delay={100 + idx * 100} />
          ))}
        </div>
      </div>

      {/* Environment Configuration */}
      <EnvFileExample providers={providers} />
    </div>
  );
}
