import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Platform, Share, Clipboard } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { usePlayerStore } from '@/src/store/usePlayerStore';
import { useFavoritesStore } from '@/src/store/useFavoritesStore';
import { useSleepTimer } from '@/src/hooks/useSleepTimer';
import { ScrollingText } from './ScrollingText';

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

// Animated Components
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ---------------------------------------------------------------------------
// TrackMeta — artwork + title / artist + station badge + favourite button
// ---------------------------------------------------------------------------
function TrackMeta() {
  const track = usePlayerStore((s) => s.track);
  const station = usePlayerStore((s) => s.station);
  const coverArt = usePlayerStore((s) => s.coverArt);

  const isSaved = useFavoritesStore((s) =>
    track ? s.isSaved(track.title) : false,
  );
  const toggle = useFavoritesStore((s) => s.toggle);

  const scale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const [showCopied, setShowCopied] = useState(false);
  const toastOpacity = useSharedValue(0);

  useEffect(() => {
    if (showCopied) {
      toastOpacity.value = withTiming(1, { duration: 150 });
      const timer = setTimeout(() => {
        toastOpacity.value = withTiming(0, { duration: 250 }, (finished) => {
          if (finished) {
            runOnJS(setShowCopied)(false);
          }
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  if (!track) return null;

  const artwork = coverArt || track.artworkUri;

  const handleFavToggle = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    toggle({
      title: track.title,
      artist: track.artist,
      artwork: artwork ?? undefined,
      streamUrl: track.streamEndpoint ?? undefined,
    });
  };

  const handleShare = async () => {
    shareScale.value = withSequence(
      withTiming(1.25, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    const shareMessage = `🎵 Listening to "${track.title}" by ${track.artist} on Chill Radio`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Chill Radio',
            text: shareMessage,
          });
        } catch (err) {
          // cancelled or unsupported
        }
      } else {
        try {
          await navigator.clipboard.writeText(shareMessage);
          setShowCopied(true);
        } catch (err) {
          console.warn('[Share] Failed to copy:', err);
        }
      }
    } else {
      try {
        await Share.share({
          message: shareMessage,
        });
      } catch (err) {
        console.warn('[Share] Failed to share native:', err);
      }
    }
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  return (
    <View style={metaStyles.container}>
      <Image source={{ uri: artwork }} style={metaStyles.artwork} />

      <View style={metaStyles.info}>
        <ScrollingText
          text={track.title}
          style={metaStyles.title}
        />
        <View style={metaStyles.artistWrap}>
          <ScrollingText
            text={track.artist}
            style={metaStyles.artist}
            speed={30}
          />
        </View>

        {station && (
          <View style={metaStyles.badgeRow}>
            <View
              style={[
                metaStyles.badgeDot,
                { backgroundColor: station.accent },
              ]}
            />
            <Text style={metaStyles.badgeLabel}>{station.label}</Text>
          </View>
        )}
      </View>

      <View style={metaStyles.actionRow}>
        <View style={{ position: 'relative' }}>
          {showCopied && (
            <Animated.View style={[metaStyles.toast, toastAnimatedStyle]}>
              <Text style={metaStyles.toastText}>Copied!</Text>
            </Animated.View>
          )}
          <AnimatedPressable
            onPress={handleShare}
            style={[metaStyles.actionBtn, shareAnimatedStyle, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
          >
            <FontAwesome name="share" size={17} color="rgba(228,235,252,0.5)" />
          </AnimatedPressable>
        </View>

        <AnimatedPressable 
          onPress={handleFavToggle} 
          style={[metaStyles.actionBtn, heartAnimatedStyle, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
        >
          <FontAwesome
            name={isSaved ? 'heart' : 'heart-o'}
            size={18}
            color={isSaved ? COLORS.ember : 'rgba(228,235,252,0.5)'}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '33%' as any,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(77,166,255,0.25)',
  },
  info: {
    flex: 1,
    overflow: 'hidden',
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  artistWrap: {
    marginTop: 4,
  },
  artist: {
    color: 'rgba(228,235,252,0.6)',
    fontSize: 12,
  },
  badgeRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeLabel: {
    color: 'rgba(228,235,252,0.35)',
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    padding: 8,
  },
  toast: {
    position: 'absolute',
    bottom: 34,
    left: -20,
    backgroundColor: COLORS.electric,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  toastText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

// ---------------------------------------------------------------------------
// TransportControls — prev / play-pause / next + progress bar
// ---------------------------------------------------------------------------
function TransportControls() {
  const playback = usePlayerStore((s) => s.playback);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const isPlaying = playback === 'playing';

  const [elapsed, setElapsed] = useState(0);

  // Track elapsed time since stream playback started
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Reanimated play button pulse
  const scale = useSharedValue(1);
  const buttonBgOpacity = useSharedValue(0.1);

  useEffect(() => {
    if (isPlaying) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 900, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
      buttonBgOpacity.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 900 }),
          withTiming(0.1, { duration: 900 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
      buttonBgOpacity.value = withTiming(0.1, { duration: 300 });
    }
  }, [isPlaying]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: isPlaying ? buttonBgOpacity.value : 0,
    transform: [{ scale: scale.value * 1.35 }],
  }));

  return (
    <View style={transportStyles.container}>
      <View style={transportStyles.row}>
        <Pressable 
          style={[transportStyles.btn, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
        >
          <FontAwesome
            name="step-backward"
            size={18}
            color="rgba(228,235,252,0.35)"
          />
        </Pressable>

        <View style={transportStyles.playContainer}>
          {/* Animated glow ring behind the play button */}
          <Animated.View style={[transportStyles.glowRing, ringStyle]} />
          
          <AnimatedPressable 
            onPress={togglePlay} 
            style={[
              transportStyles.playBtn, 
              pulseStyle,
              Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
            ]}
          >
            <FontAwesome
              name={isPlaying ? 'pause' : 'play'}
              size={18}
              color={COLORS.ink}
              style={isPlaying ? undefined : { marginLeft: 2 }}
            />
          </AnimatedPressable>
        </View>

        <Pressable 
          style={[transportStyles.btn, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
        >
          <FontAwesome
            name="step-forward"
            size={18}
            color="rgba(228,235,252,0.35)"
          />
        </Pressable>
      </View>

      {/* LIVE status indicator bar */}
      <View style={transportStyles.liveBadgeRow}>
        <View style={transportStyles.liveBadge}>
          <View style={[
            transportStyles.liveDot, 
            isPlaying && { backgroundColor: COLORS.electric }
          ]} />
          <Text style={transportStyles.liveText}>LIVE STREAM</Text>
        </View>
        <Text style={transportStyles.elapsedText}>{formatTime(elapsed)}</Text>
      </View>
    </View>
  );
}

const transportStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  btn: {
    padding: 8,
  },
  playContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.electric,
  },
  playBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.electric,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(77,166,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(77,166,255,0.2)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(228,235,252,0.3)',
    marginRight: 6,
  },
  liveDotPlaying: {
    backgroundColor: COLORS.electric,
  },
  liveText: {
    color: COLORS.electric,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  elapsedText: {
    color: 'rgba(228,235,252,0.4)',
    fontSize: 10,
    fontFamily: Platform.OS === 'web' ? 'DM Sans' : undefined,
  },
});

// ---------------------------------------------------------------------------
// VolumeKnob — speaker icon + clickable volume bar
// ---------------------------------------------------------------------------
function VolumeKnob() {
  const volumeLevel = usePlayerStore((s) => s.volumeLevel);
  const changeVolume = usePlayerStore((s) => s.changeVolume);
  const station = usePlayerStore((s) => s.station);

  const setSleepOpen = useSleepTimer((s) => s.setOpen);
  const isSleepActive = useSleepTimer((s) => s.isActive);

  const volumeIcon =
    volumeLevel === 0
      ? 'volume-off'
      : volumeLevel < 0.5
        ? 'volume-down'
        : 'volume-up';

  const glowColor = station?.accent || COLORS.electric;

  return (
    <View style={volumeStyles.container}>
      <Pressable
        onPress={() => setSleepOpen(true)}
        style={({ pressed }) => [
          volumeStyles.sleepBtn,
          pressed && { opacity: 0.7 },
          Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined
        ]}
      >
        <FontAwesome
          name="moon-o"
          size={18}
          color={isSleepActive ? glowColor : 'rgba(228,235,252,0.5)'}
          style={isSleepActive ? {
            // @ts-ignore
            textShadowColor: glowColor,
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
          } : undefined}
        />
      </Pressable>

      <FontAwesome
        name={volumeIcon as any}
        size={16}
        color="rgba(228,235,252,0.5)"
      />
      <View style={volumeStyles.track}>
        <Pressable
          style={[volumeStyles.hitArea, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
          onPress={(e) => {
            const nativeEvent = e.nativeEvent as any;
            if (nativeEvent.offsetX !== undefined) {
              const newVol = Math.max(
                0,
                Math.min(1, nativeEvent.offsetX / 96),
              );
              changeVolume(newVol);
            }
          }}
        >
          <View
            style={[
              volumeStyles.fill,
              { width: `${volumeLevel * 100}%` as any },
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const volumeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '33%' as any,
    gap: 12,
  },
  sleepBtn: {
    padding: 6,
    marginRight: 4,
  },
  track: {
    width: 96,
    height: 3,
    backgroundColor: 'rgba(77,166,255,0.15)',
    borderRadius: 2,
    position: 'relative',
  },
  hitArea: {
    width: '100%',
    height: 20,
    position: 'absolute',
    top: -9,
  },
  fill: {
    height: 3,
    backgroundColor: COLORS.electric,
    borderRadius: 2,
    marginTop: 9,
  },
});

// ---------------------------------------------------------------------------
// NowPlayingBar — composed bottom bar (replaces PlayerBar)
// ---------------------------------------------------------------------------
export function NowPlayingBar() {
  const track = usePlayerStore((s) => s.track);
  const translateY = useSharedValue(100);

  useEffect(() => {
    if (track) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 120 });
    } else {
      translateY.value = 100;
    }
  }, [track]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!track) return null;

  return (
    <Animated.View style={[barStyles.container, animatedStyle]}>
      <TrackMeta />
      <TransportControls />
      <VolumeKnob />
    </Animated.View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    height: 84,
    backgroundColor: Platform.OS === 'web' ? 'rgba(6, 18, 34, 0.45)' : 'rgba(6, 18, 34, 0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(77,166,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        // @ts-ignore
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.4)',
      },
      default: {},
    }),
  },
});
