import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Platform, LayoutChangeEvent, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

interface ScrollingTextProps {
  text: string;
  style?: any;
  speed?: number; // pixels per second, default 40
}

/**
 * A text component that scrolls horizontally when content overflows.
 * - Web: CSS animation with marquee-container / marquee-track classes
 * - Native: react-native-reanimated translateX loop
 * - If text fits, renders as static single-line text
 */
export function ScrollingText({ text, style, speed = 40 }: ScrollingTextProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const shouldScroll = textWidth > containerWidth && containerWidth > 0;

  // --- Web refs for measuring ---
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const measuredRef = useCallback(
    (el: HTMLSpanElement | null) => {
      if (el) {
        measureRef.current = el;
        const w = el.scrollWidth || el.offsetWidth;
        if (w !== textWidth) setTextWidth(w);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  const containerCallback = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        containerRef.current = el;
        const w = el.clientWidth;
        if (w !== containerWidth) setContainerWidth(w);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text],
  );

  // --- Native reanimated scrolling ---
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (Platform.OS === 'web' || !shouldScroll) {
      translateX.value = 0;
      return;
    }

    const distance = textWidth + 40; // gap before looping
    const duration = (distance / speed) * 1000;

    // Delay 2s → slide left → snap back → repeat
    translateX.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(-distance, { duration, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
          withDelay(2000, withTiming(0, { duration: 0 })),
        ),
        -1, // infinite
      ),
    );
  }, [shouldScroll, textWidth, speed, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // =========== Web: pure CSS classes ===========
  if (Platform.OS === 'web') {
    const duration = shouldScroll ? Math.max(6, (textWidth / speed) * 2) : 0;

    return (
      <div
        ref={containerCallback}
        className="marquee-container"
        style={{ width: '100%' }}
      >
        {/* Hidden measurer */}
        <span
          ref={measuredRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontSize: style?.fontSize || 14,
            fontWeight: style?.fontWeight || 'normal',
          }}
        >
          {text}
        </span>

        <div
          className={`marquee-track ${shouldScroll ? 'scrolling' : ''}`}
          style={
            shouldScroll
              ? ({
                  '--marquee-duration': `${duration}s`,
                  '--container-width': `${containerWidth}px`,
                } as React.CSSProperties)
              : {}
          }
        >
          <Text style={style} numberOfLines={1}>
            {text}
          </Text>
        </div>
      </div>
    );
  }

  // =========== Native: reanimated ===========
  return (
    <View
      style={styles.nativeContainer}
      onLayout={(e: LayoutChangeEvent) =>
        setContainerWidth(e.nativeEvent.layout.width)
      }
    >
      {/* Hidden measurer */}
      <Text
        style={[style, styles.hiddenMeasurer]}
        onLayout={(e: LayoutChangeEvent) =>
          setTextWidth(e.nativeEvent.layout.width)
        }
        numberOfLines={1}
      >
        {text}
      </Text>

      {shouldScroll ? (
        <Animated.View style={[styles.scrollTrack, animatedStyle]}>
          <Text style={[style, styles.noShrink]} numberOfLines={1}>
            {text}
          </Text>
        </Animated.View>
      ) : (
        <Text style={style} numberOfLines={1}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    overflow: 'hidden',
  },
  hiddenMeasurer: {
    position: 'absolute',
    opacity: 0,
  },
  scrollTrack: {
    flexDirection: 'row',
  },
  noShrink: {
    flexShrink: 0,
  },
});
