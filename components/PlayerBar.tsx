import React from 'react';
import { View, Text, Pressable, Image, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { usePlayer } from '@/context/PlayerContext';

export function PlayerBar() {
  const { track, isPlaying, togglePlayback, isFavorite, toggleFavorite, volume, setVolume, highResArt } = usePlayer();

  if (!track) return null;

  const artwork = highResArt || track.albumArt;

  return (
    <View className="h-24 bg-navy-light border-t border-ocean/20 flex-row items-center px-4 justify-between">
      {/* Left: Track Info */}
      <View className="flex-row items-center w-1/3">
        <Image source={{ uri: artwork }} className="w-16 h-16 rounded-md mr-4" />
        <View className="flex-1 overflow-hidden" style={Platform.OS === 'web' ? { whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column' } as any : {}}>
          <View style={Platform.OS === 'web' && track.title.length > 35 ? { display: 'inline-block', whiteSpace: 'nowrap' } as any : {}}>
            <Text 
              className={`text-white font-bold text-sm ${track.title.length > 35 ? 'animate-marquee' : ''}`} 
              numberOfLines={track.title.length > 35 ? undefined : 1}
            >
              {track.title}
            </Text>
          </View>
          <Text className="text-soft-sky/60 text-xs mt-1" numberOfLines={1}>{track.artist}</Text>
        </View>
        <Pressable onPress={toggleFavorite} className="ml-4 p-2">
          <FontAwesome name={isFavorite ? "heart" : "heart-o"} size={20} color={isFavorite ? "#ff4757" : "rgba(228,235,252,0.5)"} />
        </Pressable>
      </View>

      {/* Center: Controls */}
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center space-x-6">
          <Pressable className="p-2">
            <FontAwesome name="step-backward" size={20} color="rgba(228,235,252,0.5)" />
          </Pressable>
          <Pressable 
            onPress={togglePlayback}
            className="w-12 h-12 bg-white rounded-full items-center justify-center hover:scale-105 transition-transform"
          >
            <FontAwesome name={isPlaying ? "pause" : "play"} size={20} color="#002F5E" style={{ marginLeft: isPlaying ? 0 : 3 }} />
          </Pressable>
          <Pressable className="p-2">
            <FontAwesome name="step-forward" size={20} color="rgba(228,235,252,0.5)" />
          </Pressable>
        </View>
        <View className="w-full max-w-md h-1 bg-ocean/30 rounded-full mt-3 overflow-hidden">
            <View className="h-full bg-ocean w-full rounded-full animate-pulse" />
        </View>
      </View>

      {/* Right: Volume */}
      <View className="flex-row items-center justify-end w-1/3 space-x-2">
        <FontAwesome name="volume-up" size={16} color="rgba(228,235,252,0.5)" />
        <View className="w-24 h-1 bg-ocean/30 rounded-full ml-2 relative">
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
              <View className="h-1 bg-ocean rounded-full mt-2.5" style={{ width: `${volume * 100}%` }} />
           </Pressable>
        </View>
      </View>
    </View>
  );
}
