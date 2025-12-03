import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';
export type LLMProvider = 'openai' | 'anthropic' | 'ollama';

interface SettingsState {
  // 主题
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // LLM 设置
  selectedProvider: LLMProvider;
  setSelectedProvider: (provider: LLMProvider) => void;

  // API URL
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;

  // 通知设置
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // 后台刷新
  backgroundRefreshEnabled: boolean;
  setBackgroundRefreshEnabled: (enabled: boolean) => void;

  // Widget 更新间隔 (分钟)
  widgetUpdateInterval: number;
  setWidgetUpdateInterval: (interval: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 主题
      themeMode: 'system',
      setThemeMode: (mode) => set({themeMode: mode}),

      // LLM 设置
      selectedProvider: 'anthropic',
      setSelectedProvider: (provider) => set({selectedProvider: provider}),

      // API URL - iOS 模拟器需要使用 Mac 的实际 IP 地址
      apiBaseUrl: 'http://192.168.50.217:8000/api',
      setApiBaseUrl: (url) => set({apiBaseUrl: url}),

      // 通知设置
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) =>
        set({notificationsEnabled: enabled}),

      // 后台刷新
      backgroundRefreshEnabled: true,
      setBackgroundRefreshEnabled: (enabled) =>
        set({backgroundRefreshEnabled: enabled}),

      // Widget 更新间隔
      widgetUpdateInterval: 15,
      setWidgetUpdateInterval: (interval) =>
        set({widgetUpdateInterval: interval}),
    }),
    {
      name: 'claudescope-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
