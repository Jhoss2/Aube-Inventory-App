import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context'; // Pour la cohérence des données

export default function SubdivisionScreen() {
  const router = useRouter();
  const { blocId } = useLocalSearchParams<{ blocId: string }>();
  
  // Liste des niveaux (Tu peux aussi les rendre dynamiques via SQLite si besoin)
  const niveaux = [
    "Sous-sol",
    "Rez-de-chaussée",
    "Premier Niveau",
    "Deuxième Niveau",
    "Troisième Niveau",
    "Quatrième Niveau"
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* Header avec bouton retour */}
      <View className="px-4 pt-4 flex-row items-center border-b border-gray-50 pb-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 40 }}>
        
        {/* Badge Rouge "BLOC X" - Dynamique */}
        <View className="w-full bg-[#B21F18] py-5 rounded-[30px] shadow-lg items-center">
          <Text 
            style={{ fontFamily: 'serif' }} 
            className="text-white font-black text-xl uppercase tracking-[4px]"
          >
            BLOC {blocId || 'A1'}
          </Text>
        </View>

        {/* Sous-titre "NIVEAUX DE SUBDIVISION" */}
        <View className="w-full border border-gray-100 py-4 rounded-full shadow-sm bg-white items-center justify-center mt-8 relative">
          {/* Petit cercle décoratif au centre */}
          <View className="absolute -top-4 bg-white border border-gray-100 w-8 h-8 rounded-full items-center justify-center shadow-sm">
             <View className="w-4 h-4 border-2 border-blue-100 rounded-full" />
          </View>
          <Text className="text-[#1D3583] font-bold text-[12px] tracking-[2px] uppercase">
            · Niveaux de Subdivision ·
          </Text>
        </View>

        {/* Liste des boutons de niveaux */}
        <View className="w-full mt-6 gap-y-4">
          {niveaux.map((niveau, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => router.push({
                pathname: '/screens/room-profiles',
                params: { subBlocId: niveau, blocId: blocId }
              })}
              className="w-full bg-[#1D3583] py-5 rounded-full shadow-md active:opacity-90"
            >
              <Text className="text-white text-center font-bold text-sm tracking-widest">
                · {niveau.toUpperCase()} ·
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
}
