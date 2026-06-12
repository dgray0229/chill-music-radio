// Radio API — metadata fetching using native fetch (no axios)
// All stations are now SomaFM streams with no station-specific API.
// Metadata is received via ICY stream headers on native (TrackPlayer)
// and via icecast-metadata-player on web.

import type { Station } from '@/src/stations/registry';

const ITUNES_SEARCH = 'https://itunes.apple.com/search';
const LRCLIB_API = 'https://lrclib.net/api/get';

// --- Types ---

export interface TrackInfo {
  title: string;
  artist: string;
  artworkUri: string;
  streamEndpoint: string;
  startedAt?: string;
}

export interface ScheduleEntry {
  id: string;
  name: string;
  from: string;
  to: string;
}

// --- Utilities ---

function decodeEntities(raw: string): string {
  if (!raw) return raw;
  return raw
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

// --- Station Metadata ---

export async function fetchStationMetadata(station: Station): Promise<TrackInfo> {
  // All stations return static info — live metadata comes via ICY stream
  // headers and is handled by the audioEngine/playerStore callback.
  return {
    title: station.label,
    artist: station.attribution ? `${station.genre} · ${station.attribution}` : station.genre,
    artworkUri: station.coverUri,
    streamEndpoint: station.streamEndpoint,
  };
}

// --- Schedule ---

export async function fetchSchedule(): Promise<ScheduleEntry[]> {
  // Static schedule — all current stations are 24/7 streams
  return [
    { id: '1', name: 'Morning Vibes', from: '08:00 AM', to: '11:00 AM' },
    { id: '2', name: 'Midday Hits', from: '11:00 AM', to: '02:00 PM' },
    { id: '3', name: 'Evening Drive', from: '04:00 PM', to: '07:00 PM' },
    { id: '4', name: 'Late Night Chill', from: '10:00 PM', to: '01:00 AM' },
  ];
}

// --- Album Art (iTunes) ---

export async function lookupCoverArt(artist: string, title: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(`${ITUNES_SEARCH}?term=${query}&entity=song&limit=1`);
    if (!res.ok) return null;

    const data = await res.json();
    const art100 = data?.results?.[0]?.artworkUrl100;
    if (art100) {
      return art100.replace('100x100bb', '600x600bb');
    }
  } catch (err) {
    console.warn('[radioApi] Cover art lookup failed:', err);
  }
  return null;
}

// --- Lyrics (LRCLIB) ---

export async function lookupLyrics(artist: string, title: string): Promise<string | null> {
  try {
    const cleanTitle = title.replace(/\s*[(\[]?\s*(feat|ft)\.?.*$/i, '');
    const cleanArtist = artist.split(/[,&]/)[0].trim();

    const params = new URLSearchParams({
      artist_name: cleanArtist,
      track_name: cleanTitle,
    });

    const res = await fetch(`${LRCLIB_API}?${params}`);
    if (!res.ok) return null;

    const data = await res.json();
    return data?.syncedLyrics || data?.plainLyrics || null;
  } catch (err) {
    console.warn('[radioApi] Lyrics lookup failed:', err);
  }
  return null;
}
