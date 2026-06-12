// Favorites Store — Zustand + expo-sqlite/Drizzle
// Replaces WatermelonDB favorites logic

import { create } from 'zustand';
import { Platform } from 'react-native';

// Types
export interface SavedTrack {
  id: number;
  title: string;
  artist: string;
  artwork: string | null;
  streamUrl: string | null;
  savedAt: Date;
}

interface FavoritesState {
  items: SavedTrack[];
  loaded: boolean;
  isSaved: (title: string) => boolean;
  load: () => Promise<void>;
  toggle: (track: { title: string; artist: string; artwork?: string; streamUrl?: string }) => Promise<void>;
}

// Lazy DB import to avoid web SSR issues
let dbModule: any = null;
let schemaModule: any = null;

async function getDb() {
  if (Platform.OS === 'web') {
    // On web, use a simple in-memory store (no sqlite)
    return null;
  }
  if (!dbModule) {
    dbModule = await import('@/src/data/client');
    schemaModule = await import('@/src/data/schema');
  }
  return { db: dbModule.db, schema: schemaModule };
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  loaded: false,

  isSaved: (title: string) => {
    return get().items.some(item => item.title === title);
  },

  load: async () => {
    try {
      const modules = await getDb();
      if (!modules) {
        set({ loaded: true });
        return;
      }

      const { db, schema } = modules;
      const rows = await db.select().from(schema.savedTracks).all();
      set({
        items: rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          artist: r.artist,
          artwork: r.artwork,
          streamUrl: r.streamUrl,
          savedAt: new Date(r.savedAt),
        })),
        loaded: true,
      });
    } catch (err) {
      console.warn('[FavoritesStore] Failed to load:', err);
      set({ loaded: true });
    }
  },

  toggle: async (track) => {
    const existing = get().items.find(i => i.title === track.title);

    try {
      const modules = await getDb();

      if (existing) {
        // Remove
        if (modules) {
          const { db, schema } = modules;
          const { eq } = await import('drizzle-orm');
          await db.delete(schema.savedTracks).where(eq(schema.savedTracks.id, existing.id));
        }
        set(s => ({ items: s.items.filter(i => i.id !== existing.id) }));
      } else {
        // Add
        const newItem: SavedTrack = {
          id: Date.now(), // Temp ID, will be replaced by DB
          title: track.title,
          artist: track.artist,
          artwork: track.artwork ?? null,
          streamUrl: track.streamUrl ?? null,
          savedAt: new Date(),
        };

        if (modules) {
          const { db, schema } = modules;
          const result = await db.insert(schema.savedTracks).values({
            title: track.title,
            artist: track.artist,
            artwork: track.artwork ?? null,
            streamUrl: track.streamUrl ?? null,
            savedAt: new Date(),
          }).returning();
          if (result[0]) newItem.id = result[0].id;
        }

        set(s => ({ items: [...s.items, newItem] }));
      }
    } catch (err) {
      console.error('[FavoritesStore] Toggle failed:', err);
    }
  },
}));
