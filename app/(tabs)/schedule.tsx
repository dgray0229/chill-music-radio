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

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr.replace(' ', 'T') + 'Z');
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
        return dateStr;
    }
  };

  const renderItem = ({ item }: { item: ShowSchedule }) => (
    <View className="bg-navy-light p-5 rounded-2xl mb-4 border-l-4 border-ocean flex-col">
      <Text className="text-white font-bold text-xl mb-2 flex-wrap" numberOfLines={2}>{item.title}</Text>
      <View className="flex-row items-center">
          <Text className="text-soft-sky/60 font-medium">{formatTime(item.start)}</Text>
          {item.end && <Text className="text-soft-sky/60 font-medium"> - {formatTime(item.end)}</Text>}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-navy">
        <ActivityIndicator size="large" color="#589BE3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy px-4 pt-6">
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
