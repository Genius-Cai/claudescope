import React, {useEffect} from 'react';
import {View, Text, ScrollView, RefreshControl, StyleSheet, Dimensions} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Circle, Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import {Telescope, Activity, Zap, Server, Brain, FolderOpen} from 'lucide-react-native';
import {api} from '../services/api';
import {syncWidgetData} from '../services/widget';

const {width} = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// SVG Gradient Box Component
function GradientBox({
  children,
  colors,
  style,
}: {
  children: React.ReactNode;
  colors: string[];
  style?: any;
}) {
  return (
    <View style={[{overflow: 'hidden'}, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            {colors.map((color, i) => (
              <Stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#boxGrad)" />
      </Svg>
      {children}
    </View>
  );
}

export default function DashboardScreen() {
  const {data: stats, isLoading, refetch, isRefetching} = useQuery({
    queryKey: ['statistics'],
    queryFn: () => api.getStatisticsOverview(),
    retry: false,
  });

  const {data: health} = useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealthReport(),
    retry: false,
  });

  const score = health?.overall_score ?? 0;
  const grade = health?.grade ?? '-';

  // Sync data to iOS Widget when data changes
  useEffect(() => {
    if (stats || health) {
      syncWidgetData(stats, health);
    }
  }, [stats, health]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#a855f7"
          />
        }>
        {/* Header with Logo */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <View style={styles.logoContainer}>
            <GradientBox colors={['#7c3aed', '#a855f7']} style={styles.logoGradient}>
              <View style={styles.logoInner}>
                <Telescope color="#fff" size={24} />
              </View>
            </GradientBox>
            <View>
              <Text style={styles.title}>ClaudeScope</Text>
              <Text style={styles.subtitle}>Claude 使用分析平台</Text>
            </View>
          </View>
        </Animated.View>

        {/* Health Score Hero Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <GradientBox colors={['#1e1b4b', '#312e81', '#3730a3']} style={styles.heroCard}>
            {/* Decorative circles */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.heroContent}>
              <View style={styles.scoreSection}>
                <Text style={styles.heroLabel}>健康评分</Text>
                <CircularScore score={score} grade={grade} />
              </View>
              <View style={styles.heroStats}>
                <HeroStat
                  icon={<Zap color="#facc15" size={18} />}
                  label="总 Token"
                  value={stats?.tokens?.total_tokens ?? 0}
                />
                <HeroStat
                  icon={<Activity color="#4ade80" size={18} />}
                  label="会话数"
                  value={stats?.sessions_count ?? 0}
                />
              </View>
            </View>
          </GradientBox>
        </Animated.View>

        {/* Quick Stats Grid */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>使用概览</Text>
          </View>
          <View style={styles.tokenGrid}>
            <StatCard
              icon={<Zap color="#3b82f6" size={20} />}
              label="输入 Token"
              value={stats?.tokens?.input_tokens ?? 0}
              colors={['#1e3a8a', '#1d4ed8']}
            />
            <StatCard
              icon={<Zap color="#22c55e" size={20} />}
              label="输出 Token"
              value={stats?.tokens?.output_tokens ?? 0}
              colors={['#14532d', '#15803d']}
            />
            <StatCard
              icon={<Brain color="#a855f7" size={20} />}
              label="扩展思考"
              value={stats?.thinking?.total_triggers ?? 0}
              colors={['#581c87', '#7e22ce']}
            />
            <StatCard
              icon={<FolderOpen color="#f97316" size={20} />}
              label="活跃项目"
              value={stats?.projects_count ?? 0}
              colors={['#7c2d12', '#c2410c']}
            />
          </View>
        </Animated.View>

        {/* Server Status */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <View style={styles.serverCard}>
            <View style={styles.serverHeader}>
              <Server color="#71717a" size={20} />
              <Text style={styles.serverTitle}>服务器状态</Text>
            </View>
            <View style={styles.serverStatus}>
              <View style={[styles.statusDot, {backgroundColor: stats ? '#22c55e' : '#ef4444'}]} />
              <Text style={styles.serverText}>
                {stats ? '已连接' : '等待连接...'}
              </Text>
            </View>
            <Text style={styles.serverHint}>
              后端地址: http://192.168.50.217:8000
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Circular Score Component with Animation
function CircularScore({score, grade}: {score: number; grade: string}) {
  const size = 140;
  const strokeWidth = 10;
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

  const getGradeColor = () => {
    switch (grade) {
      case 'A': return '#4ade80';
      case 'B': return '#60a5fa';
      case 'C': return '#facc15';
      case 'D': return '#fb923c';
      default: return '#f87171';
    }
  };

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={size} style={{position: 'absolute'}}>
        <Defs>
          <LinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#7c3aed" />
            <Stop offset="50%" stopColor="#a855f7" />
            <Stop offset="100%" stopColor="#c084fc" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.scoreValue}>{score || '--'}</Text>
      <Text style={[styles.gradeValue, {color: getGradeColor()}]}>{grade}</Text>
    </View>
  );
}

function HeroStat({icon, label, value}: {icon: React.ReactNode; label: string; value: number}) {
  return (
    <View style={styles.heroStatItem}>
      <View style={styles.heroStatIcon}>{icon}</View>
      <Text style={styles.heroStatValue}>{value.toLocaleString()}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  colors: string[];
}) {
  return (
    <GradientBox colors={colors} style={styles.tokenCard}>
      <View style={styles.tokenContent}>
        <View style={styles.statCardHeader}>
          {icon}
          <Text style={styles.tokenLabel}>{label}</Text>
        </View>
        <Text style={styles.tokenValue}>{value.toLocaleString()}</Text>
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
  header: {
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginRight: 12,
  },
  logoInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreSection: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  heroStats: {
    flex: 1,
    marginLeft: 24,
  },
  heroStatItem: {
    marginBottom: 16,
  },
  heroStatIcon: {
    marginBottom: 4,
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tokenCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
  },
  tokenContent: {
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  tokenValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  serverCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  serverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  serverStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  serverText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  serverHint: {
    fontSize: 12,
    color: '#52525b',
  },
});
