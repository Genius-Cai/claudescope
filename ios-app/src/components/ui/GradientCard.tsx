import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';

interface GradientCardProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  variant?: 'purple' | 'blue' | 'green' | 'orange' | 'dark';
}

const gradientPresets = {
  purple: ['#7c3aed', '#a855f7', '#c084fc'],
  blue: ['#2563eb', '#3b82f6', '#60a5fa'],
  green: ['#059669', '#10b981', '#34d399'],
  orange: ['#ea580c', '#f97316', '#fb923c'],
  dark: ['#18181b', '#27272a', '#3f3f46'],
};

export function GradientCard({
  children,
  colors,
  style,
  variant = 'purple',
}: GradientCardProps) {
  const gradientColors = colors || gradientPresets[variant];
  const gradientId = React.useId().replace(/:/g, '_');

  return (
    <View style={[styles.card, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientColors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
});
