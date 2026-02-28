import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function BlocDetailsScreen() {
  const router = useRouter();
  const { blocId } = useLocalSearchParams<{ blocId: string }>();
  const context = useAppContext();
  const { appData } = context as any;

  // Cast en any pour éviter les erreurs TS sur l'existence de "blocs"
  const data = appData as any;

  if (!blocId || !data?.blocs || !data.blocs[blocId]) {
    return (
      <ScreenContainer {...({ className: "items-center justify-center" } as any)}>
        <Text {...({ className: "text-foreground" } as any)}>Bloc non trouvé</Text>
      </ScreenContainer>
    );
  }

  const bloc = data.blocs[blocId];

  const handleSubBlocPress = (subId: string) => {
    router.push({
      pathname: '/room-profiles',
      params: { subId, blocId },
    });
  };

  return (
    <ScreenContainer {...({ className: "bg-[#fde7f3]" } as any)}>
      {/* Header */}
      <View {...({ className: "flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200" } as any)}>
        <TouchableOpacity onPress={() => router.back()} {...({ className: "p-2" } as any)}>
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text {...({ className: "flex-1" } as any)}></Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Bloc Title */}
        <View {...({ className: "bg-[#b91c1c] rounded-full px-6 py-3 shadow-md mb-4 items-center" } as any)}>
          <Text style={{ fontFamily: 'Algerian' }} {...({ className: "text-white text-2xl font-bold text-center" } as any)}>
            Bloc {blocId}
          </Text>
        </View>

        {/* Main Bloc Image */}
        <View {...({ className: "bg-white rounded-2xl shadow-lg overflow-hidden mb-4" } as any)}>
          <Image
            source={{ uri: bloc.mainImage }}
            style={{ width: '100%', height: 160 }}
            resizeMode="cover"
          />
          <Text style={{ fontFamily: 'Monotype-Corsiva' }} {...({ className: "text-center text-gray-600 text-sm p-2" } as any)}>
            · Bloc {blocId} vu de dessus ·
          </Text>
        </View>

        {/* Sub-Blocs */}
        <View {...({ className: "gap-4" } as any)}>
          {bloc.subBlocs && (bloc.subBlocs as any[]).map((subBloc: any, index: number) => (
            <TouchableOpacity
              key={subBloc.id || index}
              onPress={() => handleSubBlocPress(subBloc.id)}
              {...({ className: "active:opacity-70" } as any)}
            >
              <View {...({ className: "mb-2" } as any)}>
                <Text style={{ fontFamily: 'Algerian' }} {...({ className: "text-[#1e3a8a] text-xl font-bold text-center" } as any)}>
                  {subBloc.title}
                </Text>
              </View>

              <View {...({ className: "bg-white rounded-2xl shadow-lg overflow-hidden" } as any)}>
                <Image
                  source={{ uri: subBloc.image }}
                  style={{ width: '100%', height: 160 }}
                  resizeMode="cover"
                />
                <Text style={{ fontFamily: 'Monotype-Corsiva' }} {...({ className: "text-center text-gray-600 text-sm p-2" } as any)}>
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
