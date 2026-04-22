import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { TrackPlayer, AppKilledPlaybackBehavior, Capability, Event } from './player/trackPlayer';

let IcecastMetadataPlayer: any = null;
if (Platform.OS === 'web') {
  try {
    IcecastMetadataPlayer = require('icecast-metadata-player').default || require('icecast-metadata-player');
  } catch (e) {
    console.warn('Could not load icecast-metadata-player on web', e);
  }
}

class AudioService {
  private isWeb = Platform.OS === 'web';
  private webSound: Audio.Sound | null = null;
  private icecastPlayer: any = null;
  private isSetup = false;
  
  public onMetadataCallback: ((metadata: any) => void) | null = null;

  async setup() {
    if (this.isSetup) return;

    if (this.isWeb) {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      this.isSetup = true;
    } else {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
        });
        
        TrackPlayer.addEventListener(Event.PlaybackMetadataReceived, (event) => {
          if (this.onMetadataCallback && event.title) {
            // event.title typically contains the ICY StreamTitle (e.g., "Artist - Song")
            this.onMetadataCallback(event.title);
          }
        });
        
        this.isSetup = true;
      } catch (e) {
        console.warn('TrackPlayer setup error:', e);
      }
    }
  }

  async play(url: string, metadata: { title: string; artist: string; artwork: string }) {
    if (!this.isSetup) await this.setup();

    if (this.isWeb) {
      // Clean up previous players
      if (this.webSound) {
        await this.webSound.unloadAsync();
        this.webSound = null;
      }
      if (this.icecastPlayer) {
        this.icecastPlayer.stop();
        this.icecastPlayer = null;
      }

      if (IcecastMetadataPlayer) {
        this.icecastPlayer = new IcecastMetadataPlayer(url, {
          onMetadata: (meta: any) => {
            if (this.onMetadataCallback && meta && meta.StreamTitle) {
              this.onMetadataCallback(meta.StreamTitle);
            }
          }
        });
        this.icecastPlayer.play();
      } else {
        // Fallback to Expo Audio if icecast player is not available
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true }
        );
        this.webSound = sound;
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: metadata.title,
          artist: metadata.artist,
          artwork: [
            { src: metadata.artwork, sizes: '96x96', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '128x128', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '192x192', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '256x256', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '384x384', type: 'image/jpeg' },
            { src: metadata.artwork, sizes: '512x512', type: 'image/jpeg' },
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          this.play(url, metadata);
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          this.pause();
        });
      }
    } else {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: 'radioking-stream',
        url: url,
        title: metadata.title,
        artist: metadata.artist,
        artwork: metadata.artwork,
      });
      await TrackPlayer.play();
    }
  }

  async pause() {
    if (this.isWeb) {
      if (this.icecastPlayer) {
        this.icecastPlayer.stop();
      }
      if (this.webSound) {
        if (typeof (this.webSound as any).pauseAsync === 'function') {
          await (this.webSound as any).pauseAsync();
        } else if (typeof (this.webSound as any).pause === 'function') {
          (this.webSound as any).pause();
        }
      }
    } else {
      await TrackPlayer.pause();
    }
  }

  async stop() {
      if (this.isWeb) {
        if (this.icecastPlayer) {
            this.icecastPlayer.stop();
            this.icecastPlayer = null;
        }
        if (this.webSound) {
            if (typeof (this.webSound as any).stopAsync === 'function') {
                await (this.webSound as any).stopAsync();
            }
            if (typeof (this.webSound as any).unloadAsync === 'function') {
                await (this.webSound as any).unloadAsync();
            }
            this.webSound = null;
        }
      } else {
          await TrackPlayer.stop();
      }
  }

  async setVolume(volume: number) {
      if (this.isWeb) {
          if (this.icecastPlayer && this.icecastPlayer.audioElement) {
              try {
                  this.icecastPlayer.audioElement.volume = volume;
              } catch (e) {
                  console.warn('Could not set volume on icecastPlayer', e);
              }
          }
          if (this.webSound) {
              if (typeof (this.webSound as any).setVolumeAsync === 'function') {
                  await (this.webSound as any).setVolumeAsync(volume);
              } else if (typeof (this.webSound as any).setStatusAsync === 'function') {
                  await (this.webSound as any).setStatusAsync({ volume });
              } else {
                  try {
                      (this.webSound as any).volume = volume;
                  } catch (e) {
                      console.warn('Could not set volume on web', e);
                  }
              }
          }
      } else {
          await TrackPlayer.setVolume(volume);
      }
  }
}

export const audioService = new AudioService();
