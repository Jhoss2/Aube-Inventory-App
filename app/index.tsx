import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const { appData, isLoading } = useAppContext();
  const [selectedBloc, setSelectedBloc] = useState<string | null>(null);

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Chargement...</Text>
      </ScreenContainer>
    );
  }

  const handleBlocSelect = (blocId: string) => {
    setSelectedBloc(blocId);
    router.push({
      pathname: '/screens/bloc-details',
      params: { blocId: blocId },
    });
  };

  const handleAubePress = () => {
    router.push('/screens/aube-chat');
  };

  const handleSettingsPress = () => {
    router.push('/screens/settings');
  };

  const handleAlertsPress = () => {
    router.push('/screens/alerts');
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header Bar */}
      <View className="bg-[#b91c1c] px-4 py-3 flex-row justify-between items-center rounded-full shadow-md mb-4">
        <TouchableOpacity className="p-2">
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-semibold text-sm flex-1 text-center">&nbsp;</Text>
        <TouchableOpacity onPress={handleSettingsPress} className="p-2">
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Search Bar with Aube */}
        <View className="relative mb-4">
          <View className="bg-gray-300 rounded-full px-4 py-2 flex-row items-center">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <Text className="text-gray-500 flex-1 ml-2">Que cherchez vous aujourd'hui ?</Text>
          </View>
          <TouchableOpacity onPress={handleAubePress} className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 rounded-full p-2">
            <Ionicons name="chatbubble" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Bloc Selection Buttons */}
        <View className="bg-[#1e3a8a] rounded-3xl p-2 flex-row flex-wrap justify-center gap-2 mb-4 shadow-lg">
          {['A', 'B', 'C', 'D', 'E', 'F'].map((bloc) => (
            <TouchableOpacity
              key={bloc}
              onPress={() => handleBlocSelect(bloc)}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              <Text className="text-white text-xs font-bold">Bloc {bloc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Building Image */}
        <View className="bg-white rounded-3xl shadow-lg overflow-hidden mb-4">
          <Image
            source={{ uri: appData.general.mainBuildingImage }}
            style={{ width: '100%', height: 200 }}
            resizeMode="cover"
          />
        </View>

        {/* University Title */}
        <View className="items-center">
          <View className="bg-[#1e3a8a] px-6 py-3 rounded-2xl shadow-md">
            <Text style={{ fontFamily: 'Algerian' }} className="text-white text-center text-lg font-bold">
              UNIVERSITE AUBE NOUVELLE
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-8 gap-3">
          <TouchableOpacity
            onPress={handleAlertsPress}
            className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="alert-circle" size={24} color="#ef4444" />
              <Text className="text-gray-800 font-semibold">Alertes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/screens/notes')}
            className="bg-white rounded-xl p-4 shadow-sm flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="document-text" size={24} color="#f59e0b" />
              <Text className="text-gray-800 font-semibold">Notes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
