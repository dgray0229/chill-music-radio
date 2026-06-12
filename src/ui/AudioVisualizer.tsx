import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { usePlayerStore } from '@/src/store/usePlayerStore';

interface AudioVisualizerProps {
  accentColor: string;
}

const BAR_COUNT = 16;

function VisualizerBar({ 
  index, 
  isPlaying, 
  color 
}: { 
  index: number; 
  isPlaying: boolean; 
  color: string; 
}) {
  const height = useSharedValue(6);

  useEffect(() => {
    if (isPlaying) {
      // Create random height animations for organic sound wave feel
      const duration = 250 + Math.random() * 300;
      const targetHeight = 15 + Math.random() * 45;
      
      height.value = withDelay(
        index * 20,
        withRepeat(
          withSequence(
            withTiming(targetHeight, { duration }),
            withTiming(6, { duration })
          ),
          -1,
          true
        )
      );
    } else {
      height.value = withTiming(6, { duration: 400 });
    }
  }, [isPlaying, index]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return (
    <Animated.View 
      style={[
        styles.bar, 
        { backgroundColor: color }, 
        animatedStyle,
        Platform.OS === 'web' ? {
          boxShadow: `0 0 10px ${color}50`,
        } as any : {}
      ]} 
    />
  );
}

export function AudioVisualizer({ accentColor }: AudioVisualizerProps) {
  const playback = usePlayerStore((s) => s.playback);
  const isPlaying = playback === 'playing';

  return (
    <View style={styles.container}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <VisualizerBar 
          key={i} 
          index={i} 
          isPlaying={isPlaying} 
          color={accentColor} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: '100%',
    gap: 4,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    minHeight: 6,
  },
});
