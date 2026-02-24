import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { subBlocId, blocId } = useLocalSearchParams<{ subBlocId: string; blocId: string }>();
  const { appData, deleteSalle } = useAppContext();
  const [longPressedRoomId, setLongPressedRoomId] = useState<string | null>(null);

  // Filter rooms by sub-bloc (emplacement)
  const filteredRooms = useMemo(() => {
    return appData.salles.filter((salle) => salle.emplacement === subBlocId);
  }, [appData.salles, subBlocId]);

  // Group rooms by niveau
  const groupedRooms = useMemo(() => {
    const groups: Record<string, typeof filteredRooms> = {};
    filteredRooms.forEach((room) => {
      if (!groups[room.niveau]) {
        groups[room.niveau] = [];
      }
      groups[room.niveau].push(room);
    });
    return groups;
  }, [filteredRooms]);

  const handleRoomPress = (salleId: string) => {
    router.push({
      pathname: '/screens/room-details',
      params: { salleId: salleId },
    });
  };

  const handleDeleteRoom = async (salleId: string) => {
    Alert.alert(
      'Supprimer la salle',
      'Êtes-vous sûr de vouloir supprimer cette salle ?',
      [
        { text: 'Annuler', onPress: () => setLongPressedRoomId(null) },
        {
          text: 'Supprimer',
          onPress: async () => {
            await deleteSalle(salleId);
            setLongPressedRoomId(null);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddRoom = () => {
    router.push({
      pathname: '/screens/add-room',
      params: { subBlocId, blocId },
    });
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-700 font-semibold">Profils des salles</Text>
        <TouchableOpacity onPress={handleAddRoom} className="p-2">
          <Ionicons name="add-circle" size={28} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {Object.entries(groupedRooms).length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="folder-open" size={48} color="#d1d5db" />
            <Text className="text-gray-500 mt-4">Aucune salle trouvée</Text>
          </View>
        ) : (
          Object.entries(groupedRooms).map(([niveau, rooms]) => (
            <View key={niveau} className="mb-6">
              <Text className="text-gray-600 font-semibold text-sm mb-3 px-2">Niveau: {niveau}</Text>

              <View className="gap-2">
                {rooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    onPress={() => handleRoomPress(room.id)}
                    onLongPress={() => setLongPressedRoomId(room.id)}
                    className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                      longPressedRoomId === room.id ? 'border-red-500 bg-red-50' : 'border-yellow-400'
                    }`}
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold text-base">{room.nom}</Text>
                        <Text className="text-gray-600 text-xs mt-1">
                          Emplacement: {room.emplacement}
                        </Text>
                        {room.capacity && (
                          <Text className="text-gray-500 text-xs mt-1">Capacité: {room.capacity}</Text>
                        )}
                      </View>

                      {longPressedRoomId === room.id && (
                        <TouchableOpacity
                          onPress={() => handleDeleteRoom(room.id)}
                          className="ml-2 p-2 bg-red-500 rounded-lg"
                        >
                          <Ionicons name="trash" size={16} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
