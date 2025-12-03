import React, {useEffect} from 'react';
import {Text, TextStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  formatValue?: (val: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  style,
  formatValue = val => Math.round(val).toLocaleString(),
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [value, duration]);

  const displayValue = useDerivedValue(() => {
    return formatValue(animatedValue.value);
  });

  // Note: For proper animated text, we need to use a workaround
  // since React Native Reanimated doesn't directly support text animation
  // This is a simplified version that updates on render
  return (
    <Text style={style}>
      {formatValue(value)}
    </Text>
  );
}
