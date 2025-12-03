import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useQuery} from '@tanstack/react-query';
import Svg, {Circle, Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {Heart, TrendingUp, AlertCircle, CheckCircle, Lightbulb} from 'lucide-react-native';
import {api} from '../services/api';

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

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HealthScreen() {
  const {data: health, isLoading} = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealthReport(),
    retry: false,
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#4ade80';
      case 'B': return '#60a5fa';
      case 'C': return '#facc15';
      case 'D': return '#fb923c';
      default: return '#f87171';
    }
  };

  const getGradeGradient = (grade: string): string[] => {
    switch (grade) {
      case 'A': return ['#14532d', '#15803d', '#22c55e'];
      case 'B': return ['#1e3a8a', '#1d4ed8', '#3b82f6'];
      case 'C': return ['#713f12', '#a16207', '#ca8a04'];
      case 'D': return ['#7c2d12', '#c2410c', '#ea580c'];
      default: return ['#7f1d1d', '#b91c1c', '#dc2626'];
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>健康报告</Text>
          <Text style={styles.subtitle}>Claude 使用质量分析</Text>
        </Animated.View>

        {/* Overall Score Hero */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <GradientBox
            colors={getGradeGradient(health?.grade ?? '')}
            style={styles.heroCard}
            gradientId="health-hero">
            <View style={styles.heroContent}>
              <View style={styles.scoreSection}>
                <Text style={styles.heroLabel}>总体评分</Text>
                <ScoreRing score={health?.overall_score ?? 0} />
              </View>
              <View style={styles.gradeSection}>
                <Text style={styles.gradeLabel}>等级</Text>
                <View style={styles.gradeBadge}>
                  <Text style={[styles.gradeText, {color: getGradeColor(health?.grade ?? '')}]}>
                    {health?.grade ?? '-'}
                  </Text>
                </View>
                <Text style={styles.gradeDesc}>
                  {health?.grade === 'A' ? '优秀' :
                   health?.grade === 'B' ? '良好' :
                   health?.grade === 'C' ? '一般' :
                   health?.grade === 'D' ? '需改进' : '待评估'}
                </Text>
              </View>
            </View>
          </GradientBox>
        </Animated.View>

        {/* Dimensions */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.sectionHeader}>
            <TrendingUp color="#a855f7" size={20} />
            <Text style={styles.sectionTitle}>评估维度</Text>
          </View>
          {health?.dimensions?.map((dim, index) => (
            <DimensionCard key={index} dimension={dim} delay={index * 50} index={index} />
          ))}
        </Animated.View>

        {/* Improvement Suggestions */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <View style={styles.sectionHeader}>
            <Lightbulb color="#facc15" size={20} />
            <Text style={styles.sectionTitle}>改进建议</Text>
          </View>
          {health?.improvement_suggestions?.map((suggestion, index) => (
            <SuggestionCard key={index} suggestion={suggestion} index={index} />
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScoreRing({score}: {score: number}) {
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(score, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (circumference * progress.value) / 100,
  }));

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={size} style={{position: 'absolute'}}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ffffff"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.scoreValue}>{score || '--'}</Text>
    </View>
  );
}

function DimensionCard({dimension, delay, index}: {dimension: any; delay: number; index: number}) {
  return (
    <Animated.View entering={FadeInDown.delay(300 + delay).duration(400)}>
      <View style={styles.dimensionCard}>
        <View style={styles.dimensionHeader}>
          <Text style={styles.dimensionName}>{dimension.name}</Text>
          <Text style={styles.dimensionScore}>{dimension.score}</Text>
        </View>
        <View style={styles.progressBg}>
          <GradientBox
            colors={['#7c3aed', '#a855f7']}
            horizontal
            style={[styles.progressBar, {width: `${dimension.score}%`}]}
            gradientId={`health-dim-${index}`}
          />
        </View>
        <Text style={styles.dimensionDetails}>{dimension.details}</Text>
      </View>
    </Animated.View>
  );
}

function SuggestionCard({suggestion, index}: {suggestion: any; index: number}) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          colors: ['#7f1d1d', '#991b1b'],
          icon: <AlertCircle color="#fca5a5" size={18} />,
          label: '高优先级',
          labelColor: '#fca5a5',
        };
      case 'medium':
        return {
          colors: ['#713f12', '#854d0e'],
          icon: <AlertCircle color="#fde047" size={18} />,
          label: '中优先级',
          labelColor: '#fde047',
        };
      default:
        return {
          colors: ['#14532d', '#166534'],
          icon: <CheckCircle color="#86efac" size={18} />,
          label: '低优先级',
          labelColor: '#86efac',
        };
    }
  };

  const config = getPriorityConfig(suggestion.priority);

  return (
    <GradientBox
      colors={config.colors}
      horizontal
      style={styles.suggestionCard}
      gradientId={`health-sug-${index}`}>
      <View style={styles.suggestionContent}>
        <View style={styles.suggestionHeader}>
          {config.icon}
          <Text style={[styles.priorityLabel, {color: config.labelColor}]}>
            {config.label}
          </Text>
          <Text style={styles.categoryLabel}>{suggestion.category}</Text>
        </View>
        <Text style={styles.suggestionText}>{suggestion.suggestion}</Text>
        <Text style={styles.impactText}>影响: {suggestion.impact}</Text>
      </View>
    </GradientBox>
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
    paddingBottom: 100,
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
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    marginBottom: 24,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 24,
  },
  scoreSection: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  gradeSection: {
    alignItems: 'center',
  },
  gradeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  gradeBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 32,
    fontWeight: '800',
  },
  gradeDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  dimensionCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dimensionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dimensionScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#a855f7',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#27272a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  dimensionDetails: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 12,
    lineHeight: 18,
  },
  suggestionCard: {
    borderRadius: 16,
    marginBottom: 12,
  },
  suggestionContent: {
    padding: 16,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 'auto',
  },
  suggestionText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
