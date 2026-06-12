import { create } from 'zustand';
import { usePlayerStore } from './usePlayerStore';

export interface HistoryEntry {
  title: string;
  artist: string;
  artwork: string | null;
  timestamp: number; // Date.now()
}

interface HistoryState {
  history: HistoryEntry[];
  push: (track: { title: string; artist: string; artwork: string | null }) => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => {
  return {
    history: [],

    push: (track) => {
      if (!track.title || !track.artist) return;

      const newEntry: HistoryEntry = {
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        timestamp: Date.now(),
      };

      set((state) => {
        // Filter out any existing matching entry (deduplicate)
        const filtered = state.history.filter(
          (item) => !(item.title === track.title && item.artist === track.artist)
        );

        // Prepends, slice to 30
        const updatedHistory = [newEntry, ...filtered].slice(0, 30);
        return { history: updatedHistory };
      });
    },

    clear: () => set({ history: [] }),
  };
});

// Auto-subscribe to track changes from usePlayerStore
let lastTrackKey = '';

usePlayerStore.subscribe((state) => {
  const track = state.track;
  if (!track) return;

  const currentKey = `${track.title} - ${track.artist}`;
  if (currentKey !== lastTrackKey) {
    lastTrackKey = currentKey;
    const coverArt = state.coverArt || track.artworkUri;
    useHistoryStore.getState().push({
      title: track.title,
      artist: track.artist,
      artwork: coverArt,
    });
  }
});
