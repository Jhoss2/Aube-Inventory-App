import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context'; // Connexion SQLite

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { subBlocId, blocId } = useLocalSearchParams<{ subBlocId: string; blocId: string }>();
  const { appData } = useAppContext();

  // Filtrage des salles appartenant à ce sous-bloc (ex: "Sous-sol" ou "Bloc A")
  const filteredRooms = useMemo(() => {
    return appData.salles.filter((salle) => salle.emplacement === subBlocId);
  }, [appData.salles, subBlocId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* Header avec bouton retour */}
      <View className="px-6 pt-4 flex-row items-center border-b border-gray-100 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        
        {/* Badge Rouge central - Titre du Niveau (Dynamique via SQLite) */}
        <View className="bg-[#B21F18] py-4 rounded-[25px] shadow-lg mb-8 items-center">
          <Text 
            style={{ fontFamily: 'serif' }} 
            className="text-white font-black text-lg uppercase tracking-widest"
          >
            {subBlocId || "SOUS-SOL"}
          </Text>
        </View>

        {/* Titre de la section */}
        <Text className="text-[#1D3583] font-bold text-lg mb-4 ml-1">
          Profils des salles
        </Text>

        {/* Grille des salles */}
        <View className="flex-row flex-wrap gap-4 justify-start">
          {filteredRooms.length === 0 ? (
            /* Carré gris "Aucune salle ajoutée" */
            <View className="w-[30%] aspect-square bg-[#E8EBF2] rounded-3xl items-center justify-center p-4 border border-gray-100">
              <Text className="text-gray-400 text-[10px] text-center font-medium leading-tight">
                Aucune salle ajoutée
              </Text>
            </View>
          ) : (
            /* Affichage des salles réelles de la base de données */
            filteredRooms.map((salle) => (
              <TouchableOpacity 
                key={salle.id} 
                onPress={() => router.push({ pathname: '/screens/room-details', params: { salleId: salle.id } })}
                className="w-[30%] aspect-square bg-white rounded-3xl items-center justify-center p-2 shadow-md border border-gray-100"
              >
                <Text className="text-[#1D3583] font-bold text-xs text-center mb-1">
                  {salle.nom}
                </Text>
                <Text className="text-gray-400 text-[8px] uppercase font-bold text-center">
                  {salle.niveau}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bouton d'action flottant (+) en bas à droite */}
      <TouchableOpacity 
        onPress={() => router.push({ pathname: '/screens/add-room', params: { subBlocId } })}
        className="absolute bottom-10 right-6 w-16 h-16 bg-[#F44336] rounded-full items-center justify-center shadow-2xl active:scale-90"
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}
