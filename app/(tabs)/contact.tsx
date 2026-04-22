import React from 'react';
import { View, Text, ScrollView, Platform, Pressable, Linking, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
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
          paddingTop: isDesktop ? 60 : Math.max(insets.top + 20, 40),
          paddingBottom: isDesktop ? 60 : insets.bottom + 120,
          paddingHorizontal: 24,
          alignItems: 'center',
          flexGrow: 1,
          justifyContent: 'center',
        }}
      >
        <View className="w-full max-w-xl bg-navy-light/80 p-8 rounded-3xl backdrop-blur-md border border-ocean/20">
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-2 text-center">
            Contact Us
          </Text>
          <Text className="text-soft-sky/50 text-base text-center mb-8">
            We'd love to hear from you
          </Text>

          {/* Email Card */}
          <Pressable
            onPress={() => Linking.openURL('mailto:contact@easylistening.com')}
            className="bg-navy-deep/60 p-6 rounded-2xl mb-6 border border-ocean/20 flex-row items-center active:bg-ocean/20"
          >
            <View className="w-14 h-14 rounded-full bg-ocean/20 items-center justify-center mr-4">
              <FontAwesome name="envelope" size={24} color="#589BE3" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">Email Us</Text>
              <Text className="text-ocean text-base">contact@easylistening.com</Text>
            </View>
            <FontAwesome name="external-link" size={16} color="rgba(228,235,252,0.4)" />
          </Pressable>

          {/* Music Submission Card */}
          <Pressable
            onPress={() => Linking.openURL('mailto:contact@easylistening.com?subject=Music%20Submission')}
            className="bg-navy-deep/60 p-6 rounded-2xl mb-6 border border-ocean/20 flex-row items-center active:bg-ocean/20"
          >
            <View className="w-14 h-14 rounded-full bg-ocean/20 items-center justify-center mr-4">
              <FontAwesome name="music" size={24} color="#589BE3" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-lg mb-1">Submit Music</Text>
              <Text className="text-soft-sky/60 text-sm">Want airplay? Send us your tracks</Text>
            </View>
            <FontAwesome name="external-link" size={16} color="rgba(228,235,252,0.4)" />
          </Pressable>

          {/* Licensing Info */}
          <View className="bg-navy-deep/40 p-5 rounded-2xl border border-ocean/10 mt-2">
            <Text className="text-white font-bold text-base mb-3 text-center">Licensing</Text>
            <Text className="text-soft-sky/60 text-sm text-center leading-6">
              EasyListening.com is officially licensed with{'\n'}
              <Text className="text-soft-sky/80 font-semibold">ASCAP</Text> • <Text className="text-soft-sky/80 font-semibold">BMI</Text> • <Text className="text-soft-sky/80 font-semibold">SESAC</Text>
            </Text>
          </View>

          <Text className="text-soft-sky/30 text-xs text-center mt-6">
            © 2026 EasyListening.com. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
