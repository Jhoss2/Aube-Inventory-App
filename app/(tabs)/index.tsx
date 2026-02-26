import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/lib/app-context'; // Connexion à la logique de Manus

export default function HomeScreen() {
  const router = useRouter();
  const { appData, isLoading } = useAppContext(); // Récupération des données SQLite
  const [activeBloc, setActiveBloc] = useState('Bloc A');
  const blocs = ['Bloc A', 'Bloc B', 'Bloc C', 'Bloc D', 'Bloc E', 'Bloc F'];

  // Si la base de données charge, on affiche un petit indicateur pour éviter le crash
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FDF2F7] items-center justify-center">
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF2F7' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 110 }}>
        
        {/* 1. Header Rouge - Arrondi (mx-3 mt-4) */}
        <View className="bg-[#C62828] mx-3 mt-4 px-6 py-4 flex-row items-center justify-between rounded-[40px] shadow-lg">
          <TouchableOpacity>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Algerian', color: 'white', fontSize: 18 }}>U-AUBEN TRACKER</Text>
          <TouchableOpacity onPress={() => router.push('/screens/settings')}>
            <Ionicons name="settings-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* 2. Barre de Recherche + Bouton Robot Interactif */}
        <View className="px-8 mt-5">
          <View className="relative flex-row items-center bg-white rounded-full px-4 py-3 shadow-sm border border-gray-100">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput 
              placeholder="Que cherchez vous aujourd'hui ?" 
              className="flex-1 ml-3 text-gray-600"
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity 
              onPress={() => router.push('/screens/aube-chat')}
              className="bg-white rounded-lg p-1 shadow-sm active:scale-95"
            >
              <MaterialCommunityIcons name="robot-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Bandeau Bleu Marine - Sélecteur de Blocs (A à F) */}
        <View className="px-6 mt-5">
          <View className="bg-[#1E3A8A] rounded-2xl p-2 flex-row justify-between items-center">
            {blocs.map((bloc) => (
              <TouchableOpacity
                key={bloc}
                onPress={() => {
                  setActiveBloc(bloc);
                  // On navigue vers les détails du bloc en extrayant la lettre (A, B, C...)
                  router.push({ pathname: '/screens/bloc-details', params: { blocId: bloc.split(' ')[1] } });
                }}
                className={`flex-1 py-2 rounded-xl items-center ${activeBloc === bloc ? 'bg-[#3B82F6]' : ''}`}
              >
                <Text className={`text-[10px] font-bold ${activeBloc === bloc ? 'text-white' : 'text-gray-400'}`}>
                  {bloc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 4. Zone Centrale - Carte Université (Connectée à SQLite) */}
        <View className="px-6 mt-8 items-center">
          <View className="w-full bg-white rounded-[60px] aspect-[1.2/1] items-center justify-center shadow-2xl overflow-hidden border-4 border-[#3B82F6]">
            {/* On utilise l'image stockée dans la base de données */}
            <Image 
              source={{ uri: appData?.general?.mainBuildingImage }} 
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              resizeMode="cover"
            />
            <View className="bg-black/20 absolute inset-0 items-center justify-center">
               <Text className="text-white text-5xl font-bold tracking-tighter shadow-black">Université</Text>
            </View>
          </View>

          {/* Bouton Titre Université Aube Nouvelle */}
          <TouchableOpacity 
            onPress={() => router.push('/screens/aube-chat')}
            className="mt-10 bg-[#1E3A8A] px-10 py-5 rounded-2xl shadow-xl active:scale-95"
          >
            <Text style={{ fontFamily: 'Algerian' }} className="text-white text-[12px] font-bold tracking-[0.15em] uppercase text-center">
              Universite Aube Nouvelle
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 5. Ta Barre de Navigation Personnalisée (Fixée en bas) */}
      <View className="absolute bottom-6 left-8 right-8">
        <View className="bg-[#1E3A8A] rounded-[45px] py-5 flex-row items-center justify-around shadow-2xl border-2 border-white/10">
          <TouchableOpacity onPress={() => router.push('/screens/alerts')}>
            <Ionicons name="notifications-outline" size={30} color="#d1d5db" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveBloc('Bloc A')}>
            <Ionicons name="home" size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/notes')}>
            <Ionicons name="document-text-outline" size={30} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>
      
    </SafeAreaView>
  );
}
