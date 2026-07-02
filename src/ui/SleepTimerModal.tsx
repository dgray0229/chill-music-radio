import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePostHog } from 'posthog-react-native';
import { useSleepTimer } from '@/src/hooks/useSleepTimer';

// Palette
const ELECTRIC = '#4DA6FF';
const MIST = '#D8E4F8';

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function SleepTimerModal() {
  const isOpen = useSleepTimer(state => state.isOpen);
  const setOpen = useSleepTimer(state => state.setOpen);
  const remainingMs = useSleepTimer(state => state.remainingMs);
  const isActive = useSleepTimer(state => state.isActive);
  const startTimer = useSleepTimer(state => state.start);
  const cancelTimer = useSleepTimer(state => state.cancel);

  const posthog = usePostHog();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const containerOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.95);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }));

  useEffect(() => {
    if (isOpen) {
      containerOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      contentScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
    } else {
      containerOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
      contentScale.value = withTiming(0.95, { duration: 200, easing: Easing.in(Easing.ease) });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presets = [
    { label: '15 Min', ms: 15 * 60 * 1000 },
    { label: '30 Min', ms: 30 * 60 * 1000 },
    { label: '1 Hour', ms: 60 * 60 * 1000 },
    { label: '2 Hours', ms: 120 * 60 * 1000 },
  ];

  return (
    <Animated.View style={[styles.backdrop, containerOpacity.value === 0 ? null : containerAnimatedStyle]}>
      <Pressable style={styles.dismissBackdrop} onPress={() => setOpen(false)} />
      <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <FontAwesome name="moon-o" size={22} color={ELECTRIC} style={styles.moonIcon} />
            <Text style={styles.title}>Sleep Timer</Text>
          </View>
          <Pressable
            onPress={() => setOpen(false)}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
              Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined
            ]}
          >
            <FontAwesome name="close" size={20} color={MIST} />
          </Pressable>
        </View>

        {isActive && remainingMs !== null ? (
          <View style={styles.activeContainer}>
            <Text style={styles.countdown}>{formatTime(remainingMs)}</Text>
            <Text style={styles.activeSubText}>until music pauses</Text>

            <Pressable
              onPress={() => {
                posthog.capture('sleep_timer_cancelled', {
                  remaining_ms: remainingMs,
                });
                cancelTimer();
              }}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
                Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancel Timer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.presetsContainer}>
            <Text style={styles.subTitle}>Select a duration</Text>
            <View style={styles.grid}>
              {presets.map((preset) => (
                <Pressable
                  key={preset.label}
                  onPress={() => {
                    posthog.capture('sleep_timer_started', {
                      duration_label: preset.label,
                      duration_ms: preset.ms,
                    });
                    startTimer(preset.ms);
                  }}
                  style={({ pressed }) => [
                    styles.presetCard,
                    pressed && styles.presetCardPressed,
                    Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined
                  ]}
                >
                  <Text style={styles.presetLabel}>{preset.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    backgroundColor: 'rgba(6,18,34,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: 380,
    maxWidth: '90%',
    backgroundColor: 'rgba(11, 26, 46, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.2)',
    padding: 28,
    shadowColor: '#4DA6FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    backdropFilter: 'blur(20px) saturate(160%)',
  } as any,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moonIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'System',
  },
  subTitle: {
    fontSize: 14,
    color: `${MIST}80`,
    marginBottom: 16,
    fontWeight: '500',
    fontFamily: 'System',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(216, 228, 248, 0.08)',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  presetsContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(77, 166, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetCardPressed: {
    backgroundColor: 'rgba(77, 166, 255, 0.15)',
    borderColor: 'rgba(77, 166, 255, 0.4)',
  },
  presetLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  activeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  countdown: {
    fontSize: 48,
    fontWeight: '800',
    color: ELECTRIC,
    fontFamily: 'System',
    marginBottom: 6,
    letterSpacing: 2,
  },
  activeSubText: {
    fontSize: 14,
    color: `${MIST}B3`,
    marginBottom: 28,
    fontFamily: 'System',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelButtonPressed: {
    backgroundColor: 'rgba(255, 107, 107, 0.25)',
  },
  cancelButtonText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
