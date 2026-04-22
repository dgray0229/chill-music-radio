import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { palette } from '@/constants/Colors';

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === 'web' && window.innerWidth > 768;

  return (
    <View className="flex-1 bg-navy-deep relative overflow-hidden">
      <LinearGradient
        colors={[palette.deepNavy, palette.oceanBlue]}
        className="absolute w-full h-full opacity-30"
      />
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ 
          paddingTop: isDesktop ? 60 : Math.max(insets.top + 20, 40),
          paddingBottom: isDesktop ? 60 : insets.bottom + 120,
          paddingHorizontal: 24,
          alignItems: 'center'
        }}
      >
        <View className="w-full max-w-2xl bg-navy-light/80 p-8 rounded-3xl backdrop-blur-md border border-ocean/20">
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-6 text-center">About Us</Text>
          
          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            Welcome to EasyListening Radio, your premier destination for the most relaxing and ambient sounds on the web. Our mission is to provide a curated musical escape from the hustle and bustle of daily life.
          </Text>

          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            Whether you're studying, working, or just taking a moment to breathe, our hand-selected tracks are designed to foster focus, peace, and positive energy. We believe in the power of music to transform any environment into a serene oasis.
          </Text>

          <Text className="text-ocean text-lg font-bold text-center mt-4">
            Tune in, relax, and let the waves of sound wash over you.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
