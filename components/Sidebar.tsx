import React, { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { showInstallOption, canInstall, isIOSSafari, promptInstall, isInstalled } = usePWAInstall();
  const [showIOSTip, setShowIOSTip] = useState(false);

  const navItems = [
    { name: 'Radio', path: '/', icon: 'play-circle' as const },
    { name: 'Schedule', path: '/schedule', icon: 'calendar' as const },
    { name: 'Favorites', path: '/favorites', icon: 'heart' as const },
    { name: 'About Us', path: '/about', icon: 'info-circle' as const },
    { name: 'Want Radio Play?', path: '/radio-play', icon: 'music' as const },
  ];

  const handleInstallPress = async () => {
    if (canInstall) {
      await promptInstall();
    } else if (isIOSSafari) {
      setShowIOSTip(prev => !prev);
    }
  };

  return (
    <View className="w-64 bg-navy-deep h-full pt-8 px-4 border-r border-ocean/20">
      <View className="mb-10 px-2 flex-row items-center">
        <FontAwesome name="headphones" size={28} color="#589BE3" />
        <Text className="text-white text-3xl ml-3" style={{ fontFamily: 'Pacifico' }}>EasyListening</Text>
      </View>

      <View className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.path as any)}
              className={`flex-row items-center px-4 py-3 rounded-md ${isActive ? 'bg-ocean/20' : 'hover:bg-ocean/10'}`}
            >
              <FontAwesome name={item.icon} size={20} color={isActive ? '#589BE3' : 'rgba(228,235,252,0.6)'} />
              <Text className={`ml-4 font-semibold ${isActive ? 'text-ocean' : 'text-soft-sky/60'}`}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto mb-6 px-2">
        {/* Install App Link */}
        {showInstallOption && (
          <View className="mb-4">
            <Pressable
              onPress={handleInstallPress}
              className="flex-row items-center px-4 py-3 rounded-lg bg-ocean/20 border border-ocean/30 active:bg-ocean/30"
            >
              <FontAwesome name="download" size={18} color="#589BE3" />
              <Text className="ml-3 font-semibold text-ocean text-sm">Install App</Text>
            </Pressable>

            {/* iOS Safari tooltip */}
            {showIOSTip && isIOSSafari && (
              <View className="mt-2 p-3 bg-navy-light rounded-lg border border-ocean/20">
                <Text className="text-soft-sky/80 text-xs leading-5">
                  Tap the <Text className="font-bold text-white">Share</Text> button (□↑) in Safari, then tap{' '}
                  <Text className="font-bold text-white">"Add to Home Screen"</Text>.
                </Text>
              </View>
            )}
          </View>
        )}

        {isInstalled && Platform.OS === 'web' && (
          <View className="mb-4 flex-row items-center px-4 py-2">
            <FontAwesome name="check-circle" size={14} color="rgba(88,155,227,0.5)" />
            <Text className="ml-2 text-xs text-ocean/50">App installed</Text>
          </View>
        )}

        <Text className="text-xs text-ocean/30">EasyListening.com Player v1.0</Text>
      </View>
    </View>
  );
}
