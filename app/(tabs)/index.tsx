import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
  FlatList,
  useWindowDimensions,
  Platform,
  StyleSheet,
  Share,
  Clipboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostHog } from 'posthog-react-native';
import { usePlayerStore } from '@/src/store/usePlayerStore';
import { useFavoritesStore } from '@/src/store/useFavoritesStore';
import { useHistoryStore } from '@/src/store/useHistoryStore';
import { useAdaptiveColor } from '@/src/hooks/useAdaptiveColor';
import { STATION_LIST } from '@/src/stations/registry';
import { StationCarousel } from '@/src/ui/StationCarousel';
import { ScrollingText } from '@/src/ui/ScrollingText';
import { AudioVisualizer } from '@/src/ui/AudioVisualizer';
import { Skeleton } from '@/src/ui/Skeleton';
import { Picker } from '@react-native-picker/picker';

// ---------- background assets ----------
const desktopBg = require('@/assets/images/chill-radio-bg-desktop.jpg');
const mobileBg = require('@/assets/images/chill-radio-bg-mobile.jpg');

// ---------- palette ----------
const C = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
  mistDim: 'rgba(216,228,248,0.5)',
  mistFaint: 'rgba(216,228,248,0.4)',
  mistVeryFaint: 'rgba(216,228,248,0.2)',
  electricDim: 'rgba(77,166,255,0.3)',
  electricFaint: 'rgba(77,166,255,0.2)',
  white: '#FFFFFF',
  heartActive: '#FF6B6B',
} as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ---------- Lyric Row Component with Smooth Transitions ----------
function LyricRow({ content, isActive }: { content: string; isActive: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    scale.value = withTiming(isActive ? 1.05 : 1, { duration: 300 });
    opacity.value = withTiming(isActive ? 1 : 0.45, { duration: 300 });
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text
      style={[
        styles.lyricLine,
        isActive && styles.lyricLineActive,
        animatedStyle,
      ]}
    >
      {content}
    </Animated.Text>
  );
}

// ---------- component ----------
export default function RadioScreen() {
  const posthog = usePostHog();

  // --- Zustand selectors ---
  const station = usePlayerStore((s) => s.station);
  const track = usePlayerStore((s) => s.track);
  const playback = usePlayerStore((s) => s.playback);
  const coverArt = usePlayerStore((s) => s.coverArt);
  const lyricsRaw = usePlayerStore((s) => s.lyricsRaw);
  const lyricLines = usePlayerStore((s) => s.lyricLines);
  const trackOrigin = usePlayerStore((s) => s.trackOrigin);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const tune = usePlayerStore((s) => s.tune);

  const isSaved = useFavoritesStore((s) => s.isSaved);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);

  // --- Adaptive Color Hook ---
  const { dominantColor, dominantColorDim } = useAdaptiveColor({
    coverArt,
    fallbackColor: station.accent,
  });

  // --- History Store ---
  const history = useHistoryStore((s) => s.history);
  const [showHistory, setShowHistory] = useState(false);

  // --- Share states ---
  const [showCopied, setShowCopied] = useState(false);
  const shareScale = useSharedValue(1);
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

  // --- local state ---
  const [streamOffset, setStreamOffset] = useState(7);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const router = useRouter();

  const flatListRef = useRef<FlatList>(null);
  const mobileFlatListRef = useRef<FlatList>(null);

  // --- Reanimated values ---
  const artScale = useSharedValue(0.95);
  const artOpacity = useSharedValue(0);
  const playScale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  // --- derived ---
  const artwork = coverArt || track?.artworkUri;
  const trackIsSaved = track ? isSaved(track.title) : false;
  const isPlaying = playback === 'playing';
  const isBuffering = playback === 'buffering';

  // --- elapsed timer ---
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

  // --- Album art animations ---
  useEffect(() => {
    if (track) {
      artScale.value = 0.94;
      artOpacity.value = 0.2;
      artScale.value = withSpring(1, { damping: 14, stiffness: 100 });
      artOpacity.value = withTiming(1, { duration: 700 });
    }
  }, [track]);

  // --- Play Button Pulse ---
  useEffect(() => {
    if (isPlaying) {
      playScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 800, easing: Easing.ease }),
          withTiming(1, { duration: 800, easing: Easing.ease })
        ),
        -1,
        true
      );
    } else {
      playScale.value = withTiming(1, { duration: 300 });
    }
  }, [isPlaying]);

  // --- scroll active lyric into view ---
  useEffect(() => {
    if (activeLyricIndex < 0 || !lyricLines || activeLyricIndex >= lyricLines.length) return;

    const ref = isDesktop ? flatListRef : mobileFlatListRef;
    ref.current?.scrollToIndex({
      index: activeLyricIndex,
      animated: true,
      viewPosition: 0.5,
    });
  }, [activeLyricIndex, lyricLines, isDesktop]);

  // --- synced lyrics ticker ---
  useEffect(() => {
    if (!lyricLines || !trackOrigin) {
      setActiveLyricIndex(-1);
      return;
    }

    const interval = setInterval(() => {
      const startMs = new Date(trackOrigin.replace(' ', 'T') + 'Z').getTime();
      const positionSecs = (Date.now() - startMs) / 1000 - streamOffset;

      let idx = -1;
      for (let i = 0; i < lyricLines.length; i++) {
        if (positionSecs >= lyricLines[i].timestamp) {
          idx = i;
        } else {
          break;
        }
      }
      setActiveLyricIndex(idx);
    }, 300);

    return () => clearInterval(interval);
  }, [lyricLines, trackOrigin, streamOffset]);

  // --- handle favorite toggle with Spring ---
  const handleToggleFavorite = useCallback(() => {
    if (!track) return;
    heartScale.value = withSequence(
      withTiming(1.35, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );
    const isCurrentlySaved = isSaved(track.title);
    toggleFavorite({
      title: track.title,
      artist: track.artist,
      artwork: artwork ?? undefined,
      streamUrl: track.streamEndpoint,
    });
    if (!isCurrentlySaved) {
      posthog.capture('track_favorited', {
        track_title: track.title,
        track_artist: track.artist,
        station_id: station.id,
        station_name: station.label,
      });
    }
  }, [track, artwork, isSaved, toggleFavorite, posthog, station]);

  // --- handle share with Spring ---
  const handleShare = useCallback(async () => {
    if (!track) return;
    shareScale.value = withSequence(
      withTiming(1.25, { duration: 100 }),
      withSpring(1, { damping: 8, stiffness: 180 })
    );
    const shareMessage = `🎵 Listening to "${track.title}" by ${track.artist} on Chill Radio`;

    posthog.capture('track_shared', {
      track_title: track.title,
      track_artist: track.artist,
      station_id: station.id,
      station_name: station.label,
      platform: Platform.OS,
    });

    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Chill Radio',
            text: shareMessage,
          });
        } catch (err) {
          // ignore cancel/fail
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
  }, [track, posthog, station]);

  // --- handle play/pause with event tracking ---
  const handleTogglePlay = useCallback(async () => {
    const willPlay = playback !== 'playing';
    await togglePlay();
    if (willPlay) {
      posthog.capture('playback_started', {
        station_id: station.id,
        station_name: station.label,
        station_genre: station.genre,
        track_title: track?.title ?? null,
        track_artist: track?.artist ?? null,
      });
    } else {
      posthog.capture('playback_paused', {
        station_id: station.id,
        station_name: station.label,
        elapsed_seconds: elapsed,
      });
    }
  }, [playback, togglePlay, posthog, station, track, elapsed]);

  // --- scroll-to-index error handler ---
  const handleScrollToIndexFailed = useCallback(
    (info: { index: number }, ref: React.RefObject<FlatList | null>) => {
      setTimeout(() => {
        ref.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    },
    [],
  );

  // --- animated styles ---
  const artAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: artScale.value }],
    opacity: artOpacity.value,
  }));

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const toastAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  // --- loading state ---
  if (!track) {
    return (
      <View style={[styles.root, styles.skeletonRoot]}>
        <View style={StyleSheet.absoluteFillObject}>
          <LinearGradient
            colors={['rgba(11,26,46,0.3)', 'rgba(6,18,34,0.95)']}
            style={StyleSheet.absoluteFillObject}
          />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: isDesktop ? 24 : 8, paddingBottom: isDesktop ? 40 : 24 },
          ]}
        >
          {/* Station Carousel Skeleton */}
          <View style={styles.carouselSkeletonRow}>
            <Skeleton width={140} height={180} borderRadius={20} style={styles.carouselSkeletonCard} />
            <Skeleton width={140} height={180} borderRadius={20} style={styles.carouselSkeletonCard} />
            <Skeleton width={140} height={180} borderRadius={20} style={styles.carouselSkeletonCard} />
          </View>

          <View style={styles.mainContent}>
            {/* Album Art Skeleton */}
            <View style={styles.artRow}>
              <Skeleton
                width={isDesktop ? 360 : 280}
                height={isDesktop ? 360 : 280}
                borderRadius={24}
                style={styles.artSkeleton}
              />
            </View>

            {/* Track Info Skeleton */}
            <View style={[styles.trackInfoWrap, isDesktop && styles.trackInfoDesktop]}>
              <View style={styles.trackInfoRow}>
                <View style={styles.trackTextWrap}>
                  <Skeleton width={200} height={26} borderRadius={6} style={{ marginBottom: 12 }} />
                  <Skeleton width={130} height={18} borderRadius={4} />
                </View>
                <Skeleton width={32} height={32} borderRadius={16} />
              </View>

              {/* LIVE status indicator bar skeleton */}
              <View style={styles.liveIndicatorContainer}>
                <Skeleton width={56} height={22} borderRadius={6} />
                <Skeleton width={40} height={14} borderRadius={4} />
              </View>

              {/* Play button skeleton */}
              {!isDesktop && (
                <View style={styles.controlsRow}>
                  <Skeleton width={76} height={76} borderRadius={38} />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // --- lyrics panel (shared between mobile + desktop) ---
  const renderLyricsPanel = (ref: React.RefObject<FlatList | null>, containerStyle: object) => (
    <View style={[styles.lyricsPanel, containerStyle]}>
      {/* blurred background artwork */}
      {artwork ? (
        <Image
          source={{ uri: artwork }}
          style={styles.lyricsBgImage}
          blurRadius={40}
        />
      ) : null}

      {/* header row */}
      <View style={styles.lyricsHeader}>
        <Text style={styles.lyricsTitle}>Lyrics</Text>
        {lyricLines ? (
          <View style={styles.syncControls}>
            <Pressable
              onPress={() => setStreamOffset((o) => Math.max(0, +(o - 0.5).toFixed(1)))}
              style={[styles.syncButton, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
            >
              <Text style={styles.syncButtonText}>−</Text>
            </Pressable>
            <Text style={styles.syncLabel}>{streamOffset.toFixed(1)}s</Text>
            <Pressable
              onPress={() => setStreamOffset((o) => +(o + 0.5).toFixed(1))}
              style={[styles.syncButton, Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined]}
            >
              <Text style={styles.syncButtonText}>+</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* lyrics body */}
      {lyricLines ? (
        <FlatList
          ref={ref}
          data={lyricLines}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          style={styles.lyricsList}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 150 }}
          onScrollToIndexFailed={(info) => handleScrollToIndexFailed(info, ref)}
          renderItem={({ item, index }) => (
            <LyricRow content={item.content} isActive={index === activeLyricIndex} />
          )}
        />
      ) : (
        <ScrollView
          style={styles.lyricsList}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.plainLyrics}>{lyricsRaw}</Text>
        </ScrollView>
      )}
    </View>
  );

  // --- Recently Played History Panel ---
  const renderHistoryPanel = () => {
    if (history.length === 0) return null;

    const timeAgo = (timestamp: number) => {
      const diffMs = Date.now() - timestamp;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins === 1) return '1m ago';
      return `${diffMins}m ago`;
    };

    return (
      <View style={[styles.historyContainer, { marginTop: 24, marginBottom: 24 }]}>
        <Pressable
          onPress={() => setShowHistory(!showHistory)}
          style={({ pressed }) => [
            styles.historyHeader,
            pressed && { opacity: 0.8 },
            Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : undefined,
          ]}
        >
          <View style={styles.historyTitleRow}>
            <FontAwesome name="history" size={16} color={C.electric} style={{ marginRight: 8 }} />
            <Text style={styles.historyTitle}>Recently Played</Text>
          </View>
          <FontAwesome
            name={showHistory ? 'chevron-up' : 'chevron-down'}
            size={12}
            color={C.mistDim}
          />
        </Pressable>

        {showHistory && (
          <View style={styles.historyList}>
            {history.map((item, idx) => (
              <View key={`${item.title}-${idx}`} style={styles.historyItem}>
                <Image
                  source={item.artwork ? { uri: item.artwork } : require('@/assets/images/chill-radio-bg.jpg')}
                  style={styles.historyArtwork}
                />
                <View style={styles.historyMeta}>
                  <Text style={styles.historyTrackTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.historyTrackArtist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
                <Text style={styles.historyTime}>{timeAgo(item.timestamp)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, isDesktop && styles.rootDesktop]}>
      {/* Full screen AudioVisualizer behind everything */}
      <View style={StyleSheet.absoluteFillObject}>
        <AudioVisualizer accentColor={station.accent} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: isDesktop ? 24 : 16, paddingBottom: isDesktop ? 40 : 24 },
          isDesktop && styles.scrollContentDesktop,
        ]}
      >
        {/* Switch Station Button container */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Station:</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/stations')}
            style={({ pressed }) => [
              styles.pickerWrapper,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={styles.pickerInner}>
              <View style={styles.pickerStationInfo}>
                <Image source={{ uri: station.coverUri }} style={styles.pickerCoverMin} />
                <Text style={styles.pickerValueText}>{station.label}</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color={C.electric} style={{ marginRight: 16 }} />
            </View>
          </Pressable>
        </View>

        <View style={styles.mainContent}>
          {/* Album Art Row */}
          <View style={styles.artRow}>
            <Animated.View
              style={[
                styles.artContainer,
                isDesktop ? styles.artDesktop : styles.artMobile,
                artAnimatedStyle,
                { shadowColor: dominantColor },
              ]}
            >
              {/* Blurred duplicate image behind the main image for glow */}
              {artwork ? (
                <Image
                  source={{ uri: artwork }}
                  style={[StyleSheet.absoluteFillObject, styles.artGlow]}
                  blurRadius={30}
                  resizeMode="cover"
                />
              ) : null}

              {artwork ? (
                <Image
                  source={{ uri: artwork }}
                  style={styles.artImage}
                  resizeMode="cover"
                />
              ) : null}
            </Animated.View>
          </View>

          {/* Track Info */}
          <View style={[styles.trackInfoWrap, isDesktop && styles.trackInfoDesktop]}>
            <View style={styles.trackInfoRow}>
              <View style={styles.trackTextWrap}>
                <ScrollingText
                  text={track.title}
                  style={styles.trackTitle}
                />
                <ScrollingText
                  text={track.artist}
                  style={styles.trackArtist}
                  speed={30}
                />
              </View>
              
              <View style={styles.trackActionsRow}>
                <View style={{ position: 'relative' }}>
                  {showCopied && (
                    <Animated.View style={[styles.mainToast, toastAnimatedStyle]}>
                      <Text style={styles.mainToastText}>Copied!</Text>
                    </Animated.View>
                  )}
                  <AnimatedPressable
                    onPress={handleShare}
                    style={[
                      styles.shareButton,
                      shareAnimatedStyle,
                      Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
                    ]}
                  >
                    <FontAwesome name="share" size={22} color={C.electric} />
                  </AnimatedPressable>
                </View>

                <AnimatedPressable 
                  onPress={handleToggleFavorite} 
                  style={[
                    styles.heartButton, 
                    heartAnimatedStyle,
                    Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
                  ]}
                >
                  <FontAwesome
                     name={trackIsSaved ? 'heart' : 'heart-o'}
                     size={28}
                     color={trackIsSaved ? C.heartActive : C.mistDim}
                  />
                </AnimatedPressable>
              </View>
            </View>

            {/* LIVE stream elapsed indicator row */}
            <View style={styles.liveIndicatorContainer}>
              <View style={styles.liveBadge}>
                <View style={[
                  styles.liveDot,
                  isPlaying && { backgroundColor: station.accent }
                ]} />
                <Text style={[styles.liveText, { color: station.accent }]}>LIVE</Text>
              </View>
              <Text style={styles.elapsedText}>{formatTime(elapsed)}</Text>
            </View>

            {/* Play button — mobile only */}
            {!isDesktop && (
              <View style={styles.controlsRow}>
                <AnimatedPressable
                  onPress={handleTogglePlay}
                  style={[
                    styles.playButton,
                    playAnimatedStyle,
                    Platform.OS === 'web' ? { cursor: 'pointer' } as any : undefined
                  ]}
                >
                  {isBuffering ? (
                    <ActivityIndicator size="small" color={C.ink} />
                  ) : (
                    <FontAwesome
                      name={isPlaying ? 'pause' : 'play'}
                      size={32}
                      color={C.ink}
                      style={{ marginLeft: isPlaying ? 0 : 5 }}
                    />
                  )}
                </AnimatedPressable>
              </View>
            )}

            {/* Recently Played History */}
            {renderHistoryPanel()}

            {/* Mobile lyrics panel */}
            {!isDesktop && Boolean(lyricsRaw) &&
              renderLyricsPanel(mobileFlatListRef, styles.lyricsPanelMobile)}
          </View>
        </View>
      </ScrollView>

      {/* Desktop lyrics side-panel */}
      {isDesktop && Boolean(lyricsRaw) &&
        renderLyricsPanel(flatListRef, styles.lyricsPanelDesktop)}
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.ink,
  },
  rootDesktop: {
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.ink,
  },
  bgImage: {
    opacity: 0.18,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
  },
  scrollContentDesktop: {
    flexGrow: 1,
  },
  mainContent: {
    paddingHorizontal: 24,
  },

  // --- Album art ---
  artRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  visualizerUnderlay: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 10,
  },
  artContainer: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
  },
  artDesktop: {
    width: 360,
    height: 360,
  } as any,
  artMobile: {
    width: 280,
    height: 280,
  } as any,
  artImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(77,166,255,0.15)',
  },
  pickerContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerLabel: {
    color: 'rgba(216,228,248,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: 'rgba(20,45,79,0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(77,166,255,0.15)',
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    color: '#FFF',
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    fontSize: 15,
    color: '#FFF',
    backgroundColor: C.slate,
  },
  pickerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: 16,
  },
  pickerStationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerCoverMin: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(216,228,248,0.1)',
  },
  pickerValueText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  artGlow: {
    position: 'absolute',
    top: 15,
    left: 10,
    right: -10,
    bottom: -15,
    opacity: 0.45,
    borderRadius: 24,
  },

  // --- Track info ---
  trackInfoWrap: {
    width: '100%',
  },
  trackInfoDesktop: {
    width: '75%',
    maxWidth: 500,
    alignSelf: 'center',
  } as any,
  trackInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  trackTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  trackTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  trackArtist: {
    color: 'rgba(216,228,248,0.6)',
    fontSize: 16,
  },
  heartButton: {
    padding: 8,
  },

  // --- Live stream status indicator ---
  liveIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(77,166,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
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
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  elapsedText: {
    color: 'rgba(216,228,248,0.4)',
    fontSize: 12,
  },

  // --- Play controls ---
  controlsRow: {
    alignItems: 'center',
    paddingBottom: 8,
    marginTop: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: C.white,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // --- Lyrics panel (shared) ---
  lyricsPanel: {
    backgroundColor: 'rgba(20,45,79,0.3)',
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(77,166,255,0.08)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      },
      default: {},
    }),
  },
  lyricsPanelMobile: {
    width: '100%',
    height: 380,
    marginTop: 32,
    marginBottom: 32,
  },
  lyricsPanelDesktop: {
    width: '30%',
    minWidth: 320,
    maxWidth: 420,
    borderRadius: 0,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(77,166,255,0.12)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    backgroundColor: 'rgba(6,18,34,0.35)',
  } as any,
  lyricsBgImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.08,
  } as any,
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    marginBottom: 20,
  },
  lyricsTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  syncControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(77,166,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '700',
  },
  syncLabel: {
    color: C.mistDim,
    fontSize: 11,
    marginHorizontal: 8,
    width: 40,
    textAlign: 'center',
  },
  lyricsList: {
    flex: 1,
    zIndex: 10,
  },
  lyricLine: {
    fontSize: 17,
    lineHeight: 38,
    paddingHorizontal: 12,
    color: C.mistFaint,
    fontWeight: '500',
  },
  lyricLineActive: {
    color: C.white,
    fontSize: 22,
    fontWeight: '700',
  },
  plainLyrics: {
    color: 'rgba(216,228,248,0.75)',
    fontSize: 17,
    lineHeight: 38,
    fontWeight: '500',
    paddingBottom: 32,
  },
  // --- New features styles ---
  trackActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButton: {
    padding: 8,
  },
  mainToast: {
    position: 'absolute',
    bottom: 42,
    left: -18,
    backgroundColor: C.electric,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  mainToastText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  skeletonRoot: {
    backgroundColor: C.ink,
  },
  carouselSkeletonRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  carouselSkeletonCard: {
    opacity: 0.25,
  },
  artSkeleton: {
    alignSelf: 'center',
  },
  historyContainer: {
    backgroundColor: 'rgba(20, 45, 79, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.08)',
    padding: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      },
      default: {},
    }),
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  historyList: {
    marginTop: 12,
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(216, 228, 248, 0.04)',
    borderRadius: 12,
    padding: 8,
  },
  historyArtwork: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  historyMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  historyTrackTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  historyTrackArtist: {
    color: 'rgba(216, 228, 248, 0.5)',
    fontSize: 11,
    marginTop: 2,
  },
  historyTime: {
    color: 'rgba(216, 228, 248, 0.3)',
    fontSize: 11,
  },
});
