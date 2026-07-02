export interface Station {
  id: string;
  label: string;
  genre: string;
  streamEndpoint: string;
  cover: any;
  coverUri: string;
  accent: string;
  hasApi: boolean;
  desc: string;
  /** Attribution text for the stream source (displayed in UI footer). */
  attribution?: string;
}

// ---------------------------------------------------------------------------
// All stations below are sourced from SomaFM (https://somafm.com).
// SomaFM explicitly encourages third-party apps to link to their streams
// and only asks for attribution. See https://somafm.com/linktous/
// All URLs use HTTPS and are compatible with iOS ATS and Android cleartext
// policy defaults.
// ---------------------------------------------------------------------------

export const STATION_LIST: Station[] = [
  {
    id: 'groove-salad',
    label: 'Groove Salad',
    genre: 'Ambient · Downtempo',
    streamEndpoint:
      'https://ice4.somafm.com/groovesalad-256-mp3',
    cover: require('@/assets/images/station-groove-salad.png'),
    coverUri:
      'https://somafm.com/img3/groovesalad-400.jpg',
    accent: '#5EC89B',
    hasApi: false,
    desc: 'A nice chilled plate of ambient/downtempo beats and grooves.',
    attribution: 'SomaFM.com',
  },
  {
    id: 'drone-zone',
    label: 'Drone Zone',
    genre: 'Ambient · Space',
    streamEndpoint:
      'https://ice2.somafm.com/dronezone-256-mp3',
    cover: require('@/assets/images/station-drone-zone.png'),
    coverUri: 'https://somafm.com/img3/dronezone-400.jpg',
    accent: '#7B68EE',
    hasApi: false,
    desc: 'Atmospheric ambient space music. Served best chilled.',
    attribution: 'SomaFM.com',
  },
  {
    id: 'def-con',
    label: 'DEF CON Radio',
    genre: 'Electronic · Hacker',
    streamEndpoint: 'https://ice2.somafm.com/defcon-256-mp3',
    cover: require('@/assets/images/station-def-con.png'),
    coverUri: 'https://somafm.com/img3/defcon-400.jpg',
    accent: '#00FF41',
    hasApi: false,
    desc: 'Music for hacking. Dark electronic beats from the DEF CON conference.',
    attribution: 'SomaFM.com',
  },
  {
    id: 'vaporwaves',
    label: 'Vaporwaves',
    genre: 'Vaporwave · Retro',
    streamEndpoint: 'https://ice2.somafm.com/vaporwaves-128-mp3',
    cover: require('@/assets/images/station-vaporwaves.png'),
    coverUri: 'https://somafm.com/img3/vaporwaves-400.jpg',
    accent: '#FF69B4',
    hasApi: false,
    desc: 'Nostalgic retro sounds, vaporwave beats, and synthesized dreams.',
    attribution: 'SomaFM.com',
  },
  {
    id: 'lush',
    label: 'Lush',
    genre: 'Ambient · Vocal',
    streamEndpoint: 'https://ice2.somafm.com/lush-128-mp3',
    cover: require('@/assets/images/station-iloveradio-lofi.jpg'),
    coverUri: 'https://somafm.com/img3/lush-400.jpg',
    accent: '#E67E22',
    hasApi: false,
    desc: 'Sensuous ambient sounds, instrumental, and vocal chillout.',
    attribution: 'SomaFM.com',
  },
  {
    id: 'spacestation',
    label: 'Space Station Soma',
    genre: 'Ambient · Electronic',
    streamEndpoint: 'https://ice2.somafm.com/spacestation-128-mp3',
    cover: require('@/assets/images/station-lofi-icecast.jpg'),
    coverUri: 'https://somafm.com/img3/spacestation-400.jpg',
    accent: '#4682B4',
    hasApi: false,
    desc: 'Tune in, turn on, space out. Spaced-out ambient electronic music.',
    attribution: 'SomaFM.com',
  },
  {
    id: 'fluid',
    label: 'Fluid',
    genre: 'Instrumental · Hiphop',
    streamEndpoint: 'https://ice2.somafm.com/fluid-128-mp3',
    cover: require('@/assets/images/station-hotmix-lofi.jpg'),
    coverUri: 'https://somafm.com/img3/fluid-400.jpg',
    accent: '#87CEFA',
    hasApi: false,
    desc: 'Smooth instrumental hiphop and chill lofi grooves.',
    attribution: 'SomaFM.com',
  },
];

/** The station loaded on first launch. */
export const INITIAL_STATION: Station = STATION_LIST[0];

/** Look up a station by its unique id. Returns `undefined` if not found. */
export function findStation(id: string): Station | undefined {
  return STATION_LIST.find((s) => s.id === id);
}
