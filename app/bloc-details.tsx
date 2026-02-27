import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function BlocDetailsScreen() {
  const router = useRouter();
  const { blocId } = useLocalSearchParams<{ blocId: string }>();
  const { appData } = useAppContext();

  if (!blocId || !appData.blocs[blocId]) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Bloc non trouvé</Text>
      </ScreenContainer>
    );
  }

  const bloc = appData.blocs[blocId];

  const handleSubBlocPress = (subBlocId: string) => {
    router.push({
      pathname: '/screens/room-profiles',
      params: { subBlocId, blocId },
    });
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1"></Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Bloc Title */}
        <View className="bg-[#b91c1c] text-white rounded-full px-6 py-3 shadow-md mb-4 items-center">
          <Text style={{ fontFamily: 'Algerian' }} className="text-white text-2xl font-bold text-center">
            Bloc {blocId}
          </Text>
        </View>

        {/* Main Bloc Image */}
        <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <Image
            source={{ uri: bloc.mainImage }}
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />
          <Text style={{ fontFamily: 'Monotype-Corsiva' }} className="text-center text-gray-600 text-sm p-2">
            · Bloc {blocId} vu de dessus ·
          </Text>
        </View>

        {/* Sub-Blocs */}
        <View className="gap-4">
          {bloc.subBlocs.map((subBloc, index) => (
            <TouchableOpacity
              key={subBloc.id}
              onPress={() => handleSubBlocPress(subBloc.id)}
              className="active:opacity-70"
            >
              <View className="mb-2">
                <Text style={{ fontFamily: 'Algerian' }} className="text-[#1e3a8a] text-xl font-bold text-center">
                  {subBloc.title}
                </Text>
              </View>

              <View className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Image
                  source={{ uri: subBloc.image }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
                <Text style={{ fontFamily: 'Monotype-Corsiva' }} className="text-center text-gray-600 text-sm p-2">
                  {subBloc.imageTitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

