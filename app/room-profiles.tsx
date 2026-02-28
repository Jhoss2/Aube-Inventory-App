import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  Platform 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { subId, blocId } = useLocalSearchParams<{ subId: string; blocId: string }>();
  const context = useAppContext();
  const { appData, deleteSalle } = context as any;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = useMemo(() => {
    const allRooms = appData?.salles || [];
    return allRooms.filter((room: any) => {
      const matchSubBloc = room.emplacement === subId || room.subId === subId;
      const matchSearch = room.nom.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSubBloc && matchSearch;
    });
  }, [appData?.salles, subId, searchTerm]);

  const handleDeleteRoom = (id: string, name: string) => {
    Alert.alert("Supprimer", `Supprimer la salle ${name} ?`, [
      { text: "Annuler", style: "cancel" },
      { 
        text: "Supprimer", 
        style: "destructive", 
        onPress: async () => {
          if (deleteSalle) await deleteSalle(id);
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      {/* Header */}
      <View {...({ className: "px-4 py-3 flex-row items-center bg-white border-b border-gray-100 shadow-sm" } as any)}>
        <TouchableOpacity onPress={() => router.back()} {...({ className: "p-2" } as any)}>
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text {...({ className: "flex-1 text-center font-black text-[#1D3583] text-lg uppercase" } as any)}>
          SALLES : {subId}
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/add-room')}
          {...({ className: "p-2" } as any)}
        >
          <Ionicons name="add-circle" size={30} color="#1D3583" />
        </TouchableOpacity>
      </View>

      <View {...({ className: "flex-1 px-4 pt-4" } as any)}>
        {/* Barre de Recherche */}
        <View {...({ className: "relative mb-4" } as any)}>
          <TextInput
            placeholder="Rechercher une salle..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            {...({ className: "w-full bg-white rounded-2xl py-3 pl-12 pr-4 border border-gray-200" } as any)}
          />
          <View {...({ className: "absolute left-4 top-3" } as any)}>
            <Ionicons name="search" size={20} color="#9ca3af" />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredRooms.length === 0 ? (
            <Text {...({ className: "text-center text-gray-400 mt-10" } as any)}>Aucune salle trouvée</Text>
          ) : (
            filteredRooms.map((room: any) => (
              <TouchableOpacity
                key={room.id}
                onPress={() => router.push({
                  pathname: '/categories',
                  params: { salleId: room.id, roomName: room.nom }
                })}
                {...({ className: "bg-white rounded-3xl mb-4 overflow-hidden shadow-sm border border-gray-100" } as any)}
              >
                <View {...({ className: "flex-row p-4 items-center" } as any)}>
                  <View {...({ className: "w-16 h-16 bg-[#FDE7F3] rounded-2xl items-center justify-center" } as any)}>
                    <Ionicons name="business" size={30} color="#1D3583" />
                  </View>
                  
                  <View {...({ className: "flex-1 ml-4" } as any)}>
                    <Text {...({ className: "font-bold text-gray-800 text-lg" } as any)}>{room.nom}</Text>
                    <Text {...({ className: "text-gray-500 text-xs" } as any)}>Niveau: {room.niveau} • Capacité: {room.capacity}</Text>
                  </View>

                  <TouchableOpacity onPress={() => handleDeleteRoom(room.id, room.nom)} {...({ className: "p-2" } as any)}>
                    <Ionicons name="trash-outline" size={20} color="#d1d5db" />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
