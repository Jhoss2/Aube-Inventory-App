import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  StatusBar,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function AddRoomScreen() {
  const router = useRouter();
  const context = useAppContext();
  const { addSalle } = context as any;
  
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [niveau, setNiveau] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Fonction pour ouvrir la galerie
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire pour ajouter une photo.");
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
      Alert.alert("Erreur", "Le nom de la salle est obligatoire");
      return;
    }

    const newRoom = {
      id: `room-${Date.now()}`,
      nom: nom.trim(),
      emplacement: emplacement.trim(),
      niveau: niveau.trim(),
      capacity: capacity.trim(),
      area: area.trim(),
      image: image,
    };

    try {
      if (addSalle) {
        await addSalle(newRoom); 
        Alert.alert("Succès", "Salle enregistrée avec succès !", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        throw new Error("Fonction addSalle non définie");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de sauvegarder la salle dans la base de données.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>AJOUTER UNE SALLE</Text>
        </View>

        {/* Zone Photo avec sélection d'image */}
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
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom" placeholderTextColor="#9ca3af" />
          <TextInput style={styles.input} value={emplacement} onChangeText={setEmplacement} placeholder="Emplacement / Bâtiment" placeholderTextColor="#9ca3af" />
          <TextInput style={styles.input} value={niveau} onChangeText={setNiveau} placeholder="Niveau" placeholderTextColor="#9ca3af" />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={capacity} onChangeText={setCapacity} placeholder="Capacité" keyboardType="numeric" placeholderTextColor="#9ca3af" />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} value={area} onChangeText={setArea} placeholder="Superficie (m²)" placeholderTextColor="#9ca3af" />
          </View>
        </View>

        <TouchableOpacity style={styles.planZone}>
          <Feather name="box" size={42} color="#9ca3af" />
          <Text style={styles.planText}>Ajouter Plan 3D</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  redBadge: { backgroundColor: '#B21F18', paddingVertical: 16, borderRadius: 50, marginVertical: 10 },
  redBadgeText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  photoZone: { backgroundColor: '#1D3583', borderRadius: 40, height: 180, justifyContent: 'center', alignItems: 'center', marginTop: 15, overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%', borderRadius: 40 },
  photoText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  form: { marginTop: 20 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 16, marginBottom: 15, color: '#000' },
  row: { flexDirection: 'row' },
  planZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 40, paddingVertical: 40, alignItems: 'center', marginTop: 10 },
  planText: { color: '#9ca3af', fontWeight: 'bold', marginTop: 8 },
  footer: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  saveBtn: { backgroundColor: '#1D3583', paddingVertical: 20, borderRadius: 50, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});
