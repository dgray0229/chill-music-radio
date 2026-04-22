import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Animated, Platform, LayoutChangeEvent } from 'react-native';

interface MarqueeTextProps {
  text: string;
  className?: string;
  style?: any;
  speed?: number; // pixels per second, default 40
}

/**
 * A text component that scrolls horizontally when content overflows.
 * - Web: CSS animation with smooth infinite loop  
 * - Native: Animated.View translateX loop
 * - If text fits, renders as static single-line text
 */
export function MarqueeText({ text, className = '', style, speed = 40 }: MarqueeTextProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const shouldScroll = textWidth > containerWidth && containerWidth > 0;
  const animValue = useRef(new Animated.Value(0)).current;
  const measureRef = useRef<HTMLSpanElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Web: measure text width via ref
  const measuredRef = useCallback((el: HTMLSpanElement | null) => {
    if (el) {
      measureRef.current = el;
      const w = el.scrollWidth || el.offsetWidth;
      if (w !== textWidth) setTextWidth(w);
    }
  }, [text]);

  const containerCallback = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      containerRef.current = el;
      const w = el.clientWidth;
      if (w !== containerWidth) setContainerWidth(w);
    }
  }, [text]);

  // Native animation
  useEffect(() => {
    if (Platform.OS === 'web' || !shouldScroll) return;

    const distance = textWidth + 40;
    const duration = (distance / speed) * 1000;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(animValue, {
          toValue: -distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shouldScroll, textWidth, speed, animValue]);

  // Web: use pure CSS classes
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
          style={shouldScroll ? {
            '--marquee-duration': `${duration}s`,
            '--container-width': `${containerWidth}px`,
          } as React.CSSProperties : {}}
        >
          <Text className={className} style={style} numberOfLines={1}>
            {text}
          </Text>
        </div>
      </div>
    );
  }

  // Native: use Animated
  return (
    <View style={{ overflow: 'hidden' }} onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}>
      {/* Hidden measurer */}
      <Text
        style={[style, { position: 'absolute', opacity: 0 }]}
        onLayout={(e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width)}
        numberOfLines={1}
      >
        {text}
      </Text>

      {shouldScroll ? (
        <Animated.View style={{ transform: [{ translateX: animValue }], flexDirection: 'row' }}>
          <Text className={className} style={[style, { flexShrink: 0 }]} numberOfLines={1}>
            {text}
          </Text>
        </Animated.View>
      ) : (
        <Text className={className} style={style} numberOfLines={1}>
          {text}
        </Text>
      )}
    </View>
  );
}
