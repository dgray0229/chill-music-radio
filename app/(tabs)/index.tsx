import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Pressable, ActivityIndicator, ScrollView, FlatList, useWindowDimensions, Platform, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';

const bgImageDesktop = require('@/assets/images/easylistening-bg-desktop.png');
const bgImageMobile = require('@/assets/images/easylistening-bg-mobile.png');

export default function RadioScreen() {
  const { track, isPlaying, isLoading, isFavorite, togglePlayback, toggleFavorite, lyrics, parsedLyrics, trackStartTime, highResArt } = usePlayer();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width > 768;
  const bgImage = isDesktop ? bgImageDesktop : bgImageMobile;
  
  const [streamOffset, setStreamOffset] = useState(10); // Default 10s delay
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const scrollViewRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList>(null);
  const mobileFlatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (activeLyricIndex >= 0 && parsedLyrics && activeLyricIndex < parsedLyrics.length) {
        if (isDesktop && flatListRef.current) {
            flatListRef.current.scrollToIndex({ index: activeLyricIndex, animated: true, viewPosition: 0.5 });
        } else if (!isDesktop && mobileFlatListRef.current) {
            mobileFlatListRef.current.scrollToIndex({ index: activeLyricIndex, animated: true, viewPosition: 0.5 });
        }
    }
  }, [activeLyricIndex, parsedLyrics, isDesktop]);

  useEffect(() => {
    if (!parsedLyrics || !trackStartTime) {
      setActiveLyricIndex(-1);
      return;
    }

    const interval = setInterval(() => {
      // Calculate playback position based on UTC start time and offset
      const startUtcMs = new Date(trackStartTime.replace(' ', 'T') + 'Z').getTime();
      const nowUtcMs = Date.now();
      const playbackPositionSecs = (nowUtcMs - startUtcMs) / 1000 - streamOffset;
      
      let activeIdx = -1;
      for (let i = 0; i < parsedLyrics.length; i++) {
        if (playbackPositionSecs >= parsedLyrics[i].time) {
          activeIdx = i;
        } else {
          break; // Stop loop once we pass current time
        }
      }
      setActiveLyricIndex(activeIdx);
    }, 500);

    return () => clearInterval(interval);
  }, [parsedLyrics, trackStartTime, streamOffset]);

  if (isLoading || !track) {
    return (
      <View className="flex-1 items-center justify-center bg-navy">
        <ActivityIndicator size="large" color="#589BE3" />
      </View>
    );
  }

  const artwork = highResArt || track.albumArt;

  return (
    <View className="flex-1 bg-navy flex-row">
      {/* Subtle background image — woman/ocean from easylistening.com */}
      <Image 
        source={bgImage}
        style={StyleSheet.absoluteFillObject}
        className="opacity-[0.08]"
        resizeMode="cover"
        blurRadius={Platform.OS === 'web' ? 0 : 80}
      />
      {/* Web blur fallback — CSS filter works better than blurRadius on web */}
      {Platform.OS === 'web' && (
        <Image 
          source={bgImage}
          style={[StyleSheet.absoluteFillObject, { filter: 'blur(40px)', opacity: 0.08 } as any]}
          resizeMode="cover"
        />
      )}

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: isDesktop ? 40 : 16, paddingBottom: isDesktop ? 40 : 24, flexGrow: 1 }}>
        <View className="flex-row justify-center mb-8">
            <View className={`w-full aspect-square rounded-3xl overflow-hidden shadow-2xl ${isDesktop ? 'max-w-md' : 'max-w-xs'}`}>
              <Image 
                source={{ uri: artwork }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
        </View>

        <View className="max-w-md w-full self-center flex-1">
            <View className="flex-row justify-between items-start mb-8">
              <View className="flex-1 pr-4">
                <Text className="text-white text-3xl font-bold mb-2" numberOfLines={1}>{track.title}</Text>
                <Text className="text-soft-sky/60 text-xl" numberOfLines={1}>{track.artist}</Text>
              </View>
              <Pressable onPress={toggleFavorite} className="p-2">
                <FontAwesome name={isFavorite ? "heart" : "heart-o"} size={28} color={isFavorite ? "#ff4757" : "rgba(228,235,252,0.5)"} />
              </Pressable>
            </View>

            {/* Playback Progress Simulation */}
            <View className="w-full h-1 bg-ocean/30 rounded-full mb-8 overflow-hidden">
              <View className="h-full bg-ocean w-full rounded-full animate-pulse" />
            </View>

            {/* We only show big controls on mobile, as desktop has PlayerBar */}
            {!isDesktop && (
                <View className="flex-1 justify-end pb-4">
                  <View className="flex-row justify-center items-center">
                    <Pressable 
                      onPress={togglePlayback}
                      className="w-20 h-20 bg-white rounded-full items-center justify-center shadow-lg active:opacity-80"
                    >
                      <FontAwesome name={isPlaying ? "pause" : "play"} size={32} color="#002F5E" style={{ marginLeft: isPlaying ? 0 : 5 }} />
                    </Pressable>
                  </View>
                </View>
            )}

            {/* Mobile Lyrics Section */}
            {!isDesktop && Boolean(lyrics) && (
                <View className="w-full mt-12 bg-navy-light/80 rounded-3xl p-6 relative overflow-hidden h-[400px] mb-8">
                    <Image 
                       source={{ uri: artwork }}
                       className="absolute inset-0 w-full h-full opacity-20"
                       blurRadius={50}
                    />
                    <View className="flex-row items-center justify-between z-10 mb-6">
                        <Text className="text-white text-xl font-bold">Lyrics</Text>
                    </View>

                    {parsedLyrics ? (
                        <FlatList
                            ref={mobileFlatListRef}
                            data={parsedLyrics}
                            keyExtractor={(_, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            className="flex-1 z-10"
                            contentContainerStyle={{ paddingBottom: 150 }}
                            onScrollToIndexFailed={(info) => {
                                const wait = new Promise(resolve => setTimeout(resolve, 500));
                                wait.then(() => {
                                    mobileFlatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                                });
                            }}
                            renderItem={({ item, index }) => (
                                <Text 
                                  className={`text-lg leading-10 px-4 ${index === activeLyricIndex ? 'text-white text-2xl font-bold' : 'text-soft-sky/40 font-medium'}`}
                                >
                                    {item.text}
                                </Text>
                            )}
                        />
                    ) : (
                        <ScrollView className="flex-1 z-10" nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                            <Text className="text-soft-sky/80 text-lg leading-10 font-medium pb-8">
                                {lyrics}
                            </Text>
                        </ScrollView>
                    )}
                </View>
            )}
        </View>
      </ScrollView>

      {/* Lyrics Panel on Desktop */}
      {isDesktop && Boolean(lyrics) && (
          <View className="w-96 bg-navy-light border-l border-ocean/20 p-6 relative overflow-hidden">
              {/* Blurred background artwork */}
              <Image 
                 source={{ uri: artwork }}
                 className="absolute inset-0 w-full h-full opacity-20"
                 blurRadius={50}
              />
              
              <View className="flex-row items-center justify-between z-10 mb-6">
                <Text className="text-white text-xl font-bold">Lyrics</Text>
                {parsedLyrics && (
                  <View className="flex-row items-center space-x-3 bg-navy-deep/70 rounded-full px-3 py-1.5">
                    <Pressable onPress={() => setStreamOffset(prev => prev - 1)} className="p-1">
                        <FontAwesome name="minus" size={14} color="#589BE3" />
                    </Pressable>
                    <Text className="text-soft-sky/60 text-xs font-medium text-center w-12">
                        {streamOffset >= 0 ? `-${streamOffset}s` : `+${Math.abs(streamOffset)}s`}
                    </Text>
                    <Pressable onPress={() => setStreamOffset(prev => prev + 1)} className="p-1">
                        <FontAwesome name="plus" size={14} color="#589BE3" />
                    </Pressable>
                  </View>
                )}
              </View>

              {parsedLyrics ? (
                  <FlatList
                      ref={flatListRef}
                      data={parsedLyrics}
                      keyExtractor={(_, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      className="flex-1 z-10"
                      contentContainerStyle={{ paddingTop: 40, paddingBottom: 250 }}
                      onScrollToIndexFailed={(info) => {
                          const wait = new Promise(resolve => setTimeout(resolve, 500));
                          wait.then(() => {
                              flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.5 });
                          });
                      }}
                      renderItem={({ item, index }) => (
                          <Text 
                            className={`text-lg leading-10 px-4 ${index === activeLyricIndex ? 'text-white text-2xl font-bold' : 'text-soft-sky/40 font-medium'}`}
                          >
                              {item.text}
                          </Text>
                      )}
                  />
              ) : (
                  <ScrollView className="flex-1 z-10" showsVerticalScrollIndicator={false}>
                      <Text className="text-soft-sky/80 text-lg leading-10 font-medium pb-24">
                          {lyrics}
                      </Text>
                  </ScrollView>
              )}
          </View>
      )}
    </View>
  );
}
