"use client";

import { useEffect, useRef, useState, useMemo } from "react";
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
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Save,
  TestTube2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, LLMProviderInfo, EnvStatusResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import gsap from "gsap";

// Provider configurations
const providerConfig: Record<
  string,
  {
    icon: string;
    gradient: string;
    bgGlow: string;
    description: string;
    docsUrl: string;
    envVar: string;
    features: string[];
    placeholder: string;
  }
> = {
  openai: {
    icon: "O",
    gradient: "from-emerald-500 to-green-600",
    bgGlow: "rgba(16, 185, 129, 0.4)",
    description: "GPT-4o, GPT-4, and other OpenAI models",
    docsUrl: "https://platform.openai.com/api-keys",
    envVar: "OPENAI_API_KEY",
    features: ["Fast inference", "Function calling", "Vision support"],
    placeholder: "sk-...",
  },
  anthropic: {
    icon: "A",
    gradient: "from-orange-500 to-amber-600",
    bgGlow: "rgba(249, 115, 22, 0.4)",
    description: "Claude 3.5 Sonnet, Claude 3 Opus, and more",
    docsUrl: "https://console.anthropic.com/settings/keys",
    envVar: "ANTHROPIC_API_KEY",
    features: ["200K context", "Strong reasoning", "Structured output"],
    placeholder: "sk-ant-...",
  },
  deepseek: {
    icon: "D",
    gradient: "from-blue-500 to-cyan-600",
    bgGlow: "rgba(59, 130, 246, 0.4)",
    description: "DeepSeek-V3 and chat models",
    docsUrl: "https://platform.deepseek.com/api_keys",
    envVar: "DEEPSEEK_API_KEY",
    features: ["Cost effective", "Code specialized", "Large context"],
    placeholder: "sk-...",
  },
  ollama: {
    icon: "L",
    gradient: "from-purple-500 to-violet-600",
    bgGlow: "rgba(139, 92, 246, 0.4)",
    description: "Run models locally with Ollama",
    docsUrl: "https://ollama.ai",
    envVar: "OLLAMA_BASE_URL",
    features: ["Privacy first", "No API costs", "Offline capable"],
    placeholder: "http://localhost:11434",
  },
};

// Interactive Provider Card with API key input
function InteractiveProviderCard({
  provider,
  envStatus,
  delay = 0,
  onRefresh,
}: {
  provider: LLMProviderInfo;
  envStatus?: EnvStatusResponse["providers"][string];
  delay?: number;
  onRefresh: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const config = providerConfig[provider.id] || {
    icon: "?",
    gradient: "from-gray-500 to-gray-600",
    bgGlow: "rgba(107, 114, 128, 0.4)",
    description: "Unknown provider",
    docsUrl: "#",
    envVar: "UNKNOWN",
    features: [],
    placeholder: "Enter API key...",
  };

  // Test API key mutation
  const testMutation = useMutation({
    mutationFn: () =>
      api.testAPIKey({ provider: provider.id, api_key: apiKey }),
    onSuccess: (data) => {
      setTestResult({ valid: data.valid, message: data.message });
    },
    onError: (error) => {
      setTestResult({
        valid: false,
        message: error instanceof Error ? error.message : "Test failed",
      });
    },
  });

  // Save API key mutation
  const saveMutation = useMutation({
    mutationFn: () =>
      api.saveAPIKey({ provider: provider.id, api_key: apiKey }),
    onSuccess: () => {
      setTestResult({ valid: true, message: "API key saved successfully!" });
      setApiKey("");
      // Refresh provider data
      queryClient.invalidateQueries({ queryKey: ["llm-providers"] });
      queryClient.invalidateQueries({ queryKey: ["env-status"] });
      onRefresh();
    },
    onError: (error) => {
      setTestResult({
        valid: false,
        message: error instanceof Error ? error.message : "Save failed",
      });
    },
  });

  // Animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: Math.min(delay, 500) / 1000,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [delay]);

  const handleTest = () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, message: "Please enter an API key" });
      return;
    }
    setTestResult(null);
    testMutation.mutate();
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      setTestResult({ valid: false, message: "Please enter an API key" });
      return;
    }
    setTestResult(null);
    saveMutation.mutate();
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "opacity-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border transition-all duration-300",
        provider.configured
          ? "border-green-300 dark:border-green-700"
          : "border-gray-200 dark:border-gray-700",
        isExpanded && "ring-2 ring-purple-500/30"
      )}
    >
      {/* Header - Always visible */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Provider Icon with glow */}
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg",
                "bg-gradient-to-br",
                config.gradient
              )}
              style={{ boxShadow: `0 8px 32px ${config.bgGlow}` }}
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
              {/* Status badge */}
              <div className="flex items-center gap-2 mt-2">
                {provider.configured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-medium rounded-full">
                    <XCircle className="w-3 h-3" />
                    Not configured
                  </span>
                )}
                {envStatus?.key_preview && (
                  <span className="text-xs text-gray-400 font-mono">
                    {envStatus.key_preview}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            className={cn(
              "p-2 rounded-lg transition-colors",
              "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mt-4">
          {config.features.map((feature) => (
            <span
              key={feature}
              className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Models preview */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {provider.models.slice(0, 3).map((model) => (
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
              </span>
            ))}
            {provider.models.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-400">
                +{provider.models.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content - API key input */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="space-y-4">
            {/* API Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {provider.id === "ollama" ? "Base URL" : "API Key"}
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={config.placeholder}
                  className={cn(
                    "w-full px-4 py-3 pr-24 rounded-xl border bg-gray-50 dark:bg-gray-900",
                    "text-gray-900 dark:text-white placeholder-gray-400",
                    "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                    "transition-all duration-200",
                    testResult?.valid === false
                      ? "border-red-300 dark:border-red-700"
                      : testResult?.valid === true
                        ? "border-green-300 dark:border-green-700"
                        : "border-gray-200 dark:border-gray-700"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl",
                  testResult.valid
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}
              >
                {testResult.valid ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTest}
                disabled={testMutation.isPending || !apiKey.trim()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-200 dark:hover:bg-gray-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {testMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube2 className="w-4 h-4" />
                )}
                Test Connection
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || !apiKey.trim()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                  "bg-gradient-to-r from-purple-500 to-cyan-500 text-white",
                  "hover:from-purple-600 hover:to-cyan-600",
                  "shadow-lg shadow-purple-500/25",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                )}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save to .env
              </button>
            </div>

            {/* Get API key link */}
            <a
              href={config.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-purple-500 hover:text-purple-600 transition-colors"
            >
              <Key className="w-4 h-4" />
              Get {provider.name} API key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
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
  const configured = useMemo(
    () => providers.filter((p) => p.configured).length,
    [providers]
  );
  const total = providers.length;
  const totalModels = useMemo(
    () => providers.reduce((sum, p) => sum + p.models.length, 0),
    [providers]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600"
            style={{ boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)" }}
          >
            <Server className="w-5 h-5 text-white" />
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
          <div
            className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600"
            style={{ boxShadow: "0 4px 20px rgba(16, 185, 129, 0.4)" }}
          >
            <Check className="w-5 h-5 text-white" />
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
          <div
            className="p-2.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600"
            style={{ boxShadow: "0 4px 20px rgba(6, 182, 212, 0.4)" }}
          >
            <Cpu className="w-5 h-5 text-white" />
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

// Quick setup guide with stepper
function QuickSetupGuide() {
  const steps = [
    {
      icon: Key,
      title: "Get API Keys",
      description: "Sign up for your preferred LLM providers",
    },
    {
      icon: Zap,
      title: "Enter & Test",
      description: "Paste your key and test the connection",
    },
    {
      icon: Save,
      title: "Save",
      description: "Click save to store in .env file",
    },
    {
      icon: Sparkles,
      title: "Generate Insights",
      description: "Go to AI Insights and start analyzing",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Quick Setup Guide
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, idx) => (
          <div key={step.title} className="flex items-start gap-3">
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm",
                "bg-gradient-to-br",
                idx === 0
                  ? "from-purple-500 to-violet-600"
                  : idx === 1
                    ? "from-cyan-500 to-blue-600"
                    : idx === 2
                      ? "from-emerald-500 to-green-600"
                      : "from-orange-500 to-amber-600"
              )}
            >
              {idx + 1}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
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
    isLoading: providersLoading,
    error: providersError,
    refetch: refetchProviders,
    isFetching,
  } = useQuery({
    queryKey: ["llm-providers"],
    queryFn: () => api.getLLMProviders(),
    staleTime: 30 * 1000, // 30 seconds
  });

  const { data: envStatus, refetch: refetchEnv } = useQuery({
    queryKey: ["env-status"],
    queryFn: () => api.getEnvStatus(),
    staleTime: 30 * 1000,
  });

  const providers: LLMProviderInfo[] = providersData?.providers ?? [];

  const handleRefresh = () => {
    refetchProviders();
    refetchEnv();
  };

  useEffect(() => {
    if (!providersLoading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [providersLoading]);

  if (providersLoading) {
    return (
      <div className="min-h-screen p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (providersError) {
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
            onClick={() => handleRefresh()}
            disabled={isFetching}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
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
      <div
        ref={headerRef}
        className="flex items-center justify-between opacity-0"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/30">
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
          onClick={() => handleRefresh()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Status Summary */}
      <StatusSummary providers={providers} isLoading={providersLoading} />

      {/* Quick Setup Guide */}
      <QuickSetupGuide />

      {/* LLM Providers Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-5 h-5 text-purple-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            LLM Providers
          </h2>
          <span className="text-sm text-gray-400">
            Click to expand and configure
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((provider, idx) => (
            <InteractiveProviderCard
              key={provider.id}
              provider={provider}
              envStatus={envStatus?.providers?.[provider.id]}
              delay={100 + idx * 100}
              onRefresh={handleRefresh}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
