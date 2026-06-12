import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { PostHogProvider } from 'posthog-react-native';

import { AppThemeProvider } from '@/src/theme/ThemeProvider';
import { posthog } from '@/src/config/posthog';


export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Pacifico: require('../assets/fonts/Pacifico-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  // Inject PWA head tags on web
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
      meta.content = '#0B1A2E';
      head.appendChild(meta);
    }

    // Apple PWA meta
    const appleMeta = [
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Chill Radio' },
    ];
    appleMeta.forEach(({ name, content }) => {
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

    // Service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err: any) => {
        console.warn('SW registration failed:', err);
      });
    }
  }, []);

  if (!loaded) return null;

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
        maxElementsCaptured: 20,
      }}
    >
      <AppThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </AppThemeProvider>
    </PostHogProvider>
  );
}
