import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, useWindowDimensions, Platform } from 'react-native';

import Colors, { palette } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Sidebar } from '@/components/Sidebar';
import { PlayerBar } from '@/components/PlayerBar';

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

  // Desktop breakpoint
  const isDesktop = Platform.OS === 'web' && width > 768;

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
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Radio',
          tabBarIcon: ({ color }) => <TabBarIcon name="play-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
        }}
      />
    </Tabs>
  );

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
      </View>
    );
  }

  return TabContent;
}
