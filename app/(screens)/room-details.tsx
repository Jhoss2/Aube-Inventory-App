import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const { appData } = useAppContext();

  // Récupération de la salle précise dans SQLite
  const room = appData.salles.find((s) => s.id === salleId);

  if (!room) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FDE7F3]">
        <Text>Salle introuvable</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-[#1D3583] px-6 py-2 rounded-full">
          <Text className="text-white">Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDE7F3' }}>
      
      {/* Header */}
      <View className="px-4 py-2 flex-row items-center bg-white/50">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-2 bg-white rounded-full shadow-sm"
        >
          <Ionicons name="chevron-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-gray-700 text-lg mr-10">
          {room.nom}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Titre Rouge "Détails de..." */}
        <View className="w-full bg-[#B21F18] py-4 rounded-[25px] shadow-lg mb-6">
          <Text className="text-white text-center font-bold text-lg uppercase tracking-wide">
            Détails de {room.nom}
          </Text>
        </View>

        {/* Carte des informations (SQLite) */}
        <View className="bg-white rounded-[30px] p-6 shadow-sm border border-white/50 mb-6">
          <View className="flex-row justify-between items-center border-b border-gray-50 pb-3 mb-3">
            <Text className="text-[#1D3583] font-black text-lg">Capacité:</Text>
            <Text className="text-gray-600 font-bold text-lg">{room.capacity || 'N/A'}</Text>
          </View>
          <div className="flex-row justify-between items-center">
            <Text className="text-[#1D3583] font-black text-lg">Superficie:</Text>
            <Text className="text-gray-600 font-bold text-lg">{room.area || 'N/A'} m²</Text>
          </div>
        </View>

        {/* Zone Plan 3D / Architecture */}
        <View className="bg-white rounded-[30px] p-5 shadow-sm border border-white/50 mb-8">
          <Text className="text-gray-400 font-bold text-[10px] uppercase mb-4 ml-2">
            Plan 3D / Architecture
          </Text>
          <TouchableOpacity className="bg-[#F8F9FB] rounded-[20px] py-10 items-center justify-center border border-gray-100 active:scale-[0.98]">
            <View className="w-16 h-16 bg-white rounded-2xl shadow-md items-center justify-center mb-3">
              <MaterialCommunityIcons name="cube-outline" size={32} color="#2563eb" />
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="eye-outline" size={18} color="#2563eb" />
              <Text className="text-[#2563eb] font-bold">Voir le plan</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Boutons d'action */}
        <View className="gap-y-4">
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/screens/room-contents', params: { salleId: room.id } })}
            className="w-full bg-[#1D3583] py-5 rounded-full shadow-xl items-center"
          >
            <Text className="text-white font-bold text-lg uppercase tracking-wide">
              Afficher le matériel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => console.log("Ajouter matériel")}
            className="w-full bg-[#1D3583] py-5 rounded-full shadow-xl items-center"
          >
            <Text className="text-white font-bold text-lg uppercase tracking-wide">
              Ajouter du matériel
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
      }
