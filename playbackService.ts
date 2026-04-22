import { TrackPlayer, Event } from './services/player/trackPlayer';

export const PlaybackService = async function() {
    TrackPlayer.addEventListener(Event.RemotePlay as any, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause as any, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop as any, () => TrackPlayer.stop());
};
