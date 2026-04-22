export const TrackPlayer = {
  setupPlayer: async () => {},
  updateOptions: async () => {},
  add: async () => {},
  play: async () => {},
  pause: async () => {},
  stop: async () => {},
  reset: async () => {},
  addEventListener: () => {},
  registerPlaybackService: () => {},
};

export const AppKilledBehavior = {
  StopPlaybackAndRemoveNotification: 0,
};

export const Capability = {
  Play: 0,
  Pause: 1,
  Stop: 2,
};

export const Event = {
  RemotePlay: 'remote-play',
  RemotePause: 'remote-pause',
  RemoteStop: 'remote-stop',
};
