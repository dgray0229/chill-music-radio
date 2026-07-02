import React, { useEffect } from 'react';
import { View, Text, Pressable, Platform, Image, useWindowDimensions, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { usePostHog } from 'posthog-react-native';

// --- Palette ---
const INK = '#0B1A2E';
const MIDNIGHT = '#061222';
const SLATE = '#142D4F';
const ELECTRIC = '#4DA6FF';
const MIST = '#D8E4F8';
const VIOLET = '#9B7ED8';
const EMBER = '#FF6B6B';

// --- Background images ---
const desktopBg = require('@/assets/images/chill-radio-bg-desktop.jpg');
const mobileBg = require('@/assets/images/chill-radio-bg-mobile.jpg');

// --- Props ---
interface WelcomeOverlayProps {
  onDismiss: () => void;
}

// --- Component ---

export function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const posthog = usePostHog();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  // Shared values
  const containerOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Dismiss handler — fades out then calls onDismiss on JS thread
  const handleDismiss = (trigger: 'button' | 'auto' = 'button') => {
    posthog.capture('welcome_dismissed', { trigger });
    contentTranslateY.value = withTiming(10, { duration: 400, easing: Easing.in(Easing.ease) });
    containerOpacity.value = withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)();
      }
    });
  };

  useEffect(() => {
    // Fade in + slide up
    containerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    contentTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) });

    // Auto-dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss('auto');
    }, 4000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Background image */}
      <Image
        source={isDesktop ? desktopBg : mobileBg}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <FontAwesome name="headphones" size={isDesktop ? 48 : 40} color={ELECTRIC} />
          <Text style={[styles.brandText, { fontSize: isDesktop ? 52 : 40 }]}>
            Chill Radio
          </Text>
        </View>

        {/* Tagline */}
        <Text style={[styles.tagline, { fontSize: isDesktop ? 22 : 18, lineHeight: isDesktop ? 32 : 28 }]}>
          Your soundtrack for focus &amp; flow
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          24/7 curated radio, no commercials
        </Text>

        {/* Start Listening button */}
        <Pressable
          onPress={() => handleDismiss('button')}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
            Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined,
          ]}
        >
          <FontAwesome name="play" size={18} color="#fff" style={styles.playIcon} />
          <Text style={styles.startButtonText}>Start Listening</Text>
        </Pressable>

        {/* Bottom copyright */}
        <Text style={styles.copyrightText}>© 2026 Chill Radio</Text>
      </Animated.View>
    </Animated.View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: INK,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(6,18,34,0.6)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandText: {
    fontFamily: 'Pacifico',
    color: '#fff',
    marginLeft: 16,
  },
  tagline: {
    color: `${MIST}B3`,
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: 500,
  },
  subtitle: {
    color: `${MIST}66`,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 48,
  },
  startButton: {
    backgroundColor: ELECTRIC,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonPressed: {
    opacity: 0.85,
  },
  playIcon: {
    marginRight: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  copyrightText: {
    position: 'absolute',
    bottom: 40,
    color: `${MIST}40`,
    fontSize: 12,
    textAlign: 'center',
  },
});
