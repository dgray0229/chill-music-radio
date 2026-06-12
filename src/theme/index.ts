import { createTheme } from '@shopify/restyle';

import { palette } from './palette';

const theme = createTheme({
  colors: {
    // Raw palette
    ink: palette.ink,
    midnight: palette.midnight,
    slate: palette.slate,
    electric: palette.electric,
    mist: palette.mist,
    violet: palette.violet,
    ember: palette.ember,
    transparent: palette.transparent,

    // Semantic aliases
    mainBackground: palette.ink,
    cardBackground: palette.slate,
    headerBackground: palette.midnight,
    primaryText: '#FFFFFF',
    mutedText: 'rgba(216,228,248,0.6)',
    accent: palette.electric,
    accentSecondary: palette.violet,
    danger: palette.ember,
  },

  spacing: {
    none: 0,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadii: {
    none: 0,
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 999,
  },

  breakpoints: {
    phone: 0,
    tablet: 768,
  },

  textVariants: {
    defaults: {
      color: 'primaryText',
      fontSize: 16,
      lineHeight: 22,
    },
    header: {
      color: 'primaryText',
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 34,
    },
    subheader: {
      color: 'primaryText',
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    body: {
      color: 'primaryText',
      fontSize: 16,
      lineHeight: 22,
    },
    caption: {
      color: 'mutedText',
      fontSize: 12,
      lineHeight: 16,
    },
    brand: {
      color: 'primaryText',
      fontFamily: 'Pacifico',
      fontSize: 32,
      lineHeight: 40,
    },
  },

  cardVariants: {
    defaults: {
      backgroundColor: 'cardBackground',
      borderRadius: 'l',
      padding: 'm',
    },
  },
});

export type Theme = typeof theme;
export default theme;
