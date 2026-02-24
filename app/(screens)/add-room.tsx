import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function AddRoomScreen() {
  const router = useRouter();
  const { subBlocId, blocId } = useLocalSearchParams<{ subBlocId: string; blocId: string }>();
  const { addSalle } = useAppContext();

  const [nom, setNom] = useState('');
  const [niveau, setNiveau] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');

  const handleSaveRoom = async () => {
    if (!nom.trim() || !niveau.trim()) {
      Alert.alert('Erreur', 'Le nom et le niveau sont obligatoires');
      return;
    }

    const newRoom = {
      id: `salle-${new Date().getTime()}`,
      nom: nom.trim(),
      emplacement: subBlocId || '',
      niveau: niveau.trim(),
      capacity: capacity.trim(),
      area: area.trim(),
      photoId: undefined,
      plan3dId: undefined,
    };

    await addSalle(newRoom);
    Alert.alert('Succès', 'Salle créée');
    router.back();
  };

  return (
    <ScreenContainer className="bg-[#fde7f3]">
      <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-gray-700 font-semibold">Nouvelle salle</Text>
        <View className="w-10"></View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="bg-white rounded-xl p-4 shadow-sm gap-4">
          <View>
            <Text className="text-gray-800 font-semibold mb-2">Nom de la salle *</Text>
            <TextInput
              value={nom}
              onChangeText={setNom}
              placeholder="Ex: Salle 101"
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
          </View>

          <View>
            <Text className="text-gray-800 font-semibold mb-2">Niveau *</Text>
            <TextInput
              value={niveau}
              onChangeText={setNiveau}
              placeholder="Ex: RDC, 1er étage"
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
          </View>

          <View>
            <Text className="text-gray-800 font-semibold mb-2">Capacité</Text>
            <TextInput
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Ex: 30 personnes"
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
          </View>

          <View>
            <Text className="text-gray-800 font-semibold mb-2">Surface</Text>
            <TextInput
              value={area}
              onChangeText={setArea}
              placeholder="Ex: 50 m²"
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
          </View>

          <TouchableOpacity onPress={handleSaveRoom} className="bg-blue-600 rounded-lg py-3 items-center mt-4">
            <Text className="text-white font-semibold">Créer la salle</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
