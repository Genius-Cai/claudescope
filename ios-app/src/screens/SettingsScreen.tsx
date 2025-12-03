import React from 'react';
import {View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Bell,
  RefreshCw,
  Server,
  ChevronRight,
} from 'lucide-react-native';
import {useSettingsStore} from '../stores/settingsStore';

export default function SettingsScreen() {
  const {
    themeMode,
    setThemeMode,
    notificationsEnabled,
    setNotificationsEnabled,
    backgroundRefreshEnabled,
    setBackgroundRefreshEnabled,
    selectedProvider,
    setSelectedProvider,
  } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>外观</Text>
          </View>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setThemeMode('light')}
            activeOpacity={0.7}>
            <Sun color="#fbbf24" size={20} />
            <Text style={styles.optionText}>浅色模式</Text>
            {themeMode === 'light' && <View style={styles.selectedDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setThemeMode('dark')}
            activeOpacity={0.7}>
            <Moon color="#60a5fa" size={20} />
            <Text style={styles.optionText}>深色模式</Text>
            {themeMode === 'dark' && <View style={styles.selectedDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRowLast}
            onPress={() => setThemeMode('system')}
            activeOpacity={0.7}>
            <View style={styles.systemIcon} />
            <Text style={styles.optionText}>跟随系统</Text>
            {themeMode === 'system' && <View style={styles.selectedDot} />}
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>通知</Text>
          </View>

          <View style={styles.optionRow}>
            <Bell color="#a855f7" size={20} />
            <Text style={styles.optionText}>推送通知</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{false: '#3f3f46', true: '#9333ea'}}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.optionRowLast}>
            <RefreshCw color="#22c55e" size={20} />
            <Text style={styles.optionText}>后台刷新</Text>
            <Switch
              value={backgroundRefreshEnabled}
              onValueChange={setBackgroundRefreshEnabled}
              trackColor={{false: '#3f3f46', true: '#9333ea'}}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* LLM Provider Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI 洞察设置</Text>
          </View>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedProvider('anthropic')}
            activeOpacity={0.7}>
            <Server color="#f97316" size={20} />
            <Text style={styles.optionText}>Anthropic</Text>
            {selectedProvider === 'anthropic' && <View style={styles.selectedDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedProvider('openai')}
            activeOpacity={0.7}>
            <Server color="#10b981" size={20} />
            <Text style={styles.optionText}>OpenAI</Text>
            {selectedProvider === 'openai' && <View style={styles.selectedDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRowLast}
            onPress={() => setSelectedProvider('ollama')}
            activeOpacity={0.7}>
            <Server color="#3b82f6" size={20} />
            <Text style={styles.optionText}>Ollama (本地)</Text>
            {selectedProvider === 'ollama' && <View style={styles.selectedDot} />}
          </TouchableOpacity>
        </View>

        {/* API Key Management */}
        <TouchableOpacity style={styles.apiKeyButton} activeOpacity={0.7}>
          <Text style={styles.apiKeyText}>管理 API 密钥</Text>
          <ChevronRight color="#71717a" size={20} />
        </TouchableOpacity>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionTitle}>ClaudeScope iOS</Text>
          <Text style={styles.versionNumber}>版本 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  optionRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  selectedDot: {
    width: 20,
    height: 20,
    backgroundColor: '#a855f7',
    borderRadius: 10,
  },
  systemIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#52525b',
    borderRadius: 10,
  },
  apiKeyButton: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiKeyText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  versionContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  versionTitle: {
    fontSize: 14,
    color: '#52525b',
  },
  versionNumber: {
    fontSize: 12,
    color: '#3f3f46',
    marginTop: 4,
  },
});
