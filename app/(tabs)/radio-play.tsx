import React from 'react';
import { View, Text, ScrollView, Platform, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { palette } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

export default function RadioPlayScreen() {
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
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-6 text-center">Want Radio Play?</Text>
          
          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            Are you an independent artist, producer, or composer creating relaxing, ambient, or chillout music? We'd love to feature your work on EasyListening Radio!
          </Text>

          <View className="bg-navy-deep/50 p-6 rounded-2xl mb-8 border border-ocean/10">
            <Text className="text-white font-bold text-xl mb-4">Submission Guidelines:</Text>
            
            <View className="flex-row items-center mb-3">
              <FontAwesome name="check-circle" size={20} color="#589BE3" className="mr-3" />
              <Text className="text-soft-sky/80 text-base">High-quality audio files (WAV or 320kbps MP3)</Text>
            </View>
            
            <View className="flex-row items-center mb-3">
              <FontAwesome name="check-circle" size={20} color="#589BE3" className="mr-3" />
              <Text className="text-soft-sky/80 text-base">Relaxing, ambient, lo-fi, or downtempo genres</Text>
            </View>
            
            <View className="flex-row items-center">
              <FontAwesome name="check-circle" size={20} color="#589BE3" className="mr-3" />
              <Text className="text-soft-sky/80 text-base">You must own the rights to the music</Text>
            </View>
          </View>

          <Pressable 
            className="bg-ocean py-4 rounded-xl items-center shadow-lg shadow-ocean/30 active:scale-95 transition-transform"
            onPress={() => Linking.openURL('mailto:submit@easylistening.com')}
          >
            <Text className="text-white font-bold text-lg">Submit Your Music</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
