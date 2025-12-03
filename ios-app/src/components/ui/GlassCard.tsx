import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'heavy';
}

export function GlassCard({
  children,
  style,
  intensity = 'medium',
}: GlassCardProps) {
  const opacityMap = {
    light: 0.05,
    medium: 0.1,
    heavy: 0.15,
  };

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: `rgba(255, 255, 255, ${opacityMap[intensity]})`},
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
