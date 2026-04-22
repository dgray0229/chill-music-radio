import axios from 'axios';

// Airtime Pro Endpoint for easylistening.com
const API_URL = 'https://easylistening.airtime.pro/api/live-info'; 
const STREAM_URL = 'https://easylistening.out.airtime.pro/easylistening_a';

export interface TrackMetadata {
  title: string;
  artist: string;
  albumArt: string;
  streamUrl: string;
  starts?: string;
}

export interface ShowSchedule {
  id: string;
  title: string;
  start: string;
  end: string;
}

const decodeHtmlEntities = (text: string) => {
  if (!text) return text;
  return text
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

export const fetchCurrentTrack = async (): Promise<TrackMetadata> => {
  try {
    const response = await axios.get(API_URL);
    if (response.data && response.data.current) {
        const metadata = response.data.current.metadata || {};
        return {
            title: decodeHtmlEntities(metadata.track_title || response.data.current.name || 'Unknown Title'),
            artist: decodeHtmlEntities(metadata.artist_name || 'Unknown Artist'),
            albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', // Provide a fallback cover
            streamUrl: STREAM_URL,
            starts: response.data.current.starts
        };
    }
  } catch (error) {
    console.warn('Failed to fetch from Airtime Pro API, using mock data.', error);
  }

  // Mock data fallback
  return {
    title: 'Easy Listening Radio',
    artist: 'Live Stream',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    streamUrl: STREAM_URL
  };
};

export const fetchSchedule = async (): Promise<ShowSchedule[]> => {
    try {
        const response = await axios.get(API_URL);
        const shows: ShowSchedule[] = [];
        
        if (response.data.currentShow && response.data.currentShow[0]) {
            shows.push({
                id: 'current',
                title: response.data.currentShow[0].name || 'Current Show',
                start: response.data.currentShow[0].starts,
                end: response.data.currentShow[0].ends,
            });
        }
        if (response.data.nextShow && response.data.nextShow[0]) {
            shows.push({
                id: 'next',
                title: response.data.nextShow[0].name || 'Next Show',
                start: response.data.nextShow[0].starts,
                end: response.data.nextShow[0].ends,
            });
        }
        
        if (shows.length > 0) return shows;
    } catch (e) {
        // Fall back
    }

    // Mock schedule for now
    return [
        { id: '1', title: 'Morning Vibes', start: '08:00 AM', end: '11:00 AM' },
        { id: '2', title: 'Midday Hits', start: '11:00 AM', end: '02:00 PM' },
        { id: '3', title: 'Evening Drive', start: '04:00 PM', end: '07:00 PM' },
        { id: '4', title: 'Late Night Chill', start: '10:00 PM', end: '01:00 AM' },
    ];
};

export const fetchAlbumArt = async (artist: string, title: string): Promise<string | null> => {
    try {
        const query = encodeURIComponent(`${artist} ${title}`);
        const response = await axios.get(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        if (response.data && response.data.results && response.data.results.length > 0) {
            const artworkUrl100 = response.data.results[0].artworkUrl100;
            if (artworkUrl100) {
                // Get high-res 600x600 artwork instead of 100x100
                return artworkUrl100.replace('100x100bb', '600x600bb');
            }
        }
    } catch (e) {
        console.warn('Failed to fetch album art from iTunes', e);
    }
    return null;
};

export const fetchLyrics = async (artist: string, title: string): Promise<string | null> => {
    try {
        const cleanTitle = title.replace(/\s*[\(\[]\s*(feat|ft)\.?.*$/i, '');
        const cleanArtist = artist.split(/[,&]/)[0].trim();

        const response = await axios.get(`https://lrclib.net/api/get`, {
            params: {
                artist_name: cleanArtist,
                track_name: cleanTitle
            }
        });
        if (response.data) {
            if (response.data.syncedLyrics) {
                return response.data.syncedLyrics;
            }
            if (response.data.plainLyrics) {
                return response.data.plainLyrics;
            }
        }
    } catch (e) {
        console.warn('Failed to fetch lyrics from LRCLIB', e);
    }
    return null;
};
