import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {
  Brain,
  FolderKanban,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronRight,
  BarChart3,
  Layers,
} from 'lucide-react-native';
import {api} from '../services/api';
import {ProjectStats} from '../types';

// SVG Gradient Box Component
function GradientBox({
  children,
  colors,
  style,
  horizontal = false,
  gradientId,
}: {
  children: React.ReactNode;
  colors: string[];
  style?: any;
  horizontal?: boolean;
  gradientId: string;
}) {
  return (
    <View style={[{overflow: 'hidden'}, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2={horizontal ? '100%' : '100%'}
            y2={horizontal ? '0%' : '100%'}>
            {colors.map((color, i) => (
              <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
}

const {width} = Dimensions.get('window');

type TabType = 'overview' | 'projects';

export default function StatisticsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const {data: stats, isLoading} = useQuery({
    queryKey: ['statistics'],
    queryFn: () => api.getStatisticsOverview(),
    retry: false,
  });

  const {data: projects, isLoading: isLoadingProjects} = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    retry: false,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
        <Text style={styles.title}>统计分析</Text>
        <Text style={styles.subtitle}>深入了解你的 Claude 使用情况</Text>
      </Animated.View>

      {/* Tab Switcher */}
      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}>
          <BarChart3 color={activeTab === 'overview' ? '#fff' : '#71717a'} size={16} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            总览
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
          onPress={() => setActiveTab('projects')}>
          <Layers color={activeTab === 'projects' ? '#fff' : '#71717a'} size={16} />
          <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
            项目
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' ? (
          <OverviewTab stats={stats} isLoading={isLoading} />
        ) : (
          <ProjectsTab projects={projects} isLoading={isLoadingProjects} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Overview Tab
function OverviewTab({stats, isLoading}: {stats: any; isLoading: boolean}) {
  // 获取top trigger word
  const topTriggerWord = stats?.thinking?.by_trigger_word
    ? Object.entries(stats.thinking.by_trigger_word).sort((a, b) => (b[1] as number) - (a[1] as number))[0]
    : null;

  return (
    <>
      {/* Thinking Usage Hero */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <GradientBox
          colors={['#7c3aed', '#6d28d9', '#5b21b6']}
          style={styles.thinkingCard}
          gradientId="stats-thinking">
          <View style={styles.thinkingContent}>
            <View style={styles.thinkingHeader}>
              <View style={styles.thinkingIcon}>
                <Brain color="#fff" size={24} />
              </View>
              <View>
                <Text style={styles.thinkingTitle}>扩展思考使用</Text>
                <Text style={styles.thinkingSubtitle}>Extended Thinking Analytics</Text>
              </View>
            </View>

            <View style={styles.thinkingGrid}>
              <ThinkingStat
                value={stats?.thinking?.total_triggers ?? 0}
                label="总触发次数"
                icon={<Sparkles color="#c4b5fd" size={16} />}
              />
              <ThinkingStat
                value={stats?.thinking?.average_per_session ?? 0}
                label="每会话平均"
                icon={<TrendingUp color="#c4b5fd" size={16} />}
              />
              <ThinkingStat
                value={topTriggerWord ? (topTriggerWord[1] as number) : 0}
                label={topTriggerWord ? String(topTriggerWord[0]) : 'ultrathink'}
                icon={<Brain color="#c4b5fd" size={16} />}
              />
              <ThinkingStat
                value={Object.keys(stats?.thinking?.by_project ?? {}).length}
                label="项目覆盖"
                icon={<FolderKanban color="#c4b5fd" size={16} />}
              />
            </View>
          </View>
        </GradientBox>
      </Animated.View>

      {/* Projects & Sessions */}
      <Animated.View entering={FadeInDown.delay(300).duration(600)}>
        <Text style={styles.sectionTitle}>项目与会话</Text>
        <View style={styles.statsRow}>
          <GradientBox
            colors={['#581c87', '#7e22ce']}
            style={styles.statCard}
            gradientId="stats-projects">
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <FolderKanban color="#e9d5ff" size={24} />
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : stats?.projects_count ?? 0}
              </Text>
              <Text style={styles.statLabel}>项目数</Text>
            </View>
          </GradientBox>

          <GradientBox
            colors={['#1e3a8a', '#2563eb']}
            style={styles.statCard}
            gradientId="stats-sessions">
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <MessageSquare color="#bfdbfe" size={24} />
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : stats?.sessions_count ?? 0}
              </Text>
              <Text style={styles.statLabel}>会话数</Text>
            </View>
          </GradientBox>
        </View>
      </Animated.View>

      {/* Prompts Stats */}
      <Animated.View entering={FadeInDown.delay(350).duration(600)}>
        <View style={styles.statsRow}>
          <GradientBox
            colors={['#14532d', '#166534']}
            style={styles.statCard}
            gradientId="stats-prompts">
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <MessageSquare color="#bbf7d0" size={24} />
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : stats?.prompts_count?.toLocaleString() ?? 0}
              </Text>
              <Text style={styles.statLabel}>总 Prompts</Text>
            </View>
          </GradientBox>

          <GradientBox
            colors={['#7c2d12', '#c2410c']}
            style={styles.statCard}
            gradientId="stats-avg">
            <View style={styles.statCardContent}>
              <View style={styles.statIconContainer}>
                <TrendingUp color="#fed7aa" size={24} />
              </View>
              <Text style={styles.statValue}>
                {isLoading ? '...' : stats?.average_prompts_per_session?.toFixed(1) ?? 0}
              </Text>
              <Text style={styles.statLabel}>每会话 Prompts</Text>
            </View>
          </GradientBox>
        </View>
      </Animated.View>

      {/* Token Stats */}
      <Animated.View entering={FadeInDown.delay(400).duration(600)}>
        <Text style={styles.sectionTitle}>Token 使用</Text>
        <GradientBox
          colors={['#1e1b4b', '#312e81']}
          style={styles.tokenCard}
          gradientId="stats-tokens">
          <View style={styles.tokenContent}>
            <View style={styles.tokenTotal}>
              <Zap color="#fbbf24" size={28} />
              <Text style={styles.tokenTotalValue}>
                {(stats?.tokens?.total_tokens ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.tokenTotalLabel}>总 Token</Text>
            </View>
            <View style={styles.tokenBreakdown}>
              <View style={styles.tokenItem}>
                <Text style={styles.tokenItemLabel}>输入</Text>
                <Text style={styles.tokenItemValue}>
                  {(stats?.tokens?.input_tokens ?? 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.tokenItem}>
                <Text style={styles.tokenItemLabel}>输出</Text>
                <Text style={styles.tokenItemValue}>
                  {(stats?.tokens?.output_tokens ?? 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.tokenItem}>
                <Text style={styles.tokenItemLabel}>缓存读取</Text>
                <Text style={styles.tokenItemValue}>
                  {(stats?.tokens?.cache_read_tokens ?? 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </GradientBox>
      </Animated.View>

      {/* Period Info */}
      <Animated.View entering={FadeInDown.delay(450).duration(600)}>
        <View style={styles.dateCard}>
          <Text style={styles.dateLabel}>统计周期</Text>
          <Text style={styles.dateValue}>最近 {stats?.period_days ?? 30} 天</Text>
        </View>
      </Animated.View>
    </>
  );
}

// Projects Tab
function ProjectsTab({projects, isLoading}: {projects: ProjectStats[] | undefined; isLoading: boolean}) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载项目数据...</Text>
      </View>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FolderKanban color="#52525b" size={48} />
        <Text style={styles.emptyText}>暂无项目数据</Text>
        <Text style={styles.emptySubtext}>开始使用 Claude Code 后这里会显示项目统计</Text>
      </View>
    );
  }

  // Sort by total tokens
  const sortedProjects = [...projects].sort((a, b) => b.tokens - a.tokens);
  const maxTokens = sortedProjects[0]?.tokens || 1;

  return (
    <>
      {/* Summary */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <GradientBox colors={['#1e1b4b', '#312e81']} style={styles.projectSummaryCard} gradientId="proj-summary">
          <View style={styles.projectSummaryContent}>
            <View style={styles.projectSummaryIcon}>
              <Layers color="#a5b4fc" size={28} />
            </View>
            <View style={styles.projectSummaryText}>
              <Text style={styles.projectSummaryTitle}>
                共 {projects.length} 个项目
              </Text>
              <Text style={styles.projectSummarySubtitle}>
                总计 {projects.reduce((sum, p) => sum + p.sessions, 0).toLocaleString()} 次会话
              </Text>
            </View>
          </View>
        </GradientBox>
      </Animated.View>

      {/* Project List */}
      <Text style={styles.sectionTitle}>项目明细</Text>
      {sortedProjects.map((project, index) => (
        <Animated.View key={project.name} entering={FadeInDown.delay(250 + index * 40).duration(400)}>
          <ProjectCard project={project} index={index} maxTokens={maxTokens} />
        </Animated.View>
      ))}
    </>
  );
}

// Project Card Component
function ProjectCard({project, index, maxTokens}: {project: ProjectStats; index: number; maxTokens: number}) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.round((project.tokens / maxTokens) * 100);
  const avgTokensPerSession = project.sessions > 0 ? Math.round(project.tokens / project.sessions) : 0;

  const gradientColors = [
    ['#14532d', '#166534'],
    ['#1e3a8a', '#1d4ed8'],
    ['#581c87', '#7e22ce'],
    ['#7c2d12', '#c2410c'],
    ['#713f12', '#a16207'],
  ];

  const colors = gradientColors[index % gradientColors.length];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded(!expanded)}
      style={styles.projectCard}>
      <View style={styles.projectCardHeader}>
        <View style={styles.projectNameContainer}>
          <View style={[styles.projectColorDot, {backgroundColor: colors[1]}]} />
          <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
        </View>
        <View style={styles.projectTokens}>
          <Zap color="#facc15" size={14} />
          <Text style={styles.projectTokensText}>
            {project.tokens.toLocaleString()}
          </Text>
        </View>
        <ChevronRight
          color="#71717a"
          size={18}
          style={{transform: [{rotate: expanded ? '90deg' : '0deg'}]}}
        />
      </View>

      {/* Progress Bar */}
      <View style={styles.projectProgressBg}>
        <GradientBox
          colors={colors}
          horizontal
          style={[styles.projectProgressBar, {width: `${percentage}%`}]}
          gradientId={`proj-bar-${index}`}
        />
      </View>

      {/* Quick Stats */}
      <View style={styles.projectQuickStats}>
        <View style={styles.projectQuickStat}>
          <Text style={styles.projectQuickStatLabel}>会话</Text>
          <Text style={styles.projectQuickStatValue}>{project.sessions}</Text>
        </View>
        <View style={styles.projectQuickStat}>
          <Text style={styles.projectQuickStatLabel}>Prompts</Text>
          <Text style={styles.projectQuickStatValue}>{project.prompts}</Text>
        </View>
        <View style={styles.projectQuickStat}>
          <Text style={styles.projectQuickStatLabel}>思考触发</Text>
          <Text style={styles.projectQuickStatValue}>{project.thinking_triggers}</Text>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.projectDetails}>
          <View style={styles.projectDetailRow}>
            <Text style={styles.projectDetailLabel}>总 Token</Text>
            <Text style={styles.projectDetailValue}>{project.tokens.toLocaleString()}</Text>
          </View>
          <View style={styles.projectDetailRow}>
            <Text style={styles.projectDetailLabel}>平均每会话 Token</Text>
            <Text style={styles.projectDetailValue}>{avgTokensPerSession.toLocaleString()}</Text>
          </View>
          <View style={styles.projectDetailRow}>
            <Text style={styles.projectDetailLabel}>每会话 Prompts</Text>
            <Text style={styles.projectDetailValue}>
              {project.sessions > 0 ? (project.prompts / project.sessions).toFixed(1) : 0}
            </Text>
          </View>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

function ThinkingStat({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.thinkingStatItem}>
      <View style={styles.thinkingStatHeader}>
        {icon}
        <Text style={styles.thinkingStatLabel}>{label}</Text>
      </View>
      <Text style={styles.thinkingStatValue}>{value.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#7c3aed',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71717a',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  thinkingCard: {
    borderRadius: 24,
    marginBottom: 24,
  },
  thinkingContent: {
    padding: 20,
  },
  thinkingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  thinkingIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thinkingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  thinkingSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  thinkingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  thinkingStatItem: {
    width: (width - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 14,
  },
  thinkingStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  thinkingStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
  },
  thinkingStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
  },
  statCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  dateCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  dateLabel: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 12,
  },
  dateValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  dateSeparator: {
    fontSize: 14,
    color: '#52525b',
    marginVertical: 4,
  },
  // Token Card
  tokenCard: {
    borderRadius: 20,
    marginBottom: 24,
  },
  tokenContent: {
    padding: 20,
  },
  tokenTotal: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenTotalValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
  },
  tokenTotalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  tokenBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  tokenItem: {
    alignItems: 'center',
  },
  tokenItemLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  tokenItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  // Loading & Empty
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    color: '#71717a',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#52525b',
    fontSize: 14,
    textAlign: 'center',
  },
  // Project Summary
  projectSummaryCard: {
    borderRadius: 20,
    marginBottom: 20,
  },
  projectSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  projectSummaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectSummaryText: {
    flex: 1,
  },
  projectSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  projectSummarySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  // Project Card
  projectCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  projectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  projectColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  projectTokens: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  projectTokensText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#facc15',
  },
  projectProgressBg: {
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  projectProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  projectQuickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectQuickStat: {
    alignItems: 'center',
  },
  projectQuickStatLabel: {
    fontSize: 11,
    color: '#52525b',
    marginBottom: 2,
  },
  projectQuickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  // Project Details
  projectDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  projectDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  projectDetailLabel: {
    fontSize: 13,
    color: '#71717a',
  },
  projectDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#d4d4d8',
  },
});
