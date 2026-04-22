import React from 'react';
import { View, Text, Pressable, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { palette } from '@/constants/Colors';

interface MenuItem {
  name: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  ionicon?: React.ComponentProps<typeof Ionicons>['name'];
  path: string;
  subtitle?: string;
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Browse',
    items: [
      { name: 'Schedule', icon: 'calendar', path: '/schedule', subtitle: 'See what\'s playing' },
      { name: 'About Us', icon: 'info-circle', path: '/about', subtitle: 'Our story' },
      { name: 'Want Radio Play?', icon: 'music', path: '/radio-play', subtitle: 'Submit your music' },
      { name: 'Contact', icon: 'envelope', path: '/contact', subtitle: 'Get in touch' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { name: 'Terms & Conditions', icon: 'file-text-o', path: '/terms' },
      { name: 'Privacy Policy', icon: 'shield', path: '/privacy' },
    ],
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;

  return (
    <View className="flex-1 bg-navy-deep relative overflow-hidden">
      <LinearGradient
        colors={[palette.deepNavy, palette.oceanBlue]}
        className="absolute w-full h-full opacity-30"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: isDesktop ? 60 : 16,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 16,
        }}
      >
        {menuSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="text-soft-sky/40 text-xs font-bold uppercase tracking-wider px-4 mb-2">
              {section.title}
            </Text>
            <View className="bg-navy-light/60 rounded-2xl overflow-hidden border border-ocean/10">
              {section.items.map((item, index) => (
                <Pressable
                  key={item.name}
                  onPress={() => router.push(item.path as any)}
                  className="active:bg-ocean/10"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: index < section.items.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(88,155,227,0.1)',
                  }}
                >
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: 'rgba(88,155,227,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}>
                    <FontAwesome name={item.icon} size={18} color="#589BE3" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-white font-semibold text-base">{item.name}</Text>
                    {item.subtitle && (
                      <Text className="text-soft-sky/40 text-xs mt-0.5">{item.subtitle}</Text>
                    )}
                  </View>
                  <FontAwesome name="chevron-right" size={12} color="rgba(228,235,252,0.25)" />
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Copyright */}
        <View className="mt-4 px-4">
          <Text className="text-soft-sky/20 text-xs text-center leading-5">
            © 2026 EasyListening.com. All rights reserved.{'\n'}
            Licensed with ASCAP, BMI, SESAC
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
