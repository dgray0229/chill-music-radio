import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCurrentTrack, fetchAlbumArt, fetchLyrics, TrackMetadata } from '@/services/api';
import { audioService } from '@/services/audio';
import { database } from '@/db';

export interface ParsedLyric {
  time: number;
  text: string;
}

const parseLRC = (lrc: string): ParsedLyric[] => {
  const lines = lrc.split('\n');
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  const parsed: ParsedLyric[] = [];
  lines.forEach(line => {
    const match = line.match(regex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10);
      const time = minutes * 60 + seconds + (match[3].length === 3 ? ms / 1000 : ms / 100);
      parsed.push({ time, text: match[4].trim() });
    }
  });
  return parsed;
};

interface PlayerContextType {
  track: TrackMetadata | null;
  isPlaying: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  volume: number;
  lyrics: string | null;
  parsedLyrics: ParsedLyric[] | null;
  trackStartTime: string | null;
  highResArt: string | null;
  togglePlayback: () => Promise<void>;
  setVolume: (vol: number) => Promise<void>;
  toggleFavorite: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [track, setTrack] = useState<TrackMetadata | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [parsedLyrics, setParsedLyrics] = useState<ParsedLyric[] | null>(null);
  const [trackStartTime, setTrackStartTime] = useState<string | null>(null);
  const [highResArt, setHighResArt] = useState<string | null>(null);

  useEffect(() => {
    loadTrack();
    const interval = setInterval(loadTrack, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const loadTrack = async () => {
    const currentTrack = await fetchCurrentTrack();
    
    // Check if track changed to fetch new art/lyrics
    setTrack(prevTrack => {
        if (!prevTrack || prevTrack.title !== currentTrack.title) {
            setTrackStartTime(currentTrack.starts || null);
            fetchExtraMetadata(currentTrack.artist, currentTrack.title);
            checkIfFavorite(currentTrack.title);
        } else if (currentTrack.starts && currentTrack.starts !== trackStartTime) {
            // Update start time if it shifted but song is the same (sometimes happens in live streams)
            setTrackStartTime(currentTrack.starts);
        }
        return currentTrack;
    });

    setIsLoading(false);
  };

  const fetchExtraMetadata = async (artist: string, title: string) => {
    setLyrics(null); // Reset
    setParsedLyrics(null);
    
    const [art, fetchedLyrics] = await Promise.all([
        fetchAlbumArt(artist, title),
        fetchLyrics(artist, title)
    ]);
    
    if (art) setHighResArt(art);
    if (fetchedLyrics) {
        setLyrics(fetchedLyrics);
        // Check if it's LRC format
        if (fetchedLyrics.match(/\[\d{2}:\d{2}\.\d{2,3}\]/)) {
            setParsedLyrics(parseLRC(fetchedLyrics));
        }
    }
  };

  const checkIfFavorite = async (title: string) => {
    const favorites = await database.get('favorite_tracks').query().fetch();
    setIsFavorite(favorites.some(f => (f as any).title === title));
  };

  const togglePlayback = async () => {
    if (!track) return;
    
    if (isPlaying) {
      await audioService.pause();
      setIsPlaying(false);
    } else {
      await audioService.play(track.streamUrl, {
        title: track.title,
        artist: track.artist,
        artwork: highResArt || track.albumArt
      });
      await audioService.setVolume(volume);
      setIsPlaying(true);
    }
  };

  const setVolume = async (vol: number) => {
      setVolumeState(vol);
      await audioService.setVolume(vol);
  };

  const toggleFavorite = async () => {
    if (!track) return;
    
    try {
      await database.write(async () => {
        const collection = database.get('favorite_tracks');
        const existing = await collection.query().fetch();
        const trackInDb = existing.find(f => (f as any).title === track.title);
        
        if (trackInDb) {
          await trackInDb.destroyPermanently();
          setIsFavorite(false);
        } else {
          await collection.create((newFav: any) => {
            newFav.title = track.title;
            newFav.artist = track.artist;
            newFav.albumArt = track.albumArt;
            newFav.streamUrl = track.streamUrl;
          });
          setIsFavorite(true);
        }
      });
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  return (
    <PlayerContext.Provider value={{
      track, isPlaying, isLoading, isFavorite, volume, lyrics, parsedLyrics, trackStartTime, highResArt,
      togglePlayback, setVolume, toggleFavorite
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
