// AudioEngine — stream playback abstraction
// Uses expo-audio for all platforms (web + native)

import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';

let IcecastMetadataPlayer: any = null;
if (Platform.OS === 'web') {
  try {
    IcecastMetadataPlayer = require('icecast-metadata-player').default || require('icecast-metadata-player');
  } catch (e) {
    console.warn('[AudioEngine] icecast-metadata-player unavailable on web', e);
  }
}

export interface StreamMetadata {
  id?: string;
  title: string;
  artist: string;
  artwork: string;
}

type MetadataHandler = (streamTitle: string) => void;

class AudioEngine {
  private ready = false;
  private initializing = false;
  private isWeb = Platform.OS === 'web';
  private sound: AudioPlayer | null = null;
  private soundSubscription: { remove: () => void } | null = null;
  private icecast: any = null;

  public onStreamMetadata: MetadataHandler | null = null;

  async initialize(): Promise<void> {
    if (this.ready || this.initializing) return;
    this.initializing = true;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
        shouldRouteThroughEarpiece: false,
      });
      this.ready = true;
    } catch (err) {
      console.warn('[AudioEngine] Initialize failed:', err);
    } finally {
      this.initializing = false;
    }
  }

  async startStream(endpoint: string, meta: StreamMetadata): Promise<void> {
    if (!this.ready) await this.initialize();

    try {
      if (this.isWeb && IcecastMetadataPlayer) {
        // Web: prefer IcecastMetadataPlayer for live stream metadata
        await this.disposeResources();

        this.icecast = new IcecastMetadataPlayer(endpoint, {
          onMetadata: (icyMeta: any) => {
            if (this.onStreamMetadata && icyMeta?.StreamTitle) {
              this.onStreamMetadata(icyMeta.StreamTitle);
            }
          },
        });
        this.icecast.play();

        this.updateMediaSession(meta, endpoint);
      } else {
        // Native (iOS/Android) + Web fallback: use expo-audio
        await this.disposeResources();

        const player = createAudioPlayer(endpoint);
        this.sound = player;

        // Listen for playback status updates (errors, buffering, etc.)
        this.soundSubscription = player.addListener('playbackStatusUpdate', (status) => {
          if (status.error) {
            console.warn('[AudioEngine] Playback error:', status.error);
          }
        });

        player.play();

        if (this.isWeb) {
          this.updateMediaSession(meta, endpoint);
        }
      }
    } catch (err) {
      console.warn('[AudioEngine] startStream failed:', err);
    }
  }

  async suspend(): Promise<void> {
    if (this.icecast) {
      this.icecast.stop();
    }
    if (this.sound) {
      try {
        this.sound.pause();
      } catch {
        // ignore
      }
    }
  }

  async teardown(): Promise<void> {
    await this.disposeResources();
  }

  async adjustVolume(level: number): Promise<void> {
    if (this.icecast?.audioElement) {
      try { this.icecast.audioElement.volume = level; } catch {}
    }
    if (this.sound) {
      try {
        this.sound.setVolume(level);
      } catch {
        // ignore
      }
    }
  }

  // --- Private ---

  private async disposeResources(): Promise<void> {
    if (this.soundSubscription) {
      try { this.soundSubscription.remove(); } catch {}
      this.soundSubscription = null;
    }
    if (this.sound) {
      try { this.sound.stop(); } catch {}
      try { this.sound.release(); } catch {}
      this.sound = null;
    }
    if (this.icecast) {
      this.icecast.stop();
      this.icecast = null;
    }
  }

  private updateMediaSession(meta: StreamMetadata, endpoint: string): void {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: meta.title,
      artist: meta.artist,
      artwork: [
        { src: meta.artwork, sizes: '96x96', type: 'image/jpeg' },
        { src: meta.artwork, sizes: '128x128', type: 'image/jpeg' },
        { src: meta.artwork, sizes: '192x192', type: 'image/jpeg' },
        { src: meta.artwork, sizes: '256x256', type: 'image/jpeg' },
        { src: meta.artwork, sizes: '384x384', type: 'image/jpeg' },
        { src: meta.artwork, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => this.startStream(endpoint, meta));
    navigator.mediaSession.setActionHandler('pause', () => this.suspend());
  }
}

export const engine = new AudioEngine();
