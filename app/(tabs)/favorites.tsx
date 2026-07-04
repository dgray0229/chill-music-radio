import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { usePostHog } from "@/src/config/usePostHog";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useFavoritesStore, SavedTrack } from "@/src/store/useFavoritesStore";

// ---------- palette ----------
const C = {
  ink: "#0B1A2E",
  slate: "#142D4F",
  electric: "#4DA6FF",
  mist: "#D8E4F8",
  mistDim: "rgba(216,228,248,0.5)",
  electricDim: "rgba(77,166,255,0.3)",
  white: "#FFFFFF",
  heart: "#FF6B6B",
} as const;

// ---------- Pulsing Empty State Heart ----------
function PulsingHeart() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <FontAwesome
        name="heart-o"
        size={54}
        color={C.electric}
        style={styles.emptyIcon}
      />
    </Animated.View>
  );
}

// ---------- component ----------
export default function FavoritesScreen() {
  const posthog = usePostHog();
  const items = useFavoritesStore((s) => s.items);
  const loaded = useFavoritesStore((s) => s.loaded);
  const load = useFavoritesStore((s) => s.load);
  const toggle = useFavoritesStore((s) => s.toggle);

  useEffect(() => {
    if (!loaded) {
      load();
    }
  }, [loaded, load]);

  const handleRemove = useCallback(
    (item: SavedTrack) => {
      posthog.capture("track_unfavorited", {
        track_title: item.title,
        track_artist: item.artist,
        favorites_count: items.length,
      });
      toggle({
        title: item.title,
        artist: item.artist,
        artwork: item.artwork ?? undefined,
        streamUrl: item.streamUrl ?? undefined,
      });
    },
    [toggle, posthog, items.length],
  );

  const renderItem = useCallback(
    ({ item }: { item: SavedTrack }) => (
      <View style={styles.trackRow}>
        {item.artwork ? (
          <Image source={{ uri: item.artwork }} style={styles.trackArt} />
        ) : (
          <View style={[styles.trackArt, styles.artworkFallback]}>
            <FontAwesome name="music" size={24} color={C.electricDim} />
          </View>
        )}

        <View style={styles.trackTextWrap}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {item.artist}
          </Text>
        </View>

        <Pressable
          onPress={() => handleRemove(item)}
          style={({ pressed }) => [
            styles.favBtn,
            pressed && { opacity: 0.7 },
            Platform.OS === "web" ? ({ cursor: "pointer" } as any) : undefined,
          ]}
        >
          <FontAwesome name="heart" size={20} color={C.heart} />
        </Pressable>
      </View>
    ),
    [handleRemove],
  );

  const keyExtractor = useCallback(
    (item: SavedTrack) => item.id.toString(),
    [],
  );

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <PulsingHeart />
          <Text style={styles.emptyText}>Your Playlist is Empty</Text>
          <Text style={styles.emptySubtext}>
            Tap the heart icon on any track to save your favorites here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.ink,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  listContent: {
    paddingBottom: 120,
  },

  // --- Track row ---
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 45, 79, 0.4)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(77, 166, 255, 0.08)",
    ...Platform.select({
      web: {
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      },
      default: {},
    }),
  },
  trackArt: {
    width: 54,
    height: 54,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: "rgba(6, 18, 34, 0.5)",
  },
  artworkFallback: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(77, 166, 255, 0.15)",
  },
  trackTextWrap: {
    flex: 1,
    overflow: "hidden",
  },
  trackTitle: {
    color: C.white,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  trackArtist: {
    color: C.mistDim,
    fontSize: 13,
  },
  favBtn: {
    padding: 10,
  },

  // --- Empty state ---
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyText: {
    color: C.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(216, 228, 248, 0.4)",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 20,
  },
});
