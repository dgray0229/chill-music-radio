import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, useWindowDimensions, Platform } from 'react-native';

import Colors, { palette } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Sidebar } from '@/components/Sidebar';
import { PlayerBar } from '@/components/PlayerBar';
import { SplashOverlay } from '@/components/SplashOverlay';
import { usePWAInstall } from '@/hooks/usePWAInstall';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { showInstallOption, canInstall, isIOSSafari, promptInstall } = usePWAInstall();

  // Desktop breakpoint
  const isDesktop = Platform.OS === 'web' && width > 768;
  const isMobileWeb = Platform.OS === 'web' && width <= 768;

  // Splash screen state
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setShowSplash(true);
      return;
    }
    try {
      const seen = sessionStorage.getItem('splash-seen');
      if (!seen) {
        setShowSplash(true);
      }
    } catch {
      setShowSplash(true);
    }
  }, []);

  const dismissSplash = () => {
    setShowSplash(false);
    if (Platform.OS === 'web') {
      try {
        sessionStorage.setItem('splash-seen', 'true');
      } catch {}
    }
  };

  // Dismissible mobile install banner
  const [bannerDismissed, setBannerDismissed] = useState(true); // default hidden until checked

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const dismissed = localStorage.getItem('pwa-banner-dismissed');
      setBannerDismissed(dismissed === 'true');
    } catch {
      setBannerDismissed(false);
    }
  }, []);

  const dismissBanner = () => {
    setBannerDismissed(true);
    try {
      localStorage.setItem('pwa-banner-dismissed', 'true');
    } catch {}
  };

  const handleMobileInstall = async () => {
    if (canInstall) {
      const accepted = await promptInstall();
      if (accepted) dismissBanner();
    } else if (isIOSSafari) {
      // On iOS, just show the guidance (the banner text already tells them)
    }
  };

  const showMobileBanner = isMobileWeb && showInstallOption && !bannerDismissed;

  const TabContent = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.oceanBlue,
        tabBarInactiveTintColor: 'rgba(228,235,252,0.5)',
        tabBarStyle: isDesktop ? { display: 'none' } : {
            backgroundColor: palette.surfaceDeep,
            borderTopWidth: 0,
            paddingBottom: 10 + insets.bottom,
            paddingTop: 5,
            height: 65 + insets.bottom,
        },
        headerStyle: {
            backgroundColor: palette.surfaceDeep,
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerShown: !isDesktop,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Radio',
          headerTitle: 'Easy Listening Radio',
          headerTitleStyle: { fontFamily: 'Pacifico', fontSize: 24, paddingBottom: 4 },
          tabBarIcon: ({ color }) => <Ionicons name="radio" size={24} color={color} style={{ marginBottom: -3 }} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Ionicons name="menu" size={26} color={color} style={{ marginBottom: -3 }} />,
        }}
      />
      {/* Pages accessible via More menu or Sidebar — hidden from tab bar */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          href: null,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          href: null,
        }}
      />
      <Tabs.Screen
        name="radio-play"
        options={{
          title: 'Want Radio Play?',
          href: null,
        }}
      />
      <Tabs.Screen
        name="terms"
        options={{
          title: 'Terms & Conditions',
          href: null,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: 'Privacy Policy',
          href: null,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          href: null,
        }}
      />
    </Tabs>
  );

  const MobileInstallBanner = showMobileBanner ? (
    <View style={{
      backgroundColor: palette.oceanBlue,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <FontAwesome name="download" size={16} color="#fff" />
        <Pressable onPress={handleMobileInstall} style={{ flex: 1, marginLeft: 10 }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
            {isIOSSafari
              ? <Text>Tap <Ionicons name="share-outline" size={15} color="#fff" /> → "Add to Home Screen" to install</Text>
              : 'Install EasyListening as an app'}
          </Text>
        </Pressable>
      </View>
      <Pressable onPress={dismissBanner} style={{ padding: 4, marginLeft: 8 }}>
        <FontAwesome name="times" size={16} color="rgba(255,255,255,0.7)" />
      </Pressable>
    </View>
  ) : null;

  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.deepNavy, flexDirection: 'column' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Sidebar />
          <View style={{ flex: 1 }}>
            {TabContent}
          </View>
        </View>
        <PlayerBar />
        {showSplash && <SplashOverlay onDismiss={dismissSplash} />}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {MobileInstallBanner}
      {TabContent}
      {showSplash && <SplashOverlay onDismiss={dismissSplash} />}
    </View>
  );
}
