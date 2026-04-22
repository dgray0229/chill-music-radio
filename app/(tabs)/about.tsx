import React from 'react';
import { View, Text, ScrollView, Platform, Pressable, Linking, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { palette } from '@/constants/Colors';

export default function AboutScreen() {
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
          alignItems: 'center'
        }}
      >
        <View className="w-full max-w-2xl bg-navy-light/80 p-8 rounded-3xl backdrop-blur-md border border-ocean/20">
          <Text style={{ fontFamily: 'Pacifico' }} className="text-4xl text-white mb-6 text-center">About Us</Text>
          
          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            Easy Listening plays the greatest songs ever recorded! We know that every artist and band has a soft spot in them, and that is one criteria among many that we decide what and who we play on our station.
          </Text>

          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            We try to get songs that have not been overplayed over the years, and if they have, that really makes them a great song if you're hearing them on our station!
          </Text>

          <View className="bg-navy-deep/50 p-6 rounded-2xl mb-6 border border-ocean/10">
            <Text className="text-soft-sky/80 text-lg leading-relaxed">
              We know at times we play some tracks that are just a little bit harder than other Easy Listening stations, but that's what makes us different! EasyListening.com has created a whole new type of music playlist and format than the typical listener would ever expect to hear on an Easy Listening station.
            </Text>
          </View>

          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            Most great artists have a soft side to them and that is where our choice of songs come from. Just kick back and relax here on EasyListening.com, and enjoy our station!
          </Text>

          <Text className="text-soft-sky/80 text-lg mb-6 leading-relaxed">
            If you are an indie artist — or were signed and trying to make a comeback — and want to try to make it here on our station, check out our "Want Radio Play?" page. We also offer special programs to make it on our station if you really think you're that good.
          </Text>

          <View className="bg-navy-deep/40 p-5 rounded-2xl border border-ocean/10 mb-6">
            <View className="flex-row items-center mb-2">
              <FontAwesome name="headphones" size={20} color="#589BE3" />
              <Text className="text-white font-bold text-lg ml-3">No commercials, only great music!</Text>
            </View>
            <Text className="text-soft-sky/50 text-sm">(Real Time Streaming)</Text>
          </View>

          <Pressable onPress={() => Linking.openURL('mailto:contact@easylistening.com')}>
            <Text className="text-ocean text-lg font-bold text-center mb-4">
              contact@easylistening.com
            </Text>
          </Pressable>

          <Text className="text-ocean text-xl font-bold text-center mt-2" style={{ fontFamily: 'Pacifico' }}>
            We live for music!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
