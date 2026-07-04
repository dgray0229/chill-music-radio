import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { usePlayerStore } from '@/src/store/usePlayerStore';
import { STATION_LIST, Station } from '@/src/stations/registry';

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const COLORS = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
  violet: '#9B7ED8',
  ember: '#FF6B6B',
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ---------------------------------------------------------------------------
// PulsingDot — animated LIVE indicator
// ---------------------------------------------------------------------------
function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
    );
  }, [opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={dotStyles.row}>
      <Animated.View
        style={[dotStyles.dot, { backgroundColor: color }, dotStyle]}
      />
      <Text style={[dotStyles.label, { color }]}>LIVE</Text>
    </View>
  );
}

const dotStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});

// ---------------------------------------------------------------------------
// StationTile — individual station card
// ---------------------------------------------------------------------------
function StationTile({
  stationData,
  isActive,
  isLive,
  onPress,
}: {
  stationData: Station;
  isActive: boolean;
  isLive: boolean;
  onPress: () => void;
}) {
  const imageSource =
    Platform.OS === 'web'
      ? { uri: stationData.coverUri }
      : stationData.cover;

  // Active glowing breathing border
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isActive) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.9, { duration: 1200 }),
          withTiming(0.4, { duration: 1200 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = 0.2;
    }
  }, [isActive]);

  const isWeb = Platform.OS === 'web';
  const borderAnimatedStyle = useAnimatedStyle(() => {
    const style: any = {
      borderColor: isActive
        ? `rgba(77, 166, 255, ${glowOpacity.value})`
        : 'rgba(77, 166, 255, 0.15)',
    };
    if (isWeb) {
      style.boxShadow = isActive
        ? `0 0 16px rgba(77, 166, 255, ${glowOpacity.value * 0.4})`
        : 'none';
    }
    return style;
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      {...({ className: Platform.OS === 'web' ? 'hover-item hover-glow' : undefined } as any)}
      style={({ pressed }) => [
        tileStyles.card,
        borderAnimatedStyle,
        {
          transform: [{ scale: pressed ? 0.96 : isActive ? 1.03 : 1 }],
          backgroundColor: isActive 
            ? 'rgba(77, 166, 255, 0.08)' 
            : Platform.OS === 'web' 
              ? 'rgba(6, 18, 34, 0.4)' 
              : 'rgba(6, 18, 34, 0.75)',
        },
        Platform.OS === 'web'
          ? ({
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              cursor: 'pointer',
            } as any)
          : {},
      ]}
    >
      {/* Background image */}
      <View style={tileStyles.imageContainer}>
        <Image
          source={imageSource}
          style={tileStyles.cardImage}
          resizeMode="cover"
        />
        {/* Shadow Overlay / Vignette */}
        <LinearGradient
          colors={['transparent', 'rgba(6, 18, 34, 0.95)']}
          style={tileStyles.gradientOverlay}
        />
      </View>

      {/* Card Content overlay */}
      <View style={tileStyles.cardContent}>
        {/* Active state icon overlay */}
        {isActive && (
          <View style={[tileStyles.statusIndicator, { backgroundColor: stationData.accent }]}>
            <FontAwesome name={isLive ? "volume-up" : "pause"} size={10} color="#fff" />
          </View>
        )}

        <View style={tileStyles.textWrap}>
          {/* Station name */}
          <Text numberOfLines={1} style={tileStyles.name}>
            {stationData.label}
          </Text>

          {/* Genre */}
          <Text numberOfLines={1} style={tileStyles.genre}>
            {stationData.genre}
          </Text>

          {/* Pulsing live dot */}
          {isLive && <PulsingDot color={stationData.accent} />}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const tileStyles = StyleSheet.create({
  card: {
    width: 150,
    height: 190,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '75%',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 14,
  },
  statusIndicator: {
    alignSelf: 'flex-end',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  textWrap: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  genre: {
    fontSize: 10,
    color: 'rgba(228, 235, 252, 0.6)',
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// ---------------------------------------------------------------------------
// StationCarousel — horizontal scrollable carousel
// ---------------------------------------------------------------------------
export function StationCarousel() {
  const station = usePlayerStore((s) => s.station);
  const tune = usePlayerStore((s) => s.tune);
  const playback = usePlayerStore((s) => s.playback);

  return (
    <View style={carouselStyles.wrapper}>
      {/* Section header */}
      <View style={carouselStyles.header}>
        <FontAwesome
          name="podcast"
          size={14}
          color="rgba(228,235,252,0.4)"
        />
        <Text style={carouselStyles.headerLabel}>Tune In</Text>
      </View>

      {/* Horizontal scroll with snapToInterval */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={162} // card width (150) + marginRight (12)
        decelerationRate="fast"
        contentContainerStyle={carouselStyles.scrollContent}
      >
        {STATION_LIST.map((s) => {
          const isActive = station?.id === s.id;
          const isLive = isActive && playback === 'playing';

          return (
            <StationTile
              key={s.id}
              stationData={s}
              isActive={isActive}
              isLive={isLive}
              onPress={() => tune(s.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerLabel: {
    color: 'rgba(228,235,252,0.4)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
