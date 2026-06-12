import React, { useEffect } from 'react';
import { StyleSheet, DimensionValue, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 1000 }),
      -1, // infinite repetitions
      true // reverse on each iteration (shimmer back and forth)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(77, 166, 255, 0.2)',
  },
});
