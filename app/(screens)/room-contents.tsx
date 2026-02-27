import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const { appData, deleteMateriel } = useAppContext();

  const materiels = useMemo(() => {
    return appData.materiels.filter((item) => item.salleId === salleId);
  }, [appData.materiels, salleId]);

  const roomName = useMemo(() => {
    return appData.salles.find(s => s.id === salleId)?.nom || "la Salle";
  }, [appData.salles, salleId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-black text-[#1D3583] text-lg uppercase tracking-wider">
          Matériel de {roomName}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {materiels.map((item) => (
          <View key={item.id} className="bg-white rounded-[30px] shadow-sm border border-gray-100 mb-6 overflow-hidden">
            
            {/* 1. Grande Image du Matériel */}
            <View className="w-full h-48 bg-gray-200">
              {item.image ? (
                <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <MaterialCommunityIcons name="image-off" size={48} color="#d1d5db" />
                  <Text className="text-gray-400 font-bold mt-2">Aucune photo disponible</Text>
                </View>
              )}
              
              {/* Badge d'état flottant sur l'image */}
              <View className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full shadow-sm">
                <Text className={`font-black text-[10px] uppercase ${item.etat === 'Bon' ? 'text-green-600' : 'text-orange-500'}`}>
                  {item.etat}
                </Text>
              </View>
            </View>

            {/* 2. Corps de la Carte */}
            <View className="p-5">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-2xl font-black text-[#1D3583] uppercase tracking-tighter">
                    {item.nom}
                  </Text>
                  <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">
                    {item.marque || 'Marque non spécifiée'}
                  </Text>
                </View>

                {/* Boutons Actions (Modifier/Supprimer) */}
                <View className="flex-row gap-x-2">
                  <TouchableOpacity 
                    className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center border border-blue-100"
                    onPress={() => console.log('Edit', item.id)}
                  >
                    <Ionicons name="pencil" size={18} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                    onPress={() => deleteMateriel(item.id)}
                  >
                    <Ionicons name="trash" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 3. Informations détaillées */}
              <View className="flex-row border-y border-gray-50 py-3 my-3">
                <View className="flex-1">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase">Quantité</Text>
                  <Text className="text-[#1D3583] font-black text-lg">{item.quantite}</Text>
                </View>
                <View className="flex-1 border-x border-gray-50 px-4">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase">Acquisition</Text>
                  <Text className="text-gray-600 font-bold text-sm">{item.dateAcquisition}</Text>
                </View>
                <View className="flex-1 pl-4">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase">Renouvellement</Text>
                  <Text className="text-red-500 font-bold text-sm">{item.dateRenouvellement}</Text>
                </View>
              </View>

              {/* 4. Commentaires / Informations supplémentaires */}
              <View className="bg-[#F8F9FB] p-4 rounded-2xl">
                <Text className="text-gray-400 font-bold text-[9px] uppercase mb-1">Commentaires :</Text>
                <Text className="text-gray-600 text-sm leading-5 italic">
                  {item.commentaires || "Aucune note supplémentaire pour ce matériel."}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
                    }
