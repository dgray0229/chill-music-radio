import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { TrackPlayer, AppKilledPlaybackBehavior, Capability } from './player/trackPlayer';

class AudioService {
  private isWeb = Platform.OS === 'web';
  private webSound: Audio.Sound | null = null;
  private isSetup = false;

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
        this.isSetup = true;
      } catch (e) {
        console.warn('TrackPlayer setup error:', e);
      }
    }
  }

  async play(url: string, metadata: { title: string; artist: string; artwork: string }) {
    if (!this.isSetup) await this.setup();

    if (this.isWeb) {
      if (this.webSound) {
        await this.webSound.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      this.webSound = sound;

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
      if (this.webSound) {
        await this.webSound.pauseAsync();
      }
    } else {
      await TrackPlayer.pause();
    }
  }

  async stop() {
      if (this.isWeb) {
        if (this.webSound) {
            await this.webSound.stopAsync();
            await this.webSound.unloadAsync();
            this.webSound = null;
        }
      } else {
          await TrackPlayer.stop();
      }
  }

  async setVolume(volume: number) {
      if (this.isWeb && this.webSound) {
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
      } else if (!this.isWeb) {
          await TrackPlayer.setVolume(volume);
      }
  }
}

export const audioService = new AudioService();
