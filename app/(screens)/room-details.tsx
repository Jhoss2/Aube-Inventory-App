import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const { appData } = useAppContext();

  const room = appData.salles.find((s) => s.id === salleId);

  if (!room) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Salle non trouvée</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-700 font-semibold">Détails de la salle</Text>
        <View className="w-10"></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">{room.nom}</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Emplacement:</Text>
              <Text className="text-gray-800 font-semibold">{room.emplacement}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Niveau:</Text>
              <Text className="text-gray-800 font-semibold">{room.niveau}</Text>
            </View>
            {room.capacity && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Capacité:</Text>
                <Text className="text-gray-800 font-semibold">{room.capacity}</Text>
              </View>
            )}
            {room.area && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Surface:</Text>
                <Text className="text-gray-800 font-semibold">{room.area}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push({ pathname: '/screens/room-contents', params: { salleId: salleId } })}
          className="bg-blue-600 rounded-lg py-3 items-center mb-4"
        >
          <Text className="text-white font-semibold">Voir le contenu</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
