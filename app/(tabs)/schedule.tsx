import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { fetchSchedule, ShowSchedule } from '@/services/api';

export default function ScheduleScreen() {
  const [schedule, setSchedule] = useState<ShowSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const data = await fetchSchedule();
    setSchedule(data);
    setIsLoading(false);
  };

  const renderItem = ({ item }: { item: ShowSchedule }) => (
    <View className="bg-[#222] p-5 rounded-2xl mb-4 border-l-4 border-white">
      <Text className="text-white font-bold text-xl mb-1">{item.title}</Text>
      <Text className="text-gray-400">{item.start} - {item.end}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#111]">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#111] px-4 pt-6">
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
