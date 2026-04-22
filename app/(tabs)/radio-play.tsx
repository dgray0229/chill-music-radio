import React from 'react';
import { View, Text, ScrollView, Platform, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

export default function RadioPlayScreen() {
  const insets = useSafeAreaInsets();
  const isDesktop = Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 768;

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
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-6 text-center">Want Radio Play?</Text>
          
          <View className="bg-ocean/20 p-5 rounded-2xl mb-6 border border-ocean/30">
            <Text className="text-white text-lg font-bold leading-relaxed text-center">
              To get free radio air-play, first listen to our station. Make sure the song you would like us to play fits our format!
            </Text>
          </View>

          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            If you feel you can really make it, please send us your material. We review every submission and look for tracks that match our unique easy listening format.
          </Text>

          <View className="bg-navy-deep/50 p-6 rounded-2xl mb-8 border border-ocean/10">
            <Text className="text-white font-bold text-xl mb-4">How to Submit:</Text>
            
            <View className="flex-row items-start mb-4">
              <View className="w-8 h-8 rounded-full bg-ocean/20 items-center justify-center mr-3 mt-1">
                <Text className="text-ocean font-bold">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base mb-1">Listen First</Text>
                <Text className="text-soft-sky/60 text-sm">Tune into our station and understand our format before submitting</Text>
              </View>
            </View>
            
            <View className="flex-row items-start mb-4">
              <View className="w-8 h-8 rounded-full bg-ocean/20 items-center justify-center mr-3 mt-1">
                <Text className="text-ocean font-bold">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base mb-1">Prepare Your Music</Text>
                <Text className="text-soft-sky/60 text-sm">High-quality audio files (WAV or 320kbps MP3). You must own the rights to the music.</Text>
              </View>
            </View>
            
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-ocean/20 items-center justify-center mr-3 mt-1">
                <Text className="text-ocean font-bold">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base mb-1">Send It In</Text>
                <Text className="text-soft-sky/60 text-sm">Email your submission to us and we'll review it</Text>
              </View>
            </View>
          </View>

          <Text className="text-soft-sky/80 text-base mb-6 leading-relaxed">
            We also offer special marketing programs for artists who are serious about making it on our station. Contact us for details.
          </Text>

          <Pressable 
            className="bg-ocean py-4 rounded-xl items-center shadow-lg shadow-ocean/30 active:scale-95 transition-transform mb-4"
            onPress={() => Linking.openURL('mailto:contact@easylistening.com?subject=Music%20Submission')}
          >
            <View className="flex-row items-center">
              <FontAwesome name="envelope" size={18} color="#fff" />
              <Text className="text-white font-bold text-lg ml-3">Submit Your Music</Text>
            </View>
          </Pressable>

          <Text className="text-soft-sky/40 text-sm text-center">
            contact@easylistening.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
