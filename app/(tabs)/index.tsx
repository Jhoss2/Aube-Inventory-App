import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const blocs = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header Rouge Arrondi Original */}
      <View className="bg-[#b91c1c] px-4 py-3 flex-row justify-between items-center rounded-full shadow-md mb-4 mt-2">
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Algerian' }} className="text-white text-lg font-bold">U-AUBEN TRACKER</Text>
        <TouchableOpacity onPress={() => router.push('/screens/settings')}>
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Grille des blocs */}
        <View className="flex-row flex-wrap justify-between px-2">
          {blocs.map((id) => (
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

        {/* Bouton Université Aube Nouvelle */}
        <TouchableOpacity 
          onPress={() => router.push('/screens/aube-chat')}
          className="bg-[#1e3a8a] mx-2 py-4 rounded-[20px] items-center shadow-md mt-2"
        >
          <Text style={{ fontFamily: 'Algerian' }} className="text-white text-base font-bold">UNIVERSITE AUBE NOUVELLE</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
