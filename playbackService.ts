import { TrackPlayer, Event } from './src/services/trackPlayerShim';

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay as any, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause as any, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop as any, () => TrackPlayer.stop());
};
