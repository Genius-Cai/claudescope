import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import Animated, {FadeInDown, FadeIn} from 'react-native-reanimated';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Copy,
  Lightbulb,
  FolderOpen,
  ChevronRight,
  Filter,
} from 'lucide-react-native';
import {api} from '../services/api';
import {AntipatternMatch, AntipatternResponse} from '../types';

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

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type TypeFilter = 'all' | string;

export default function AntipatternsScreen() {
  const [selectedItem, setSelectedItem] = useState<AntipatternMatch | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const {data: response, isLoading} = useQuery({
    queryKey: ['antipatterns'],
    queryFn: () => api.getAntipatterns(),
    retry: false,
  });

  // 从响应中获取 items 数组
  const antipatterns = response?.items ?? [];
  const byType = response?.by_type ?? {};
  const bySeverity = response?.by_severity ?? {};
  const total = response?.total ?? 0;

  // 过滤数据
  const filteredData = antipatterns.filter(item => {
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    return true;
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          colors: ['#7f1d1d', '#991b1b'],
          textColor: '#fca5a5',
          Icon: AlertTriangle,
          label: '严重',
          badge: '#dc2626',
        };
      case 'high':
        return {
          colors: ['#7c2d12', '#9a3412'],
          textColor: '#fdba74',
          Icon: AlertTriangle,
          label: '高',
          badge: '#ea580c',
        };
      case 'medium':
        return {
          colors: ['#713f12', '#854d0e'],
          textColor: '#fde047',
          Icon: AlertCircle,
          label: '中',
          badge: '#ca8a04',
        };
      default:
        return {
          colors: ['#1e3a8a', '#1d4ed8'],
          textColor: '#93c5fd',
          Icon: Info,
          label: '低',
          badge: '#2563eb',
        };
    }
  };

  const typeLabels: Record<string, string> = {
    vague_instruction: '模糊指令',
    toothpaste: '挤牙膏式',
    no_context: '缺乏上下文',
    unclear_goal: '目标不明确',
    too_broad: '范围过大',
  };

  const renderItem = ({item, index}: {item: AntipatternMatch; index: number}) => {
    const config = getSeverityConfig(item.severity);

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setSelectedItem(item)}
          style={styles.itemCard}>
          <GradientBox colors={config.colors} style={styles.itemGradient} gradientId={`ap-${item.id}`}>
            <View style={styles.itemContent}>
              {/* 头部：类型 + 严重程度 + 项目 */}
              <View style={styles.itemHeader}>
                <View style={styles.typeRow}>
                  <config.Icon color={config.textColor} size={16} />
                  <Text style={[styles.typeText, {color: config.textColor}]}>
                    {typeLabels[item.type] || item.type}
                  </Text>
                </View>
                <View style={[styles.severityBadge, {backgroundColor: config.badge}]}>
                  <Text style={styles.severityText}>{config.label}</Text>
                </View>
              </View>

              {/* Prompt 预览 */}
              <View style={styles.promptPreview}>
                <Text style={styles.promptLabel}>你的 Prompt:</Text>
                <Text style={styles.promptText} numberOfLines={2}>
                  "{item.prompt_excerpt}"
                </Text>
              </View>

              {/* 问题说明 */}
              <Text style={styles.explanation} numberOfLines={2}>
                {item.explanation}
              </Text>

              {/* 底部：项目 + 查看详情 */}
              <View style={styles.itemFooter}>
                <View style={styles.projectTag}>
                  <FolderOpen color="#71717a" size={12} />
                  <Text style={styles.projectText}>{item.project}</Text>
                </View>
                <View style={styles.viewMore}>
                  <Text style={styles.viewMoreText}>查看建议</Text>
                  <ChevronRight color="#a855f7" size={14} />
                </View>
              </View>
            </View>
          </GradientBox>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Stats */}
      <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
        <Text style={styles.title}>Prompt 问题分析</Text>
        <Text style={styles.subtitle}>
          共检测到 <Text style={styles.highlight}>{total}</Text> 个可改进的 Prompt
        </Text>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, severityFilter === 'all' && styles.statCardActive]}
            onPress={() => setSeverityFilter('all')}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>全部</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardRed, severityFilter === 'high' && styles.statCardActive]}
            onPress={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}>
            <Text style={styles.statValue}>
              {(bySeverity.critical ?? 0) + (bySeverity.high ?? 0)}
            </Text>
            <Text style={[styles.statLabel, {color: '#f87171'}]}>严重/高</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardYellow, severityFilter === 'medium' && styles.statCardActive]}
            onPress={() => setSeverityFilter(severityFilter === 'medium' ? 'all' : 'medium')}>
            <Text style={styles.statValue}>{bySeverity.medium ?? 0}</Text>
            <Text style={[styles.statLabel, {color: '#facc15'}]}>中等</Text>
          </TouchableOpacity>
        </View>

        {/* Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeFilters}
          contentContainerStyle={styles.typeFiltersContent}>
          <TouchableOpacity
            style={[styles.typeChip, typeFilter === 'all' && styles.typeChipActive]}
            onPress={() => setTypeFilter('all')}>
            <Filter color={typeFilter === 'all' ? '#fff' : '#71717a'} size={12} />
            <Text style={[styles.typeChipText, typeFilter === 'all' && styles.typeChipTextActive]}>
              全部类型
            </Text>
          </TouchableOpacity>
          {Object.entries(byType).map(([type, count]) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, typeFilter === type && styles.typeChipActive]}
              onPress={() => setTypeFilter(typeFilter === type ? 'all' : type)}>
              <Text style={[styles.typeChipText, typeFilter === type && styles.typeChipTextActive]}>
                {typeLabels[type] || type} ({count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Lightbulb color="#52525b" size={48} />
            <Text style={styles.emptyText}>
              {isLoading ? '正在分析你的 Prompt...' : '太棒了！没有检测到问题'}
            </Text>
            {!isLoading && (
              <Text style={styles.emptySubtext}>继续保持良好的 Prompt 习惯</Text>
            )}
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={selectedItem !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedItem(null)}>
        {selectedItem && (
          <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </Modal>
    </SafeAreaView>
  );
}

// Detail Modal Component
function DetailModal({item, onClose}: {item: AntipatternMatch; onClose: () => void}) {
  const config = getSeverityConfig(item.severity);

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>问题详情</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
        {/* Severity Badge */}
        <Animated.View entering={FadeIn.delay(100)}>
          <GradientBox colors={config.colors} style={styles.modalSeverity} gradientId="modal-severity">
            <View style={styles.modalSeverityContent}>
              <config.Icon color={config.textColor} size={24} />
              <View style={styles.modalSeverityText}>
                <Text style={[styles.modalSeverityLabel, {color: config.textColor}]}>
                  {config.label}风险
                </Text>
                <Text style={styles.modalSeverityType}>
                  {typeLabels[item.type] || item.type}
                </Text>
              </View>
            </View>
          </GradientBox>
        </Animated.View>

        {/* Original Prompt */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>你的原始 Prompt</Text>
          <View style={styles.promptBox}>
            <Text style={styles.promptBoxText}>"{item.prompt_excerpt}"</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Copy color="#71717a" size={16} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Problem Explanation */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>问题分析</Text>
          <View style={styles.explanationBox}>
            <AlertCircle color="#f87171" size={20} />
            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>
        </Animated.View>

        {/* Fix Suggestion */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>改进建议</Text>
          <GradientBox colors={['#14532d', '#166534']} style={styles.suggestionBox} gradientId="modal-suggestion">
            <View style={styles.suggestionContent}>
              <Lightbulb color="#86efac" size={20} />
              <Text style={styles.suggestionText}>{item.fix_suggestion}</Text>
            </View>
          </GradientBox>
        </Animated.View>

        {/* Meta Info */}
        <Animated.View entering={FadeIn.delay(500)} style={styles.modalMeta}>
          <View style={styles.metaItem}>
            <FolderOpen color="#71717a" size={16} />
            <Text style={styles.metaText}>{item.project}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>置信度:</Text>
            <Text style={styles.metaValue}>{Math.round(item.confidence * 100)}%</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getSeverityConfig(severity: string) {
  switch (severity) {
    case 'critical':
      return {
        colors: ['#7f1d1d', '#991b1b'],
        textColor: '#fca5a5',
        Icon: AlertTriangle,
        label: '严重',
      };
    case 'high':
      return {
        colors: ['#7c2d12', '#9a3412'],
        textColor: '#fdba74',
        Icon: AlertTriangle,
        label: '高',
      };
    case 'medium':
      return {
        colors: ['#713f12', '#854d0e'],
        textColor: '#fde047',
        Icon: AlertCircle,
        label: '中',
      };
    default:
      return {
        colors: ['#1e3a8a', '#1d4ed8'],
        textColor: '#93c5fd',
        Icon: Info,
        label: '低',
      };
  }
}

const typeLabels: Record<string, string> = {
  vague_instruction: '模糊指令',
  toothpaste: '挤牙膏式',
  no_context: '缺乏上下文',
  unclear_goal: '目标不明确',
  too_broad: '范围过大',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
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
  highlight: {
    color: '#a855f7',
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statCardActive: {
    borderColor: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  statCardRed: {
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    borderColor: 'rgba(153, 27, 27, 0.3)',
  },
  statCardYellow: {
    backgroundColor: 'rgba(113, 63, 18, 0.2)',
    borderColor: 'rgba(133, 77, 14, 0.3)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  typeFilters: {
    marginTop: 12,
    marginHorizontal: -16,
  },
  typeFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  typeChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  typeChipText: {
    fontSize: 12,
    color: '#71717a',
  },
  typeChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemGradient: {
    borderRadius: 16,
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  promptPreview: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  promptLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    color: '#ffffff',
    fontStyle: 'italic',
  },
  explanation: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectText: {
    fontSize: 11,
    color: '#71717a',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 12,
    color: '#a855f7',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#52525b',
    fontSize: 14,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSeverity: {
    borderRadius: 16,
    marginBottom: 20,
  },
  modalSeverityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  modalSeverityText: {
    flex: 1,
  },
  modalSeverityLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSeverityType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promptBox: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  promptBoxText: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  explanationBox: {
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.3)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  explanationText: {
    flex: 1,
    fontSize: 14,
    color: '#fca5a5',
    lineHeight: 20,
  },
  suggestionBox: {
    borderRadius: 12,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#86efac',
    lineHeight: 20,
  },
  modalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    marginBottom: 32,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#71717a',
  },
  metaLabel: {
    fontSize: 13,
    color: '#52525b',
  },
  metaValue: {
    fontSize: 13,
    color: '#a855f7',
    fontWeight: '500',
  },
});
