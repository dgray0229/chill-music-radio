import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, useWindowDimensions, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { palette } from '@/src/theme/palette';
import { NavigationRail } from '@/src/ui/NavigationRail';
import { NowPlayingBar } from '@/src/ui/NowPlayingBar';
import { WelcomeOverlay } from '@/src/ui/WelcomeOverlay';
import { useAppInstall } from '@/src/hooks/useAppInstall';
import { useKeyboardShortcuts } from '@/src/hooks/useKeyboardShortcuts';
import { KeyboardShortcutOverlay } from '@/src/ui/KeyboardShortcutOverlay';
import { SleepTimerModal } from '@/src/ui/SleepTimerModal';

function TabIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { visible, canPrompt, iosSafari, triggerInstall } = useAppInstall();

  // Initialize keyboard shortcuts on web
  useKeyboardShortcuts();

  const isDesktop = Platform.OS === 'web' && width > 768;
  const isMobileWeb = Platform.OS === 'web' && width <= 768;

  // Welcome overlay
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setShowWelcome(true);
      return;
    }
    try {
      const seen = sessionStorage.getItem('welcome-seen');
      if (!seen) setShowWelcome(true);
    } catch {
      setShowWelcome(true);
    }
  }, []);

  const dismissWelcome = () => {
    setShowWelcome(false);
    if (Platform.OS === 'web') {
      try { sessionStorage.setItem('welcome-seen', 'true'); } catch {}
    }
  };

  // Mobile install banner
  const [bannerHidden, setBannerHidden] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const hidden = localStorage.getItem('install-banner-hidden');
      setBannerHidden(hidden === 'true');
    } catch {
      setBannerHidden(false);
    }
  }, []);

  const hideBanner = () => {
    setBannerHidden(true);
    try { localStorage.setItem('install-banner-hidden', 'true'); } catch {}
  };

  const handleMobileInstall = async () => {
    if (canPrompt) {
      const accepted = await triggerInstall();
      if (accepted) hideBanner();
    }
  };

  const showMobileBanner = isMobileWeb && visible && !bannerHidden;

  const TabsContent = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.electric,
        tabBarInactiveTintColor: 'rgba(216,228,248,0.5)',
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : {
              backgroundColor: palette.midnight,
              borderTopWidth: 0,
              paddingBottom: 10 + insets.bottom,
              paddingTop: 5,
              height: 65 + insets.bottom,
            },
        headerStyle: {
          backgroundColor: palette.midnight,
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerShown: !isDesktop,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Radio',
          headerTitle: 'Chill Radio',
          headerTitleStyle: { fontFamily: 'Pacifico', fontSize: 24, paddingBottom: 4 },
          tabBarIcon: ({ color }) => <Ionicons name="radio" size={24} color={color} style={{ marginBottom: -3 }} />,
        }}
      />
      <Tabs.Screen
        name="stations"
        options={{
          title: 'Stations',
          headerTitle: 'Stations',
          tabBarIcon: ({ color }) => <Ionicons name="radio-outline" size={24} color={color} style={{ marginBottom: -3 }} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <TabIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={26} color={color} style={{ marginBottom: -3 }} />,
        }}
      />
      {/* Hidden tabs — accessible via More/Rail */}
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', href: null }} />
      <Tabs.Screen name="about" options={{ title: 'About', href: null }} />
      <Tabs.Screen name="radio-play" options={{ title: 'Submit Music', href: null }} />
      <Tabs.Screen name="terms" options={{ title: 'Terms of Service', href: null }} />
      <Tabs.Screen name="privacy" options={{ title: 'Privacy Policy', href: null }} />
      <Tabs.Screen name="contact" options={{ title: 'Contact', href: null }} />
    </Tabs>
  );

  const MobileBanner = showMobileBanner ? (
    <View style={styles.banner}>
      <View style={styles.bannerContent}>
        <FontAwesome name="download" size={16} color="#fff" />
        <Pressable onPress={handleMobileInstall} style={styles.bannerTextWrap}>
          <Text style={styles.bannerText}>
            {iosSafari ? (
              <Text>
                Tap <Ionicons name="share-outline" size={15} color="#fff" /> → "Add to Home Screen" to install
              </Text>
            ) : (
              'Install Chill Radio as an app'
            )}
          </Text>
        </Pressable>
      </View>
      <Pressable onPress={hideBanner} style={styles.bannerClose}>
        <FontAwesome name="times" size={16} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </View>
  ) : null;

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.desktopBody}>
          <NavigationRail />
          <View style={styles.desktopMain}>{TabsContent}</View>
        </View>
        <NowPlayingBar />
        {showWelcome && <WelcomeOverlay onDismiss={dismissWelcome} />}
        <KeyboardShortcutOverlay />
        <SleepTimerModal />
      </View>
    );
  }

  return (
    <View style={styles.mobileRoot}>
      {MobileBanner}
      {TabsContent}
      {showWelcome && <WelcomeOverlay onDismiss={dismissWelcome} />}
      <KeyboardShortcutOverlay />
      <SleepTimerModal />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopRoot: {
    flex: 1,
    backgroundColor: palette.ink,
    flexDirection: 'column',
  },
  desktopBody: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMain: {
    flex: 1,
  },
  mobileRoot: {
    flex: 1,
  },
  banner: {
    backgroundColor: palette.electric,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerClose: {
    padding: 4,
    marginLeft: 8,
  },
});
