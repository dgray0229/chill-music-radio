import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { usePostHog } from "@/src/config/usePostHog";
import { fetchSchedule, ScheduleEntry } from "@/src/services/radioApi";

// ---------- palette ----------
const C = {
  ink: "#0B1A2E",
  slate: "#142D4F",
  electric: "#4DA6FF",
  mist: "#D8E4F8",
  mistDim: "rgba(216,228,248,0.6)",
  white: "#FFFFFF",
} as const;

// ---------- helpers ----------
function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr.replace(" ", "T") + "Z");
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return dateStr;
  }
}

// ---------- component ----------
export default function ScheduleScreen() {
  const posthog = usePostHog();
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    posthog.capture("schedule_viewed");
  }, [posthog]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchSchedule();
        if (!cancelled) setSchedule(data);
      } catch (err) {
        console.warn("[ScheduleScreen] Failed to load schedule:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ScheduleEntry }) => (
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardBody}>
          <Text style={styles.showName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(item.from)}</Text>
            {item.to ? (
              <Text style={styles.timeText}> — {formatTime(item.to)}</Text>
            ) : null}
          </View>
        </View>
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback((item: ScheduleEntry) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={C.electric} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Show Schedule</Text>
      {schedule.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No shows scheduled right now.</Text>
        </View>
      ) : (
        <FlatList
          data={schedule}
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
    fontFamily: Platform.OS === "web" ? "DM Sans" : undefined,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.ink,
  },
  listContent: {
    paddingBottom: 120,
  },

  // --- Card ---
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(20, 45, 79, 0.35)",
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
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
  accentBar: {
    width: 4,
    backgroundColor: C.electric,
  },
  cardBody: {
    flex: 1,
    padding: 18,
  },
  showName: {
    color: C.white,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    fontFamily: Platform.OS === "web" ? "DM Sans" : undefined,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: C.mistDim,
    fontWeight: "500",
    fontSize: 13,
    fontFamily: Platform.OS === "web" ? "Inter" : undefined,
  },

  // --- Empty ---
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80,
  },
  emptyText: {
    color: C.mistDim,
    fontSize: 15,
    fontFamily: Platform.OS === "web" ? "Inter" : undefined,
  },
});
