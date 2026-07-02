class WebTrackPlayerStub {
  async setupPlayer() {}
  async updateOptions(_opts: any) {}
  async add(_track: any) {}
  async play() {}
  async pause() {}
  async stop() {}
  async reset() {}
  async setVolume(_vol: number) {}
  addEventListener(_event: string, _handler: (...args: any[]) => void) {}
  registerPlaybackService(_factory: () => any) {}
}

export const TrackPlayer = new WebTrackPlayerStub();

export enum AppKilledPlaybackBehavior {
  StopPlaybackAndRemoveNotification = 0,
}

export enum Capability {
  Play = 0,
  Pause = 1,
  Stop = 2,
}

export enum Event {
  RemotePlay = 'remote-play',
  RemotePause = 'remote-pause',
  RemoteStop = 'remote-stop',
  PlaybackMetadataReceived = 'playback-metadata-received',
}
