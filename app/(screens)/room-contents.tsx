import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const { appData } = useAppContext();

  const materielList = appData.materiel.filter((m) => m.salleId === salleId);
  const room = appData.salles.find((s) => s.id === salleId);

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-700 font-semibold">Contenu - {room?.nom}</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="add-circle" size={28} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {materielList.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="folder-open" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Aucun matériel</Text>
          </View>
        ) : (
          <View className="gap-2">
            {materielList.map((item) => (
              <TouchableOpacity key={item.id} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-400">
                <Text className="text-gray-800 font-bold">{item.nom}</Text>
                {item.categorie && <Text className="text-gray-600 text-sm mt-1">{item.categorie}</Text>}
                {item.dateRen && <Text className="text-gray-500 text-xs mt-1">Renouvellement: {item.dateRen}</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
