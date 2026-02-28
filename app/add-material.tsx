import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function AddMaterielScreen() {
  const router = useRouter();
  const { salleId, category } = useLocalSearchParams<{ salleId: string, category: string }>();
  const { addMateriel } = useAppContext();

  // États du formulaire
  const [quantite, setQuantite] = useState('1');
  const [etat, setEtat] = useState('Bon');
  const [couleur, setCouleur] = useState('');
  const [marque, setMarque] = useState('');
  const [dateAcq, setDateAcq] = useState(new Date().toLocaleDateString());
  const [dateRen, setDateRen] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString());
  const [infos, setInfos] = useState('');

  const handleSave = async () => {
    const newItem = {
      id: `mat-${Date.now()}`,
      salleId: salleId,
      nom: category, // Le nom est défini par la catégorie choisie précédemment
      quantite: parseInt(quantite) || 1,
      etat,
      couleur,
      marque,
      dateAcquisition: dateAcq,
      dateRenouvellement: dateRen,
      commentaires: infos,
    };

    try {
      await addMateriel(newItem);
      Alert.alert("Succès", `${category} ajouté à l'inventaire !`, [
        { text: "OK", onPress: () => router.push({ pathname: '/screens/room-details', params: { salleId } }) }
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le matériel.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      
      {/* Header */}
      <View className="px-4 py-2 flex-row items-center bg-white border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-black text-[#1D3583] text-lg uppercase tracking-wider">
          AJOUTER MATÉRIEL
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Badge Rouge d'entête */}
        <View className="w-full bg-[#B21F18] py-3 rounded-full shadow-md mb-6 items-center">
          <Text className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">
            Informations détaillées
          </Text>
        </View>

        {/* GRANDE CARTE ROSE ARRONDIE */}
        <View style={styles.pinkCard}>
          
          {/* NOM DU MATÉRIEL (Lecture seule car vient de la catégorie) */}
          <View className="mb-4">
            <Text style={styles.label}>Nom du matériel</Text>
            <View className="bg-[#F8F9FB] rounded-2xl py-4 px-6 border border-white">
              <Text className="text-gray-700 font-bold">{category}</Text>
            </View>
          </View>

          {/* QUANTITÉ ET ÉTAT */}
          <View className="flex-row gap-x-4 mb-4">
            <View className="flex-1">
              <Text style={styles.label}>Quantité</Text>
              <TextInput
                value={quantite}
                onChangeText={setQuantite}
                keyboardType="numeric"
                className="bg-[#F8F9FB] rounded-2xl py-4 px-6 text-gray-700 font-bold border border-white"
              />
            </View>
            <View className="flex-1">
              <Text style={styles.label}>État</Text>
              <TouchableOpacity className="bg-[#F8F9FB] rounded-2xl py-4 px-6 border border-white flex-row justify-between items-center">
                <Text className="text-gray-700 font-bold">{etat}</Text>
                <Ionicons name="chevron-down" size={16} color="#1D3583" />
              </TouchableOpacity>
            </View>
          </View>

          {/* COULEUR ET MARQUE */}
          <View className="flex-row gap-x-4 mb-4">
            <View className="flex-1">
              <Text style={styles.label}>Couleur</Text>
              <TextInput
                placeholder="Ex: Blanc"
                value={couleur}
                onChangeText={setCouleur}
                className="bg-[#F8F9FB] rounded-2xl py-4 px-6 text-gray-700 font-bold border border-white"
              />
            </View>
            <View className="flex-1">
              <Text style={styles.label}>Marque</Text>
              <TextInput
                placeholder="Ex: Philips"
                value={marque}
                onChangeText={setMarque}
                className="bg-[#F8F9FB] rounded-2xl py-4 px-6 text-gray-700 font-bold border border-white"
              />
            </View>
          </View>

          {/* PHOTO (Simulé) */}
          <View className="mb-4">
            <Text style={styles.label}>Photo (Optionnel)</Text>
            <TouchableOpacity className="w-full aspect-video rounded-[25px] border-2 border-dashed border-[#1D3583]/20 bg-white/50 items-center justify-center">
              <Ionicons name="camera" size={32} color="#1D3583" />
              <Text className="text-[10px] font-bold text-[#1D3583] mt-2">Prendre une photo</Text>
            </TouchableOpacity>
          </View>

          {/* DATES */}
          <View className="flex-row gap-x-4 mb-4">
            <View className="flex-1">
              <Text style={styles.label}>Acquisition</Text>
              <View className="bg-[#F8F9FB] rounded-2xl py-4 px-3 border border-white items-center">
                <Text className="text-gray-700 font-bold text-[10px]">{dateAcq}</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text style={styles.label}>Renouvellement</Text>
              <View className="bg-[#F8F9FB] rounded-2xl py-4 px-3 border border-white items-center">
                <Text className="text-gray-700 font-bold text-[10px]">{dateRen}</Text>
              </View>
            </View>
          </View>

          {/* INFOS SUPPLÉMENTAIRES */}
          <View>
            <Text style={styles.label}>Informations supplémentaires</Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Détails, notes..."
              value={infos}
              onChangeText={setInfos}
              className="bg-[#F8F9FB] rounded-[25px] py-4 px-6 text-gray-700 font-bold border border-white text-vertical-top"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </View>

        {/* Bouton Enregistrer */}
        <TouchableOpacity 
          onPress={handleSave}
          className="w-full bg-[#1D3583] py-5 rounded-full shadow-xl items-center mt-8"
        >
          <Text className="text-white font-bold text-lg uppercase tracking-widest">
            Enregistrer le matériel
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pinkCard: {
    backgroundColor: '#FDE7F3',
    borderRadius: 35,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    elevation: 2,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1D3583',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 12,
  }
});
