import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, StatusBar, Alert, Image, SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera, Box } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function AddRoomScreen() {
  const router = useRouter();
  // CORRECTION : On récupère aussi 'level' envoyé par room-profiles
  const { blocId, type, level } = useLocalSearchParams<{ blocId: string, type: string, level: string }>(); 
  const { addSalle } = useAppContext() as any;
  
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  // CORRECTION : Le niveau est pré-rempli avec la sélection précédente
  const [niveau, setNiveau] = useState(level || '');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveRoom = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }

    const newRoom = {
      id: `room-${Date.now()}`,
      blockId: blocId, // On s'assure que c'est bien blockId
      type: type,
      name: nom.trim(),
      location: emplacement.trim(),
      level: niveau.trim(), // Crucial pour le filtrage
      capacity: capacity.trim(),
      surface: area.trim(),
      image: image,
    };

    try {
      await addSalle(newRoom); 
      Alert.alert("Succès", "Enregistrée avec succès !", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de sauvegarder.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>
              {type?.toUpperCase()} - BLOC {blocId}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          <View style={styles.redBadgeLabel}>
            <Text style={styles.redBadgeLabelText}>ENREGISTRER UNE NOUVELLE UNITÉ</Text>
          </View>

          <TouchableOpacity style={styles.photoZone} activeOpacity={0.9} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={40} color="white" />
                <Text style={styles.photoText}>AJOUTER UNE PHOTO</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.mainCard}>
            <Text style={styles.label}>NOM DE L'ESPACE</Text>
            <TextInput 
              style={styles.input} 
              value={nom} 
              onChangeText={setNom} 
              placeholder="Ex: Salle 102" 
              placeholderTextColor="#94A3B8" 
            />

            <Text style={styles.label}>EMPLACEMENT / AILE</Text>
            <TextInput 
              style={styles.input} 
              value={emplacement} 
              onChangeText={setEmplacement} 
              placeholder="Ex: Bâtiment A, Aile Est" 
              placeholderTextColor="#94A3B8" 
            />

            <Text style={styles.label}>NIVEAU / ÉTAGE</Text>
            <TextInput 
              style={styles.input} 
              value={niveau} 
              onChangeText={setNiveau} 
              placeholder="Ex: Rez-de-chaussée" 
              placeholderTextColor="#94A3B8"
              editable={false} // On empêche la modification pour garantir le bon filtrage
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>CAPACITÉ</Text>
                <TextInput 
                  style={styles.input} 
                  value={capacity} 
                  onChangeText={setCapacity} 
                  placeholder="Pers." 
                  keyboardType="numeric" 
                  placeholderTextColor="#94A3B8" 
                />
              </View>
              <View style={[styles.flex1, { marginLeft: 15 }]}>
                <Text style={styles.label}>SUPERFICIE</Text>
                <TextInput 
                  style={styles.input} 
                  value={area} 
                  onChangeText={setArea} 
                  placeholder="m²" 
                  keyboardType="numeric" 
                  placeholderTextColor="#94A3B8" 
                />
              </View>
            </View>

            <TouchableOpacity style={styles.planBox}>
              <Box size={24} color="#1A237E" />
              <Text style={styles.planText}>AJOUTER PLAN 3D / ARCHI</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveRoom}>
            <Text style={styles.saveBtnText}>VALIDER L'ENREGISTREMENT</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 30, paddingBottom: 60 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', paddingVertical: 12, paddingHorizontal: 15, 
    borderRadius: 50, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', marginBottom: 20, elevation: 6
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  redBadgeLabel: { backgroundColor: '#8B0000', paddingVertical: 12, borderRadius: 50, alignItems: 'center', marginBottom: 25 },
  redBadgeLabelText: { color: 'white', fontWeight: 'bold', fontSize: 10, letterSpacing: 2 },
  photoZone: { backgroundColor: '#1A237E', borderRadius: 35, height: 180, overflow: 'hidden', marginBottom: 25, elevation: 4 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoText: { color: 'white', fontWeight: 'bold', fontSize: 11, marginTop: 10, letterSpacing: 1 },
  imagePreview: { width: '100%', height: '100%' },
  mainCard: { backgroundColor: 'white', borderRadius: 35, padding: 22, elevation: 3, borderWidth: 1, borderColor: '#FCE7F3' },
  label: { fontSize: 9, fontWeight: '900', color: '#1A237E', letterSpacing: 1, marginBottom: 8, marginLeft: 10 },
  input: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, marginBottom: 18, color: '#374151', fontWeight: 'bold', borderWidth: 1, borderColor: '#EDF0F5' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  planBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 25, paddingVertical: 20, marginTop: 5, backgroundColor: '#F8FAFC' },
  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 22, borderRadius: 50, marginTop: 35, alignItems: 'center', elevation: 8 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 }
});
