import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context'; // Connexion SQLite

export default function AddRoomScreen() {
  const router = useRouter();
  const { subBlocId } = useLocalSearchParams<{ subBlocId: string }>();
  const { addSalle } = useAppContext();
  
  // États du formulaire
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState(subBlocId || '');
  const [niveau, setNiveau] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');

  const handleSaveRoom = async () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom de la salle est obligatoire');
      return;
    }

    const newRoom = {
      id: `salle-${new Date().getTime()}`,
      nom: nom.trim(),
      emplacement: emplacement.trim(),
      niveau: niveau.trim(),
      capacity: capacity.trim(),
      area: area.trim(),
    };

    try {
      await addSalle(newRoom); // Sauvegarde réelle dans SQLite
      Alert.alert('Succès', 'Salle enregistrée !', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'enregistrer la salle");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      {/* Header avec bouton retour */}
      <View className="px-6 pt-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 w-10">
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* 1. Titre Rouge Style Header */}
        <View className="bg-[#B21F18] py-4 rounded-full shadow-lg mt-2 items-center">
          <Text className="text-white font-bold text-lg uppercase tracking-widest">
            Ajouter une salle
          </Text>
        </View>

        {/* 2. Zone Photo (Rectangle Bleu) */}
        <TouchableOpacity className="bg-[#1D3583] rounded-[40px] aspect-[1.8/1] mt-6 items-center justify-center shadow-md">
          <Ionicons name="camera" size={48} color="white" />
          <Text className="text-white font-bold text-base mt-2">Photo de la salle</Text>
        </TouchableOpacity>

        {/* 3. Formulaire */}
        <View className="mt-6 gap-y-4">
          <TextInput
            value={nom}
            onChangeText={setNom}
            placeholder="Nom"
            className="w-full bg-white rounded-full px-6 py-4 text-gray-700 shadow-sm border border-gray-100"
          />

          <TextInput
            value={emplacement}
            onChangeText={setEmplacement}
            placeholder="Emplacement (ex: Bloc A)"
            className="w-full bg-white rounded-full px-6 py-4 text-gray-700 shadow-sm border border-gray-100"
          />

          <TextInput
            value={niveau}
            onChangeText={setNiveau}
            placeholder="Niveau"
            className="w-full bg-white rounded-full px-6 py-4 text-gray-700 shadow-sm border border-gray-100"
          />

          <View className="flex-row gap-4">
            <TextInput
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Capacité"
              keyboardType="numeric"
              className="flex-1 bg-white rounded-full px-6 py-4 text-gray-700 shadow-sm border border-gray-100"
            />
            <TextInput
              value={area}
              onChangeText={setArea}
              placeholder="Superficie (m²)"
              className="flex-1 bg-white rounded-full px-6 py-4 text-gray-700 shadow-sm border border-gray-100"
            />
          </View>
        </View>

        {/* 4. Zone Plan 3D (Pointillés) */}
        <TouchableOpacity className="mt-6 border-2 border-dashed border-gray-300 rounded-[40px] py-10 items-center justify-center bg-white/40">
          <MaterialCommunityIcons name="cube-outline" size={42} color="#9ca3af" />
          <Text className="text-gray-400 font-bold mt-2">Ajouter Plan 3D</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 5. Bouton Enregistrer (Fixé en bas) */}
      <View className="absolute bottom-6 left-6 right-6">
        <TouchableOpacity 
          onPress={handleSaveRoom}
          className="w-full bg-[#1D3583] py-5 rounded-full shadow-2xl items-center"
        >
          <Text className="text-white font-bold text-lg uppercase tracking-wider">
            Enregistrer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
