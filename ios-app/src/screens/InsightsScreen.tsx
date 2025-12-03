import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import Animated, {FadeInDown, FadeIn} from 'react-native-reanimated';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  Star,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  FolderOpen,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import {api} from '../services/api';
import {GoodPromptItem, GoodPromptsResponse} from '../types';

const {width} = Dimensions.get('window');

// SVG Gradient Box Component
function GradientBox({
  children,
  colors,
  style,
  gradientId,
}: {
  children: React.ReactNode;
  colors: string[];
  style?: any;
  gradientId: string;
}) {
  return (
    <View style={[{overflow: 'hidden'}, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
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

type TabType = 'learn' | 'insights';

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('learn');

  // Good Prompts Query - 获取列表响应
  const {
    data: goodPromptsData,
    isLoading: isLoadingPrompts,
    refetch: refetchPrompts,
    isRefetching: isRefetchingPrompts,
  } = useQuery({
    queryKey: ['good-prompts'],
    queryFn: () => api.getGoodPrompts(10),
    retry: false,
  });

  // AI Insights Query
  const {
    data: insights,
    isLoading: isLoadingInsights,
    refetch: refetchInsights,
    isFetching: isFetchingInsights,
  } = useQuery({
    queryKey: ['insights'],
    queryFn: () => api.getInsights(),
    enabled: false, // Manual trigger
  });

  const getImpactStyle = (impact: string) => {
    switch (impact) {
      case 'high':
        return {
          textColor: '#f87171',
          bgColor: 'rgba(127, 29, 29, 0.3)',
          label: '高影响',
        };
      case 'medium':
        return {
          textColor: '#facc15',
          bgColor: 'rgba(113, 63, 18, 0.3)',
          label: '中影响',
        };
      default:
        return {
          textColor: '#4ade80',
          bgColor: 'rgba(20, 83, 45, 0.3)',
          label: '低影响',
        };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
        <Text style={styles.title}>学习与提升</Text>
        <Text style={styles.subtitle}>从优秀案例中学习 Prompt 技巧</Text>
      </Animated.View>

      {/* Tab Switcher */}
      <Animated.View entering={FadeInDown.delay(150).duration(600)} style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'learn' && styles.tabActive]}
          onPress={() => setActiveTab('learn')}>
          <BookOpen color={activeTab === 'learn' ? '#fff' : '#71717a'} size={16} />
          <Text style={[styles.tabText, activeTab === 'learn' && styles.tabTextActive]}>
            优质示例
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'insights' && styles.tabActive]}
          onPress={() => setActiveTab('insights')}>
          <Sparkles color={activeTab === 'insights' ? '#fff' : '#71717a'} size={16} />
          <Text style={[styles.tabText, activeTab === 'insights' && styles.tabTextActive]}>
            AI 洞察
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingPrompts}
            onRefresh={refetchPrompts}
            tintColor="#a855f7"
          />
        }>
        {activeTab === 'learn' ? (
          <LearnTab
            goodPromptsData={goodPromptsData}
            isLoading={isLoadingPrompts}
            onRefresh={refetchPrompts}
            isRefreshing={isRefetchingPrompts}
          />
        ) : (
          <InsightsTab
            insights={insights}
            isLoading={isLoadingInsights}
            isFetching={isFetchingInsights}
            onGenerate={refetchInsights}
            getImpactStyle={getImpactStyle}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Learn Tab Component
function LearnTab({
  goodPromptsData,
  isLoading,
  onRefresh,
  isRefreshing,
}: {
  goodPromptsData: GoodPromptsResponse | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const goodPrompts = goodPromptsData?.items ?? [];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#a855f7" size="large" />
        <Text style={styles.loadingText}>正在获取优质 Prompt 示例...</Text>
      </View>
    );
  }

  if (!goodPrompts || goodPrompts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Award color="#52525b" size={64} />
        <Text style={styles.emptyTitle}>暂无优质示例</Text>
        <Text style={styles.emptySubtext}>
          继续使用 Claude Code，系统会自动识别你的优秀 Prompt
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw color="#a855f7" size={16} />
          <Text style={styles.refreshButtonText}>刷新</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {/* Summary Card */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <GradientBox colors={['#14532d', '#166534', '#15803d']} style={styles.heroCard} gradientId="learn-hero">
          <View style={styles.heroContent}>
            <View style={styles.heroIcon}>
              <Star color="#fde047" size={28} fill="#fde047" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroTitle}>
                发现 {goodPromptsData?.total ?? 0} 个优质 Prompt
              </Text>
              <Text style={styles.heroSubtitle}>
                平均得分 {goodPromptsData?.average_score?.toFixed(1) ?? 0} 分，学习这些技巧提升效率
              </Text>
            </View>
          </View>
        </GradientBox>
      </Animated.View>

      {/* Refresh Button */}
      <Animated.View entering={FadeInDown.delay(250).duration(600)}>
        <TouchableOpacity
          style={styles.newExamplesButton}
          onPress={onRefresh}
          disabled={isRefreshing}>
          {isRefreshing ? (
            <ActivityIndicator color="#a855f7" size="small" />
          ) : (
            <>
              <RefreshCw color="#a855f7" size={16} />
              <Text style={styles.newExamplesText}>刷新列表</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Good Prompt Cards */}
      {goodPrompts.map((prompt, index) => (
        <Animated.View key={index} entering={FadeInDown.delay(300 + index * 50).duration(400)}>
          <GoodPromptCard
            prompt={prompt}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
          />
        </Animated.View>
      ))}

      {/* Learning Tips */}
      <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <TrendingUp color="#a855f7" size={18} />
          <Text style={styles.tipsTitle}>Prompt 优化技巧</Text>
        </View>
        <View style={styles.tipsList}>
          <TipItem text="提供清晰的上下文和背景信息" />
          <TipItem text="明确指定输出格式和约束条件" />
          <TipItem text="将复杂任务分解为具体步骤" />
          <TipItem text="使用示例来说明预期结果" />
        </View>
      </Animated.View>
    </>
  );
}

// Good Prompt Card Component - 使用新的 GoodPromptItem 类型
function GoodPromptCard({
  prompt,
  index,
  isExpanded,
  onToggle,
}: {
  prompt: GoodPromptItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const scoreColor = prompt.score >= 80 ? '#4ade80' : prompt.score >= 60 ? '#facc15' : '#f87171';

  // 获取维度得分的前几个
  const topDimensions = Object.entries(prompt.dimension_scores || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onToggle} style={styles.promptCard}>
      <View style={styles.promptCardHeader}>
        <View style={styles.promptScoreContainer}>
          <Text style={[styles.promptScore, {color: scoreColor}]}>{Math.round(prompt.score)}</Text>
          <Text style={styles.promptScoreLabel}>分</Text>
        </View>
        <View style={styles.promptMetaContainer}>
          <View style={styles.promptProjectRow}>
            <FolderOpen color="#71717a" size={12} />
            <Text style={styles.promptProject}>{prompt.project}</Text>
          </View>
          <Text style={styles.promptTimestamp}>
            {new Date(prompt.timestamp).toLocaleDateString('zh-CN')}
          </Text>
        </View>
        <ChevronRight
          color="#71717a"
          size={20}
          style={{transform: [{rotate: isExpanded ? '90deg' : '0deg'}]}}
        />
      </View>

      {/* Prompt Content - 使用 excerpt 或 text */}
      <View style={styles.promptContentBox}>
        <Text style={styles.promptText} numberOfLines={isExpanded ? undefined : 3}>
          {isExpanded ? prompt.text : prompt.excerpt}
        </Text>
      </View>

      {/* Expanded Analysis */}
      {isExpanded && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.analysisContainer}>
          {/* Reasons (优点) */}
          {prompt.reasons && prompt.reasons.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>为什么优秀</Text>
              {prompt.reasons.map((reason, i) => (
                <View key={i} style={styles.strengthRow}>
                  <CheckCircle color="#4ade80" size={14} />
                  <Text style={styles.strengthText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dimension Scores */}
          {topDimensions.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>维度得分</Text>
              <View style={styles.dimensionList}>
                {topDimensions.map(([dim, score], i) => (
                  <View key={i} style={styles.dimensionItem}>
                    <Text style={styles.dimensionName}>{dim}</Text>
                    <View style={styles.dimensionBarBg}>
                      <View style={[styles.dimensionBar, {width: `${score}%`}]} />
                    </View>
                    <Text style={styles.dimensionScore}>{Math.round(score)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Categories */}
          {prompt.categories && prompt.categories.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>分类标签</Text>
              <View style={styles.techniquesList}>
                {prompt.categories.map((category, i) => (
                  <View key={i} style={styles.techniqueBadge}>
                    <Text style={styles.techniqueBadgeText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

function TipItem({text}: {text: string}) {
  return (
    <View style={styles.tipItem}>
      <Lightbulb color="#facc15" size={14} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

// Insights Tab Component
function InsightsTab({
  insights,
  isLoading,
  isFetching,
  onGenerate,
  getImpactStyle,
}: {
  insights: any;
  isLoading: boolean;
  isFetching: boolean;
  onGenerate: () => void;
  getImpactStyle: (impact: string) => {textColor: string; bgColor: string; label: string};
}) {
  return (
    <>
      {/* Generate Button */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)}>
        <TouchableOpacity
          onPress={onGenerate}
          disabled={isFetching}
          style={styles.generateButton}
          activeOpacity={0.7}>
          {isFetching ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Sparkles color="white" size={18} />
              <Text style={styles.generateButtonText}>
                {insights ? '重新生成洞察' : '生成 AI 洞察'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {!insights && !isLoading && (
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.emptyInsightsCard}>
            <Lightbulb color="#a855f7" size={48} />
            <Text style={styles.emptyInsightsTitle}>获取个性化建议</Text>
            <Text style={styles.emptyInsightsDescription}>
              点击上方按钮，AI 将分析你的使用模式并提供针对性的优化建议
            </Text>
          </View>
        </Animated.View>
      )}

      {insights && (
        <>
          {/* Summary */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <GradientBox
              colors={['#1e1b4b', '#312e81']}
              style={styles.insightSummaryCard}
              gradientId="insight-summary">
              <View style={styles.insightSummaryContent}>
                <Text style={styles.insightSummaryLabel}>AI 分析摘要</Text>
                <Text style={styles.insightSummaryText}>{insights.summary}</Text>
                <Text style={styles.insightGeneratedAt}>
                  生成于: {new Date(insights.generated_at).toLocaleString('zh-CN')}
                </Text>
              </View>
            </GradientBox>
          </Animated.View>

          {/* Insights List */}
          <Text style={styles.insightsSectionTitle}>详细洞察</Text>

          {insights.insights.map((insight: any, index: number) => {
            const impactStyle = getImpactStyle(insight.impact);

            return (
              <Animated.View key={insight.id} entering={FadeInDown.delay(400 + index * 50).duration(400)}>
                <View style={styles.insightCard}>
                  <View style={styles.insightCardHeader}>
                    <View style={styles.insightIconBox}>
                      <Lightbulb color="#a855f7" size={20} />
                    </View>
                    <View style={styles.insightHeaderContent}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <View style={styles.insightMeta}>
                        <Text style={styles.categoryText}>{insight.category}</Text>
                        <View
                          style={[styles.impactBadge, {backgroundColor: impactStyle.bgColor}]}>
                          <Text style={[styles.impactText, {color: impactStyle.textColor}]}>
                            {impactStyle.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.insightDescription}>{insight.description}</Text>

                  {insight.actions && insight.actions.length > 0 && (
                    <View style={styles.actionsBox}>
                      <Text style={styles.actionsLabel}>建议操作:</Text>
                      {insight.actions.map((action: string, actionIndex: number) => (
                        <View key={actionIndex} style={styles.actionRow}>
                          <CheckCircle color="#4ade80" size={14} />
                          <Text style={styles.actionText}>{action}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </>
      )}
    </>
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
  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    color: '#71717a',
    fontSize: 14,
  },
  // Empty States
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#52525b',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  refreshButtonText: {
    color: '#a855f7',
    fontWeight: '500',
  },
  // Hero Card
  heroCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    lineHeight: 18,
  },
  // New Examples Button
  newExamplesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  newExamplesText: {
    color: '#a855f7',
    fontWeight: '500',
  },
  // Prompt Card
  promptCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  promptCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginRight: 12,
  },
  promptScore: {
    fontSize: 28,
    fontWeight: '700',
  },
  promptScoreLabel: {
    fontSize: 12,
    color: '#71717a',
    marginLeft: 2,
  },
  promptMetaContainer: {
    flex: 1,
  },
  promptProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promptProject: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  promptTimestamp: {
    fontSize: 11,
    color: '#52525b',
    marginTop: 2,
  },
  promptContentBox: {
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    borderRadius: 10,
    padding: 12,
  },
  promptText: {
    fontSize: 14,
    color: '#e4e4e7',
    lineHeight: 20,
  },
  // Analysis Container
  analysisContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  strengthText: {
    flex: 1,
    fontSize: 13,
    color: '#d4d4d8',
    lineHeight: 18,
  },
  techniquesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techniqueBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  techniqueBadgeText: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  contextQuality: {
    fontSize: 13,
    color: '#d4d4d8',
    lineHeight: 18,
  },
  // Dimension Scores
  dimensionList: {
    gap: 8,
  },
  dimensionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dimensionName: {
    width: 70,
    fontSize: 12,
    color: '#a1a1aa',
  },
  dimensionBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  dimensionBar: {
    height: 6,
    backgroundColor: '#a855f7',
    borderRadius: 3,
  },
  dimensionScore: {
    width: 28,
    fontSize: 12,
    fontWeight: '600',
    color: '#a855f7',
    textAlign: 'right',
  },
  // Tips Section
  tipsSection: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  tipsList: {
    gap: 10,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#a1a1aa',
    lineHeight: 18,
  },
  // Generate Button
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  // Empty Insights
  emptyInsightsCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  emptyInsightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  emptyInsightsDescription: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  // Insight Summary Card
  insightSummaryCard: {
    borderRadius: 16,
    marginBottom: 20,
  },
  insightSummaryContent: {
    padding: 16,
  },
  insightSummaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  insightSummaryText: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 8,
    lineHeight: 20,
  },
  insightGeneratedAt: {
    fontSize: 12,
    color: '#52525b',
    marginTop: 12,
  },
  insightsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  // Insight Card
  insightCard: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    marginBottom: 12,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightIconBox: {
    backgroundColor: 'rgba(126, 34, 206, 0.3)',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  insightHeaderContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  insightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#52525b',
    marginRight: 8,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  impactText: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightDescription: {
    fontSize: 14,
    color: '#d4d4d8',
    marginBottom: 12,
    lineHeight: 20,
  },
  actionsBox: {
    backgroundColor: 'rgba(20, 83, 45, 0.2)',
    borderRadius: 10,
    padding: 12,
  },
  actionsLabel: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: '#86efac',
    lineHeight: 18,
  },
});
