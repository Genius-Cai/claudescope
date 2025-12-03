import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import Svg, {Defs, LinearGradient, Stop, Rect} from 'react-native-svg';

interface GradientBoxProps {
  children: React.ReactNode;
  colors: string[];
  style?: ViewStyle;
  start?: {x: number; y: number};
  end?: {x: number; y: number};
}

export function GradientBox({
  children,
  colors,
  style,
  start = {x: 0, y: 0},
  end = {x: 1, y: 1},
}: GradientBoxProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id="grad"
            x1={`${start.x * 100}%`}
            y1={`${start.y * 100}%`}
            x2={`${end.x * 100}%`}
            y2={`${end.y * 100}%`}>
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
      </Svg>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
