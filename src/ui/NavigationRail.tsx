import React, { useState } from 'react';
import { View, Text, Pressable, Platform, ScrollView, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';
import { usePlayerStore } from '@/src/store/usePlayerStore';
import { STATION_LIST } from '@/src/stations/registry';
import { useAppInstall } from '@/src/hooks/useAppInstall';

// --- Palette ---
const INK = '#0B1A2E';
const MIDNIGHT = '#061222';
const SLATE = '#142D4F';
const ELECTRIC = '#4DA6FF';
const MIST = '#D8E4F8';
const VIOLET = '#9B7ED8';
const EMBER = '#FF6B6B';

// --- Route definitions ---

interface NavEntry {
  name: string;
  path: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}

const NAV_ITEMS: NavEntry[] = [
  { name: 'Radio', path: '/', icon: 'play-circle' },
  { name: 'Stations', path: '/stations', icon: 'list-ul' },
  { name: 'Schedule', path: '/schedule', icon: 'calendar' },
  { name: 'Favorites', path: '/favorites', icon: 'heart' },
  { name: 'About Us', path: '/about', icon: 'info-circle' },
  { name: 'Submit Music', path: '/radio-play', icon: 'music' },
];

const LEGAL_ITEMS: NavEntry[] = [
  { name: 'Contact', path: '/contact', icon: 'envelope' },
  { name: 'Terms & Conditions', path: '/terms', icon: 'file-text-o' },
  { name: 'Privacy Policy', path: '/privacy', icon: 'shield' },
];

// --- Equalizer Animation for Active Station ---
function AnimatedEqualizer({ accent }: { accent: string }) {
  const playback = usePlayerStore((s) => s.playback);
  const isPlaying = playback === 'playing';

  const h1 = useSharedValue(4);
  const h2 = useSharedValue(8);
  const h3 = useSharedValue(6);

  React.useEffect(() => {
    if (isPlaying) {
      h1.value = withRepeat(withSequence(withTiming(12, { duration: 450 }), withTiming(4, { duration: 450 })), -1, true);
      h2.value = withRepeat(withSequence(withTiming(4, { duration: 350 }), withTiming(12, { duration: 350 })), -1, true);
      h3.value = withRepeat(withSequence(withTiming(12, { duration: 550 }), withTiming(6, { duration: 550 })), -1, true);
    } else {
      h1.value = withTiming(4);
      h2.value = withTiming(4);
      h3.value = withTiming(4);
    }
  }, [isPlaying]);

  const style1 = useAnimatedStyle(() => ({ height: h1.value }));
  const style2 = useAnimatedStyle(() => ({ height: h2.value }));
  const style3 = useAnimatedStyle(() => ({ height: h3.value }));

  return (
    <View style={eqStyles.container}>
      <Animated.View style={[eqStyles.bar, style1, { backgroundColor: accent }]} />
      <Animated.View style={[eqStyles.bar, style2, { backgroundColor: accent }]} />
      <Animated.View style={[eqStyles.bar, style3, { backgroundColor: accent }]} />
    </View>
  );
}

const eqStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 14,
    height: 12,
    gap: 2.5,
    marginLeft: 6,
  },
  bar: {
    width: 2.5,
    borderRadius: 1,
  },
});

// --- Component ---

export function NavigationRail() {
  const router = useRouter();
  const pathname = usePathname();
  const station = usePlayerStore((s) => s.station);
  const tune = usePlayerStore((s) => s.tune);
  const { visible, canPrompt, iosSafari, triggerInstall, installed } = useAppInstall();
  const [showIOSTip, setShowIOSTip] = useState(false);

  const handleInstallPress = async () => {
    if (canPrompt) {
      await triggerInstall();
    } else if (iosSafari) {
      setShowIOSTip((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable top section */}
      <ScrollView style={styles.topScroll} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={styles.logo}>
          <FontAwesome name="headphones" size={28} color={ELECTRIC} />
          <Text style={styles.brandText}>Chill Radio</Text>
        </View>

        {/* Main nav */}
        <View style={styles.navGroup}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Pressable
                key={item.name}
                onPress={() => router.push(item.path as any)}
                {...({ className: Platform.OS === 'web' ? 'hover-item' : undefined } as any)}
                style={({ pressed }) => [
                  styles.navItem, 
                  isActive && styles.navItemActive,
                  pressed && { opacity: 0.85 },
                  Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
                ]}
              >
                <FontAwesome
                  name={item.icon}
                  size={18}
                  color={isActive ? ELECTRIC : `${MIST}99`}
                />
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Legal section */}
        <View style={styles.navGroup}>
          {LEGAL_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Pressable
                key={item.name}
                onPress={() => router.push(item.path as any)}
                {...({ className: Platform.OS === 'web' ? 'hover-item' : undefined } as any)}
                style={({ pressed }) => [
                  styles.legalItem, 
                  isActive && styles.navItemActive,
                  pressed && { opacity: 0.85 },
                  Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
                ]}
              >
                <FontAwesome
                  name={item.icon}
                  size={14}
                  color={isActive ? ELECTRIC : `${MIST}59`}
                />
                <Text style={[styles.legalLabel, isActive && styles.legalLabelActive]}>
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stations */}
        <View style={styles.stationsSection}>
          <Text style={styles.stationsHeader}>TUNE IN</Text>

          {STATION_LIST.map((s) => {
            const isActive = station.id === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => tune(s.id)}
                {...({ className: Platform.OS === 'web' ? 'hover-item' : undefined } as any)}
                style={({ pressed }) => [
                  styles.stationRow, 
                  isActive && styles.stationRowActive,
                  pressed && { opacity: 0.85 },
                  Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
                ]}
              >
                <View
                  style={[
                    styles.stationDot,
                    { backgroundColor: isActive ? s.accent : `${MIST}33` },
                  ]}
                />
                <View style={styles.stationInfo}>
                  <Text style={[styles.stationLabel, isActive && styles.stationLabelActive]}>
                    {s.label}
                  </Text>
                  <Text style={styles.stationGenre}>{s.genre}</Text>
                </View>
                {isActive && (
                  <AnimatedEqualizer accent={s.accent} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Install app button */}
        {visible && (
          <View style={styles.installWrapper}>
            <Pressable
              onPress={handleInstallPress}
              {...({ className: Platform.OS === 'web' ? 'hover-glow' : undefined } as any)}
              style={({ pressed }) => [
                styles.installButton,
                pressed && { opacity: 0.85 },
                Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
              ]}
            >
              <FontAwesome name="download" size={18} color={ELECTRIC} />
              <Text style={styles.installText}>Install App</Text>
            </Pressable>

            {/* iOS Safari tooltip */}
            {showIOSTip && iosSafari && (
              <View style={styles.iosTip}>
                <Text style={styles.iosTipText}>
                  Tap the{' '}
                  <Ionicons name="share-outline" size={13} color="#fff" />{' '}
                  button in Safari, then tap{' '}
                  <Text style={styles.iosTipBold}>"Add to Home Screen"</Text>.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Installed badge */}
        {installed && Platform.OS === 'web' && (
          <View style={styles.installedBadge}>
            <FontAwesome name="check-circle" size={14} color={`${ELECTRIC}80`} />
            <Text style={styles.installedText}>App installed</Text>
          </View>
        )}

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>© 2026 Chill Radio</Text>
        </View>
      </View>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    width: 256,
    backgroundColor: Platform.OS === 'web' ? 'rgba(6, 18, 34, 0.45)' : 'rgba(6, 18, 34, 0.95)',
    height: '100%',
    paddingTop: 32,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: 'rgba(77,166,255,0.12)',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        // @ts-ignore
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      },
      default: {},
    }),
  },
  topScroll: {
    flex: 1,
  },

  // Logo
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 40,
  },
  brandText: {
    fontFamily: 'Pacifico',
    fontSize: 26,
    color: '#fff',
    marginLeft: 12,
    textShadowColor: 'rgba(77, 166, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Nav items
  navGroup: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(77,166,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(77,166,255,0.25)',
  },
  navLabel: {
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '600',
    color: `${MIST}99`,
  },
  navLabelActive: {
    color: ELECTRIC,
  },

  // Legal items
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  legalLabel: {
    marginLeft: 16,
    fontSize: 13,
    color: `${MIST}66`,
  },
  legalLabelActive: {
    color: ELECTRIC,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(77,166,255,0.12)',
    marginHorizontal: 16,
    marginVertical: 16,
  },

  // Stations
  stationsSection: {
    paddingHorizontal: 8,
  },
  stationsHeader: {
    fontSize: 11,
    color: `${MIST}4D`,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  stationRowActive: {
    backgroundColor: 'rgba(77,166,255,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(77,166,255,0.25)',
  },
  stationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  stationInfo: {
    flex: 1,
  },
  stationLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: `${MIST}99`,
  },
  stationLabelActive: {
    color: '#fff',
  },
  stationGenre: {
    fontSize: 11,
    color: `${MIST}4D`,
    marginTop: 1,
  },

  // Bottom section
  bottom: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  installWrapper: {
    marginBottom: 16,
  },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(77,166,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(77,166,255,0.25)',
  },
  installText: {
    marginLeft: 12,
    fontWeight: '600',
    color: ELECTRIC,
    fontSize: 14,
  },
  iosTip: {
    marginTop: 8,
    padding: 12,
    backgroundColor: SLATE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${ELECTRIC}33`,
  },
  iosTipText: {
    color: `${MIST}CC`,
    fontSize: 12,
    lineHeight: 20,
  },
  iosTipBold: {
    fontWeight: '700',
    color: '#fff',
  },
  installedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  installedText: {
    marginLeft: 8,
    fontSize: 12,
    color: `${ELECTRIC}80`,
  },
  copyright: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,166,255,0.1)',
    paddingTop: 12,
  },
  copyrightText: {
    fontSize: 12,
    color: `${ELECTRIC}4D`,
    lineHeight: 18,
  },
});
