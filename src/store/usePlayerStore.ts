// Player Store — Zustand (replaces PlayerContext)
// No Provider wrapper needed, flat store with selectors

import { create } from 'zustand';
import { engine } from '@/src/services/audioEngine';
import { fetchStationMetadata, lookupCoverArt, lookupLyrics, TrackInfo } from '@/src/services/radioApi';
import { Station, INITIAL_STATION, findStation, STATION_LIST } from '@/src/stations/registry';
import { posthog } from '@/src/config/posthog';

// --- Types ---

export interface LyricLine {
  timestamp: number;
  content: string;
}

type PlaybackStatus = 'idle' | 'buffering' | 'playing';

interface PlayerState {
  // Data
  station: Station;
  track: TrackInfo | null;
  playback: PlaybackStatus;
  volumeLevel: number;
  previousVolume: number;       // for mute/unmute
  coverArt: string | null;
  lyricsRaw: string | null;
  lyricLines: LyricLine[] | null;
  trackOrigin: string | null;     // was trackStartTime
  syncAnchor: number | null;      // was localSyncTime
  showShortcutOverlay: boolean;   // Keyboard shortcut cheat-sheet

  // Actions
  tune: (stationId: string) => void;
  togglePlay: () => Promise<void>;
  changeVolume: (level: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  setShowShortcutOverlay: (show: boolean) => void;
  refresh: () => Promise<void>;
}

// --- Helpers ---

function parseSyncedLyrics(raw: string): LyricLine[] | null {
  const pattern = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  if (!raw.match(pattern)) return null;

  const lines: LyricLine[] = [];
  for (const line of raw.split('\n')) {
    const m = line.match(pattern);
    if (m) {
      const mins = parseInt(m[1], 10);
      const secs = parseInt(m[2], 10);
      const frac = parseInt(m[3], 10);
      const timestamp = mins * 60 + secs + (m[3].length === 3 ? frac / 1000 : frac / 100);
      lines.push({ timestamp, content: m[4].trim() });
    }
  }
  return lines.length > 0 ? lines : null;
}

// --- Store ---

export const usePlayerStore = create<PlayerState>((set, get) => {
  // Internal refresh logic
  const loadMetadata = async () => {
    const { station } = get();
    const info = await fetchStationMetadata(station);

    const prev = get().track;
    const isNewTrack = !prev || prev.title !== info.title;

    set({ track: info });

    if (isNewTrack) {
      set({ trackOrigin: info.startedAt ?? null });

      if (station.hasApi) {
        // Fetch cover art + lyrics in parallel
        const [art, lyrics] = await Promise.all([
          lookupCoverArt(info.artist, info.title),
          lookupLyrics(info.artist, info.title),
        ]);
        set({
          coverArt: art,
          lyricsRaw: lyrics,
          lyricLines: lyrics ? parseSyncedLyrics(lyrics) : null,
        });
      } else {
        set({
          coverArt: station.coverUri,
          lyricsRaw: null,
          lyricLines: null,
        });
      }
    }
  };

  // Wire up ICY metadata callback
  engine.onStreamMetadata = (streamTitle: string) => {
    const { station } = get();

    if (!station.hasApi) {
      // Parse "Artist - Title" from ICY stream
      const segments = streamTitle.split(' - ');
      if (segments.length >= 2) {
        const artist = segments[0].trim();
        const title = segments.slice(1).join(' - ').trim();

        set(s => ({
          track: s.track ? { ...s.track, title, artist } : s.track,
        }));

        // Attempt cover art lookup for the detected track
        lookupCoverArt(artist, title).then(art => {
          if (art) set({ coverArt: art });
        });
      } else {
        set(s => ({
          track: s.track ? { ...s.track, title: streamTitle } : s.track,
        }));
      }
    }

    set({ syncAnchor: Date.now() });

    if (station.hasApi) {
      loadMetadata();
    }
  };

  // Start polling
  setTimeout(loadMetadata, 0);
  setInterval(() => {
    const { station } = get();
    if (station.hasApi) loadMetadata();
  }, 15_000);

  return {
    station: INITIAL_STATION,
    track: null,
    playback: 'idle',
    volumeLevel: 1,
    previousVolume: 1,
    coverArt: null,
    lyricsRaw: null,
    lyricLines: null,
    trackOrigin: null,
    syncAnchor: null,
    showShortcutOverlay: false,

    tune: (stationId: string) => {
      const next = findStation(stationId);
      if (!next || next.id === get().station.id) return;

      engine.teardown();

      set({
        station: next,
        track: null,
        playback: 'idle',
        coverArt: null,
        lyricsRaw: null,
        lyricLines: null,
        trackOrigin: null,
        syncAnchor: null,
      });

      // Load metadata for new station
      (async () => {
        const info = await fetchStationMetadata(next);
        set({ track: info });

        if (next.hasApi) {
          const [art, lyrics] = await Promise.all([
            lookupCoverArt(info.artist, info.title),
            lookupLyrics(info.artist, info.title),
          ]);
          set({
            coverArt: art,
            lyricsRaw: lyrics,
            lyricLines: lyrics ? parseSyncedLyrics(lyrics) : null,
          });
        } else {
          set({ coverArt: next.coverUri });
        }
      })();
    },

    togglePlay: async () => {
      const { track, playback, station, coverArt, volumeLevel } = get();
      if (!track) return;

      if (playback === 'playing') {
        await engine.suspend();
        set({ playback: 'idle' });
      } else {
        set({ playback: 'buffering' });
        await engine.startStream(track.streamEndpoint, {
          id: station.id,
          title: track.title,
          artist: track.artist,
          artwork: coverArt || track.artworkUri,
        });
        await engine.adjustVolume(volumeLevel);
        set({ playback: 'playing' });
      }
    },

    changeVolume: async (level: number) => {
      set({ volumeLevel: level });
      await engine.adjustVolume(level);
    },

    toggleMute: async () => {
      const { volumeLevel, previousVolume, station } = get();
      if (volumeLevel > 0) {
        // Mute
        posthog.capture('volume_muted', {
          previous_volume: volumeLevel,
          station_id: station.id,
          station_name: station.label,
        });
        set({ previousVolume: volumeLevel, volumeLevel: 0 });
        await engine.adjustVolume(0);
      } else {
        // Unmute
        const targetVolume = previousVolume > 0 ? previousVolume : 0.5;
        posthog.capture('volume_unmuted', {
          restored_volume: targetVolume,
          station_id: station.id,
          station_name: station.label,
        });
        set({ volumeLevel: targetVolume });
        await engine.adjustVolume(targetVolume);
      }
    },

    setShowShortcutOverlay: (show: boolean) => {
      set({ showShortcutOverlay: show });
    },

    refresh: loadMetadata,
  };
});
