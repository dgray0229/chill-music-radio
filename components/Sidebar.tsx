import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: 'Radio', path: '/', icon: 'play-circle' as const },
    { name: 'Schedule', path: '/schedule', icon: 'calendar' as const },
    { name: 'Favorites', path: '/favorites', icon: 'heart' as const },
  ];

  return (
    <View className="w-64 bg-navy-deep h-full pt-8 px-4 border-r border-ocean/20">
      <View className="mb-10 px-2 flex-row items-center">
        <FontAwesome name="headphones" size={28} color="#589BE3" />
        <Text className="text-white font-bold text-xl ml-3 tracking-wider">EasyListening</Text>
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
         <Text className="text-xs text-ocean/30">EasyListening.com Player v1.0</Text>
      </View>
    </View>
  );
}
