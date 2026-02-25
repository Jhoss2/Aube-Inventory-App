import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  // DONNÉES FACTICES (Pour remplir ton écran tout de suite)
  const blocs = ['Bloc A', 'Bloc B', 'Bloc C', 'Bloc D', 'Bloc E', 'Bloc F'];
  
  const alertes = [
    { id: '1', titre: 'Alerte maintenance', description: 'Le Bloc B sera fermé demain.', heure: '10:30' },
    { id: '2', titre: 'Nouveau message', description: 'Consultez vos notes de cours.', heure: '09:15' }
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="light" />
      
      {/* HEADER ROUGE (Comme sur ta capture) */}
      <View className="bg-[#b91c1c] p-4 flex-row justify-between items-center">
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg font-algerian">U-AUBEN TRACKER</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* BARRE DE RECHERCHE */}
        <View className="p-4 bg-slate-200">
          <View className="bg-white rounded-full flex-row items-center px-4 py-2 border border-slate-300">
            <Ionicons name="search" size={20} color="gray" />
            <TextInput 
              placeholder="Que cherchez vous aujourd'hui ?" 
              className="ml-2 flex-1 text-slate-700"
            />
          </View>
        </View>

        {/* SELECTEUR DE BLOCS (Bandeau bleu) */}
        <View className="bg-[#1e3a8a] py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {blocs.map((bloc, index) => (
              <TouchableOpacity 
                key={index} 
                className="bg-white/20 px-4 py-2 rounded-lg mr-2 border border-white/30"
              >
                <Text className="text-white font-bold">{bloc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CONTENU CENTRAL (L'espace vide sur ta capture) */}
        <View className="p-4">
          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[200px] justify-center items-center">
            <Text className="text-[#1e3a8a] font-bold text-xl font-corsiva">Bienvenue à l'Université</Text>
            <Text className="text-slate-500 text-center mt-2">Sélectionnez un bloc pour commencer le tracking ou consultez vos alertes ci-dessous.</Text>
          </View>

          {/* SECTION ALERTES */}
          <View className="mt-6">
            <View className="flex-row items-center mb-3">
              <View className="bg-red-100 p-2 rounded-full">
                <Ionicons name="notifications" size={20} color="#ef4444" />
              </View>
              <Text className="ml-3 text-lg font-bold text-slate-800">Alertes Récentes</Text>
            </View>
            
            {alertes.map((alerte) => (
              <TouchableOpacity key={alerte.id} className="bg-white p-4 rounded-2xl mb-3 flex-row items-center shadow-sm">
                <View className="flex-1">
                  <Text className="font-bold text-slate-800">{alerte.titre}</Text>
                  <Text className="text-slate-500 text-sm">{alerte.description}</Text>
                </View>
                <Text className="text-slate-400 text-xs">{alerte.heure}</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" className="ml-2" />
              </TouchableOpacity>
            ))}
          </View>

          {/* SECTION NOTES */}
          <TouchableOpacity className="mt-4 bg-white p-4 rounded-2xl flex-row items-center shadow-sm">
            <View className="bg-amber-100 p-2 rounded-full">
              <Ionicons name="document-text" size={20} color="#f59e0b" />
            </View>
            <Text className="ml-3 flex-1 font-bold text-slate-800">Mes Notes & Rapports</Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
