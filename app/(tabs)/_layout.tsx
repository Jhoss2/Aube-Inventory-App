import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { appData, isLoading } = useAppContext();

  if (isLoading) return <View className="flex-1 bg-[#fde7f3]" />;

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      <View className="bg-[#b91c1c] px-4 py-3 flex-row justify-between items-center rounded-full shadow-md mb-4 mt-2">
        <Ionicons name="menu" size={28} color="white" />
        <Text style={{ fontFamily: 'Algerian' }} className="text-white text-lg">U-AUBEN TRACKER</Text>
        <TouchableOpacity onPress={() => router.push('/screens/settings')}>
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* L'IMAGE DE L'UNIVERSITE (Ton original) */}
        <View className="bg-white rounded-[30px] shadow-lg overflow-hidden mb-6 mx-2">
          <Image 
            source={{ uri: appData.general.mainBuildingImage }} 
            style={{ width: '100%', height: 200 }} 
          />
          <Text style={{ fontFamily: 'Monotype-Corsiva' }} className="text-center p-2 text-gray-600">
            · Université Aube Nouvelle ·
          </Text>
        </View>

        {/* GRILLE DES BLOCS */}
        <View className="flex-row flex-wrap justify-between px-2">
          {['A', 'B', 'C', 'D', 'E', 'F'].map((id) => (
            <TouchableOpacity 
              key={id}
              onPress={() => router.push({ pathname: '/screens/bloc-details', params: { blocId: id } })}
              className="w-[48%] bg-white rounded-[30px] p-6 mb-4 items-center shadow-sm border border-gray-100"
            >
              <View className="bg-[#1e3a8a] p-3 rounded-full mb-2">
                <Ionicons name="business" size={24} color="white" />
              </View>
              <Text className="font-bold text-[#1e3a8a]">Bloc {id}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
