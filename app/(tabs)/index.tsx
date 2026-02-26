import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const blocs = ['Bloc A', 'Bloc B', 'Bloc C', 'Bloc D', 'Bloc E', 'Bloc F'];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header Rouge avec arrondis bas 40px */}
      <View className="bg-[#b91c1c] p-6 rounded-b-[40px] shadow-xl">
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => {/* Action Menu */}}>
            <Ionicons name="menu" size={30} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-xl font-algerian tracking-widest">U-AUBEN TRACKER</Text>
          <TouchableOpacity onPress={() => router.push('/(screens)/settings')}>
            <Ionicons name="settings-sharp" size={26} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Barre de recherche arrondie */}
        <View className="bg-white rounded-full flex-row items-center px-5 py-3 shadow-inner">
          <Ionicons name="search" size={20} color="#b91c1c" />
          <TextInput 
            placeholder="Que cherchez vous aujourd'hui ?" 
            className="ml-3 flex-1 text-slate-800"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Sélecteur de Blocs stylisé */}
        <View className="mt-8">
          <Text className="text-[#1e3a8a] font-bold text-lg mb-4 ml-2">Secteurs & Blocs</Text>
          <View className="flex-row flex-wrap justify-between">
            {blocs.map((bloc) => (
              <TouchableOpacity 
                key={bloc}
                onPress={() => router.push({ pathname: '/(screens)/bloc-details', params: { id: bloc } })}
                className="w-[47%] bg-slate-50 p-8 rounded-[35px] mb-5 items-center border border-slate-100 shadow-sm"
              >
                <View className="bg-[#1e3a8a] p-4 rounded-full mb-3 shadow-md">
                  <Ionicons name="business" size={28} color="white" />
                </View>
                <Text className="font-bold text-[#1e3a8a] text-base">{bloc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bouton Aube Nouvelle */}
        <TouchableOpacity 
          className="bg-[#1e3a8a] p-5 rounded-[25px] mt-2 mb-6 items-center shadow-lg"
          onPress={() => router.push('/(screens)/aube-info')}
        >
          <Text className="text-white font-bold font-algerian text-lg uppercase">Université Aube Nouvelle</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
