// EasyListening.com Ocean Blue Palette
const deepNavy = '#002F5E';
const oceanBlue = '#589BE3';
const softSky = '#E4EBFC';
const lavenderAccent = '#8A7CC8';
const surfaceLight = '#0A3A6B';  // slightly lighter navy for cards
const surfaceDeep = '#001E3D';   // deeper navy for sidebar/tab bar

export const palette = {
  deepNavy,
  oceanBlue,
  softSky,
  lavenderAccent,
  surfaceLight,
  surfaceDeep,
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: oceanBlue,
    tabIconDefault: '#ccc',
    tabIconSelected: oceanBlue,
  },
  dark: {
    text: '#fff',
    background: deepNavy,
    surface: surfaceLight,
    surfaceDeep: surfaceDeep,
    accent: oceanBlue,
    accentSecondary: lavenderAccent,
    tint: oceanBlue,
    tabIconDefault: 'rgba(228,235,252,0.5)',
    tabIconSelected: oceanBlue,
  },
};
