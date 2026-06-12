import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { usePlayerStore } from '@/src/store/usePlayerStore';

// Palette
const INK = '#0B1A2E';
const MIDNIGHT = '#061222';
const ELECTRIC = '#4DA6FF';
const MIST = '#D8E4F8';

export function KeyboardShortcutOverlay() {
  const showShortcutOverlay = usePlayerStore(state => state.showShortcutOverlay);
  const setShowShortcutOverlay = usePlayerStore(state => state.setShowShortcutOverlay);
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
    if (showShortcutOverlay) {
      containerOpacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      contentScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
    } else {
      containerOpacity.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) });
      contentScale.value = withTiming(0.95, { duration: 200, easing: Easing.in(Easing.ease) });
    }
  }, [showShortcutOverlay]);

  if (Platform.OS !== 'web' || !showShortcutOverlay) return null;

  return (
    <Animated.View style={[styles.backdrop, containerAnimatedStyle]}>
      <Pressable style={styles.dismissBackdrop} onPress={() => setShowShortcutOverlay(false)} />
      <Animated.View style={[styles.modalContent, contentAnimatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>Keyboard Shortcuts</Text>
          <Pressable
            onPress={() => setShowShortcutOverlay(false)}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
              { cursor: 'pointer' } as any
            ]}
          >
            <FontAwesome name="close" size={20} color={MIST} />
          </Pressable>
        </View>

        <View style={styles.grid}>
          <View style={styles.row}>
            <View style={styles.keyContainer}><Text style={styles.keyText}>Space</Text></View>
            <Text style={styles.description}>Play / Pause</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.keyContainer}><Text style={styles.keyText}>←</Text></View>
            <View style={styles.keyContainer}><Text style={styles.keyText}>→</Text></View>
            <Text style={styles.description}>Previous / Next Station</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.keyContainer}><Text style={styles.keyText}>↑</Text></View>
            <View style={styles.keyContainer}><Text style={styles.keyText}>↓</Text></View>
            <Text style={styles.description}>Volume Up / Down</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.keyContainer}><Text style={styles.keyText}>F</Text></View>
            <Text style={styles.description}>Toggle Favorite</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.keyContainer}><Text style={styles.keyText}>M</Text></View>
            <Text style={styles.description}>Mute / Unmute</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.keyContainer}><Text style={styles.keyText}>?</Text></View>
            <Text style={styles.description}>Toggle Shortcuts Overlay</Text>
          </View>
        </View>
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
    width: 480,
    backgroundColor: 'rgba(11, 26, 46, 0.75)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.2)',
    padding: 32,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
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
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyContainer: {
    backgroundColor: 'rgba(77, 166, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    minWidth: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  keyText: {
    color: ELECTRIC,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
  },
  description: {
    color: MIST,
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '500',
  },
});
