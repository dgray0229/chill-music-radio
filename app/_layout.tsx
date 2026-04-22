import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

import { TrackPlayer } from '../services/player/trackPlayer';
import { PlaybackService } from '../playbackService';

TrackPlayer.registerPlaybackService(() => PlaybackService);

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Inject PWA head tags and register service worker at runtime (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const head = document.head;

    // Manifest
    if (!head.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      head.appendChild(link);
    }

    // Theme color
    if (!head.querySelector('meta[name="theme-color"]')) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#002F5E';
      head.appendChild(meta);
    }

    // Apple PWA meta tags
    const appleTags = [
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'EasyListening' },
    ];
    appleTags.forEach(({ name, content }) => {
      if (!head.querySelector(`meta[name="${name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        head.appendChild(meta);
      }
    });

    // Apple touch icon
    if (!head.querySelector('link[rel="apple-touch-icon"]')) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = '/icons/icon-192.png';
      head.appendChild(link);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err: any) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { View, Platform } from 'react-native';

import { PlayerProvider } from '../context/PlayerContext';

import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PlayerProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </PlayerProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
