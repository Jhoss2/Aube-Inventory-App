import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, StatusBar, Alert, Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Ajout de useLocalSearchParams
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function AddRoomScreen() {
  const router = useRouter();
  const { blocId, type } = useLocalSearchParams(); // On récupère le Bloc (A, B...) et le Type (SALLES, BUREAUX)
  const context = useAppContext();
  const { addSalle } = context as any;
  
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [niveau, setNiveau] = useState('');
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
      blocId: blocId, // CRUCIAL : Lie la salle au Bloc
      type: type,     // CRUCIAL : Lie au type (SALLES ou BUREAUX)
      name: nom.trim(),
      location: emplacement.trim(),
      level: niveau.trim(),
      capacity: capacity.trim(),
      surface: area.trim(), // On utilise "surface" pour correspondre à l'écran de détails
      image: image,
    };

    try {
      if (addSalle) {
        await addSalle(newRoom); 
        Alert.alert("Succès", "Enregistrée avec succès !", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de sauvegarder.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#4b5563" />
        </TouchableOpacity>
        {/* Rappel du contexte en haut pour l'utilisateur */}
        <Text style={styles.subHeaderText}>{type} - BLOC {blocId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>ENREGISTRER : {type}</Text>
        </View>

        <TouchableOpacity style={styles.photoZone} activeOpacity={0.9} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <>
              <Feather name="camera" size={48} color="white" />
              <Text style={styles.photoText}>Photo de la salle</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom (ex: Salle 102)" placeholderTextColor="#9ca3af" />
          <TextInput style={styles.input} value={emplacement} onChangeText={setEmplacement} placeholder="Bâtiment / Aile" placeholderTextColor="#9ca3af" />
          <TextInput style={styles.input} value={niveau} onChangeText={setNiveau} placeholder="Niveau (ex: RDC, Étage 1)" placeholderTextColor="#9ca3af" />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={capacity} onChangeText={setCapacity} placeholder="Capacité" keyboardType="numeric" placeholderTextColor="#9ca3af" />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} value={area} onChangeText={setArea} placeholder="Superficie (m²)" keyboardType="numeric" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        {/* Bouton Plan 3D (Optionnel pour l'instant) */}
        <TouchableOpacity style={styles.planZone}>
          <Feather name="box" size={42} color="#9ca3af" />
          <Text style={styles.planText}>Ajouter Plan 3D / Architecture</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveRoom}>
          <Text style={styles.saveBtnText}>ENREGISTRER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  subHeaderText: { color: '#9ca3af', fontWeight: 'bold', fontSize: 12 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  redBadge: { backgroundColor: '#8B0000', paddingVertical: 16, borderRadius: 50, marginVertical: 10 },
  redBadgeText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  photoZone: { backgroundColor: '#1D3583', borderRadius: 40, height: 180, justifyContent: 'center', alignItems: 'center', marginTop: 15, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  photoText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  form: { marginTop: 20 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 16, marginBottom: 15, color: '#000', fontWeight: '500' },
  row: { flexDirection: 'row' },
  planZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 40, paddingVertical: 40, alignItems: 'center', marginTop: 10 },
  planText: { color: '#9ca3af', fontWeight: 'bold', marginTop: 8 },
  footer: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  saveBtn: { backgroundColor: '#1D3583', paddingVertical: 20, borderRadius: 50, alignItems: 'center', elevation: 4 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 2 }
});
