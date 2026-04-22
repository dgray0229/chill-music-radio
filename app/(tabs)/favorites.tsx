import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Image, Pressable } from 'react-native';
import { database } from '@/db';
import FavoriteTrack from '@/db/models/FavoriteTrack';
import { FontAwesome } from '@expo/vector-icons';
import { audioService } from '@/services/audio';
import { useFocusEffect } from 'expo-router';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const tracks = await database.get<FavoriteTrack>('favorite_tracks').query().fetch();
    setFavorites(tracks);
  };

  const playFavorite = async (track: FavoriteTrack) => {
    if (track.streamUrl) {
      await audioService.play(track.streamUrl, {
        title: track.title,
        artist: track.artist,
        artwork: track.albumArt || ''
      });
    }
  };

  const renderItem = ({ item }: { item: FavoriteTrack }) => (
    <Pressable 
        onPress={() => playFavorite(item)}
        className="flex-row items-center bg-[#222] p-4 rounded-2xl mb-4"
    >
      <Image 
        source={{ uri: item.albumArt || 'https://via.placeholder.com/150' }} 
        className="w-16 h-16 rounded-lg mr-4"
      />
      <View className="flex-1">
        <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.title}</Text>
        <Text className="text-gray-400" numberOfLines={1}>{item.artist}</Text>
      </View>
      <FontAwesome name="play-circle" size={32} color="#fff" />
    </Pressable>
  );

  return (
    <View className="flex-1 bg-[#111] px-4 pt-6">
      {favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center">
            <FontAwesome name="heart-o" size={48} color="#444" style={{ marginBottom: 16 }} />
            <Text className="text-gray-400 text-lg">No favorite tracks yet.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
