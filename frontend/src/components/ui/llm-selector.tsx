"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { api, LLMProviderInfo } from "@/lib/api";

interface LLMSelectorProps {
  onProviderChange?: (provider: string, model: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const providerIcons: Record<string, string> = {
  openai: "O",
  anthropic: "A",
  deepseek: "D",
  ollama: "L",
};

const providerColors: Record<string, string> = {
  openai: "from-green-500 to-emerald-600",
  anthropic: "from-orange-500 to-amber-600",
  deepseek: "from-blue-500 to-cyan-600",
  ollama: "from-purple-500 to-violet-600",
};

export function LLMSelector({
  onProviderChange,
  className,
  size = "md",
}: LLMSelectorProps) {
  const [providers, setProviders] = useState<LLMProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsLoading(true);
        const response = await api.getLLMProviders();
        setProviders(response.providers);

        // Set default provider
        const defaultProvider =
          response.providers.find((p) => p.configured)?.id ||
          response.default_provider;
        setSelectedProvider(defaultProvider);

        // Set default model
        const provider = response.providers.find((p) => p.id === defaultProvider);
        if (provider) {
          setSelectedModel(provider.default_model);
        }

        setError(null);
      } catch (err) {
        setError("Failed to load LLM providers");
        console.error("Failed to fetch LLM providers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = providers.find((p) => p.id === providerId);
    if (provider) {
      setSelectedModel(provider.default_model);
      onProviderChange?.(providerId, provider.default_model);
    }
    setIsOpen(false);
  };

  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    onProviderChange?.(selectedProvider, model);
  };

  const currentProvider = providers.find((p) => p.id === selectedProvider);

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-red-500 text-sm", className)}>
        {error}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        {/* Provider Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
              "transition-all duration-200",
              sizeClasses[size]
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold",
                "bg-gradient-to-br",
                providerColors[selectedProvider] || "from-gray-500 to-gray-600"
              )}
            >
              {providerIcons[selectedProvider] || "?"}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {currentProvider?.name || "Select Provider"}
            </span>
            <svg
              className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              className={cn(
                "absolute top-full left-0 mt-2 z-50",
                "w-56 rounded-xl border border-gray-200 dark:border-gray-700",
                "bg-white dark:bg-gray-800 shadow-xl",
                "animate-in fade-in-0 zoom-in-95 duration-200"
              )}
            >
              <div className="p-2">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    disabled={!provider.configured}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg",
                      "transition-all duration-150",
                      provider.configured
                        ? "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        : "opacity-50 cursor-not-allowed",
                      selectedProvider === provider.id &&
                        "bg-purple-50 dark:bg-purple-900/20"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold",
                        "bg-gradient-to-br",
                        providerColors[provider.id] || "from-gray-500 to-gray-600"
                      )}
                    >
                      {providerIcons[provider.id] || "?"}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {provider.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {provider.configured ? (
                          <span className="text-green-500">Configured</span>
                        ) : (
                          <span>API key required</span>
                        )}
                      </div>
                    </div>
                    {selectedProvider === provider.id && (
                      <svg
                        className="w-5 h-5 text-purple-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Model Selector */}
        {currentProvider && currentProvider.models.length > 1 && (
          <select
            value={selectedModel}
            onChange={(e) => handleModelSelect(e.target.value)}
            className={cn(
              "rounded-lg border border-gray-200 dark:border-gray-700",
              "bg-white dark:bg-gray-800",
              "text-gray-900 dark:text-white",
              "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              sizeClasses[size]
            )}
          >
            {currentProvider.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Compact inline version for use in headers
export function LLMSelectorCompact({
  provider,
  model,
  onProviderChange,
  className,
}: {
  provider: string;
  model: string;
  onProviderChange?: (provider: string, model: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-md",
        "bg-gray-100 dark:bg-gray-700",
        "text-xs text-gray-600 dark:text-gray-300",
        className
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-bold",
          "bg-gradient-to-br",
          providerColors[provider] || "from-gray-500 to-gray-600"
        )}
      >
        {providerIcons[provider] || "?"}
      </div>
      <span>{model}</span>
    </div>
  );
}
