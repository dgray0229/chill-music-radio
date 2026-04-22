import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';

export function PlayerBar() {
  const { track, isPlaying, togglePlayback, isFavorite, toggleFavorite, volume, setVolume, highResArt } = usePlayer();

  if (!track) return null;

  const artwork = highResArt || track.albumArt;

  return (
    <View className="h-24 bg-[#181818] border-t border-[#282828] flex-row items-center px-4 justify-between">
      {/* Left: Track Info */}
      <View className="flex-row items-center w-1/3">
        <Image source={{ uri: artwork }} className="w-16 h-16 rounded-md mr-4" />
        <View className="flex-1">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>{track.title}</Text>
          <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>{track.artist}</Text>
        </View>
        <Pressable onPress={toggleFavorite} className="ml-4 p-2">
          <FontAwesome name={isFavorite ? "heart" : "heart-o"} size={20} color={isFavorite ? "#ff4757" : "#888"} />
        </Pressable>
      </View>

      {/* Center: Controls */}
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center space-x-6">
          <Pressable className="p-2">
            <FontAwesome name="step-backward" size={20} color="#888" />
          </Pressable>
          <Pressable 
            onPress={togglePlayback}
            className="w-12 h-12 bg-white rounded-full items-center justify-center hover:scale-105 transition-transform"
          >
            <FontAwesome name={isPlaying ? "pause" : "play"} size={20} color="#000" style={{ marginLeft: isPlaying ? 0 : 3 }} />
          </Pressable>
          <Pressable className="p-2">
            <FontAwesome name="step-forward" size={20} color="#888" />
          </Pressable>
        </View>
        <View className="w-full max-w-md h-1 bg-gray-600 rounded-full mt-3 overflow-hidden">
            <View className="h-full bg-white w-full rounded-full animate-pulse" />
        </View>
      </View>

      {/* Right: Volume */}
      <View className="flex-row items-center justify-end w-1/3 space-x-2">
        <FontAwesome name="volume-up" size={16} color="#888" />
        <View className="w-24 h-1 bg-gray-600 rounded-full ml-2 relative">
           <Pressable 
             style={{ width: '100%', height: 20, position: 'absolute', top: -10 }} 
             onPress={(e) => {
               // @ts-ignore - Web only quick calculation
               if (e.nativeEvent.offsetX !== undefined) {
                   const newVol = Math.max(0, Math.min(1, e.nativeEvent.offsetX / 96));
                   setVolume(newVol);
               }
             }}
           >
              <View className="h-1 bg-white rounded-full mt-2.5" style={{ width: `${volume * 100}%` }} />
           </Pressable>
        </View>
      </View>
    </View>
  );
}
