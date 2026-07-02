import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  useWindowDimensions,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { usePostHog } from 'posthog-react-native';
import { usePlayerStore } from '@/src/store/usePlayerStore';
import { STATION_LIST, Station } from '@/src/stations/registry';

// ---------- palette ----------
const C = {
  ink: '#0B1A2E',
  midnight: '#061222',
  slate: '#142D4F',
  electric: '#4DA6FF',
  mist: '#D8E4F8',
  mistDim: 'rgba(216,228,248,0.5)',
  mistFaint: 'rgba(216,228,248,0.3)',
  white: '#FFFFFF',
} as const;

// --- Equalizer Animation for Currently Playing Card ---
function CardEqualizer({ accent }: { accent: string }) {
  const playback = usePlayerStore((s) => s.playback);
  const isPlaying = playback === 'playing';

  const h1 = useSharedValue(4);
  const h2 = useSharedValue(8);
  const h3 = useSharedValue(6);
  const h4 = useSharedValue(5);

  React.useEffect(() => {
    if (isPlaying) {
      h1.value = withRepeat(withSequence(withTiming(16, { duration: 400 }), withTiming(4, { duration: 400 })), -1, true);
      h2.value = withRepeat(withSequence(withTiming(4, { duration: 300 }), withTiming(16, { duration: 300 })), -1, true);
      h3.value = withRepeat(withSequence(withTiming(16, { duration: 500 }), withTiming(6, { duration: 500 })), -1, true);
      h4.value = withRepeat(withSequence(withTiming(5, { duration: 350 }), withTiming(14, { duration: 350 })), -1, true);
    } else {
      h1.value = withTiming(4);
      h2.value = withTiming(4);
      h3.value = withTiming(4);
      h4.value = withTiming(4);
    }
  }, [isPlaying]);

  const style1 = useAnimatedStyle(() => ({ height: h1.value }));
  const style2 = useAnimatedStyle(() => ({ height: h2.value }));
  const style3 = useAnimatedStyle(() => ({ height: h3.value }));
  const style4 = useAnimatedStyle(() => ({ height: h4.value }));

  return (
    <View style={eqStyles.container}>
      <Animated.View style={[eqStyles.bar, style1, { backgroundColor: accent }]} />
      <Animated.View style={[eqStyles.bar, style2, { backgroundColor: accent }]} />
      <Animated.View style={[eqStyles.bar, style3, { backgroundColor: accent }]} />
      <Animated.View style={[eqStyles.bar, style4, { backgroundColor: accent }]} />
    </View>
  );
}

const eqStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 22,
    height: 18,
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 1.5,
  },
});

export default function StationsScreen() {
  const posthog = usePostHog();
  const router = useRouter();
  const activeStation = usePlayerStore((s) => s.station);
  const tune = usePlayerStore((s) => s.tune);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const playback = usePlayerStore((s) => s.playback);
  const isPlaying = playback === 'playing';

  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const GENRE_CHIPS = ['All', 'Ambient', 'Electronic', 'Lofi / Hiphop', 'Vaporwave'];

  const handleTune = (stationId: string) => {
    const station = STATION_LIST.find((s) => s.id === stationId);
    posthog.capture('station_tuned', {
      station_id: stationId,
      station_name: station?.label ?? null,
      station_genre: station?.genre ?? null,
      previous_station_id: activeStation.id,
    });
    tune(stationId);
    router.push('/(tabs)');
  };

  const handleTuneAndPlay = async (stationId: string) => {
    tune(stationId);
    router.push('/(tabs)');
    // If not playing, toggle play
    if (!isPlaying) {
      setTimeout(async () => {
        try {
          await usePlayerStore.getState().togglePlay();
        } catch (err) {
          console.warn('[Stations] Failed auto-play:', err);
        }
      }, 300);
    }
  };

  const filteredStations = STATION_LIST.filter((item) => {
    const matchesSearch = 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedGenre === 'All') return matchesSearch;
    if (selectedGenre === 'Ambient') {
      return matchesSearch && (item.genre.includes('Ambient') || item.genre.includes('Space') || item.genre.includes('Vocal'));
    }
    if (selectedGenre === 'Electronic') {
      return matchesSearch && (item.genre.includes('Electronic') || item.genre.includes('Hacker'));
    }
    if (selectedGenre === 'Lofi / Hiphop') {
      return matchesSearch && (item.genre.includes('Downtempo') || item.genre.includes('Hiphop') || item.genre.includes('Instrumental'));
    }
    if (selectedGenre === 'Vaporwave') {
      return matchesSearch && (item.genre.includes('Vaporwave') || item.genre.includes('Retro'));
    }
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Radio Stations</Text>
          <Text style={styles.subtitle}>Select a SomaFM stream to start chilling</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="rgba(216, 228, 248, 0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations, genres..."
            placeholderTextColor="rgba(216, 228, 248, 0.4)"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              posthog.capture('station_search_typed', { query: text });
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 ? (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={({ pressed }) => [styles.clearButton, pressed && { opacity: 0.7 }]}
            >
              <FontAwesome name="times-circle" size={16} color="rgba(216, 228, 248, 0.5)" />
            </Pressable>
          ) : null}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {GENRE_CHIPS.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <Pressable
                key={genre}
                onPress={() => {
                  setSelectedGenre(genre);
                  posthog.capture('station_genre_filter_changed', { genre });
                }}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected && styles.chipSelected,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {genre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredStations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search-minus" size={48} color="rgba(77, 166, 255, 0.3)" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No Stations Found</Text>
            <Text style={styles.emptySubtext}>We couldn't find any stations matching "{searchQuery}"</Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSelectedGenre('All');
              }}
              style={({ pressed }) => [styles.resetButton, pressed && { opacity: 0.9 }]}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.list, isDesktop && styles.listDesktop]}>
            {filteredStations.map((item) => {
              const isActive = activeStation.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleTune(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    isActive && styles.cardActive,
                    isActive && { shadowColor: item.accent },
                    pressed && styles.cardPressed,
                    isDesktop && styles.cardDesktop,
                  ]}
                >
                  <View style={styles.cardGlowContainer}>
                    {isActive && (
                      <Image
                        source={{ uri: item.coverUri }}
                        style={[StyleSheet.absoluteFillObject, styles.artGlow]}
                        blurRadius={20}
                      />
                    )}
                  </View>

                  <View style={styles.cardContent}>
                    <Image source={{ uri: item.coverUri }} style={styles.coverArt} />
                    
                    <View style={styles.info}>
                      <View style={styles.titleRow}>
                        <Text style={styles.stationName}>{item.label}</Text>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            {isPlaying ? (
                              <CardEqualizer accent={item.accent} />
                            ) : (
                              <FontAwesome name="check-circle" size={18} color={item.accent} />
                            )}
                          </View>
                        )}
                      </View>
                      
                      <Text style={[styles.genre, { color: item.accent }]}>
                        {item.genre}
                      </Text>
                      
                      <Text style={styles.description} numberOfLines={2}>
                        {item.desc}
                      </Text>

                      <View style={styles.cardActions}>
                        <Pressable
                          onPress={() => handleTune(item.id)}
                          style={({ pressed }) => [
                            styles.actionButton,
                            { backgroundColor: 'rgba(77,166,255,0.1)' },
                            pressed && { opacity: 0.8 },
                          ]}
                        >
                          <Text style={styles.actionText}>TUNE IN</Text>
                        </Pressable>

                        {isActive && !isPlaying ? (
                          <Pressable
                            onPress={() => togglePlay()}
                            style={({ pressed }) => [
                              styles.actionButton,
                              { backgroundColor: item.accent },
                              pressed && { opacity: 0.8 },
                            ]}
                          >
                            <FontAwesome name="play" size={12} color={C.midnight} style={{ marginRight: 6 }} />
                            <Text style={[styles.actionText, { color: C.midnight }]}>PLAY</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  scrollContentDesktop: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 28,
  },
  title: {
    color: C.white,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: C.mistDim,
    fontSize: 15,
    marginTop: 4,
  },
  list: {
    gap: 20,
  },
  listDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: 'rgba(20,45,79,0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(77,166,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardDesktop: {
    width: '48%',
  },
  cardActive: {
    borderColor: 'rgba(77,166,255,0.25)',
    backgroundColor: 'rgba(20,45,79,0.5)',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.45,
        shadowRadius: 24,
      },
    }),
  },
  cardPressed: {
    opacity: 0.95,
  },
  cardGlowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 24,
  },
  artGlow: {
    opacity: 0.2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    zIndex: 10,
  },
  coverArt: {
    width: 90,
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(216,228,248,0.1)',
  },
  info: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stationName: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  activeBadge: {
    paddingLeft: 8,
  },
  genre: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    color: C.mistDim,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: C.electric,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  // --- Search Bar styles ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 45, 79, 0.45)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.12)',
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
      default: {},
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 6,
  },

  // --- Category Chips styles ---
  chipsContainer: {
    marginBottom: 24,
    flexGrow: 0,
  },
  chipsContent: {
    gap: 8,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(20, 45, 79, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.08)',
  },
  chipSelected: {
    backgroundColor: C.electric,
    borderColor: C.electric,
  },
  chipText: {
    color: 'rgba(216, 228, 248, 0.65)',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: C.midnight,
    fontWeight: '700',
  },

  // --- Empty State styles ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    color: C.mistDim,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  resetButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(77, 166, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77, 166, 255, 0.3)',
  },
  resetButtonText: {
    color: C.electric,
    fontSize: 14,
    fontWeight: '700',
  },
});
