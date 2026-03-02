import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, StatusBar, Alert, Image, Platform 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera, Box } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function AddRoomScreen() {
  const router = useRouter();
  const { blocId, type, level } = useLocalSearchParams<{ blocId: string, type: string, level: string }>();
  const { addSalle } = useAppContext() as any;
  
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [niveau, setNiveau] = useState(level || '');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // FORMATEUR : Majuscule au début, reste en minuscule
  const formatText = (txt: string) => {
    if (!txt) return "";
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSaveRoom = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }
    const newRoom = {
      id: `room-${Date.now()}`,
      blockId: blocId,
      type: type,
      name: nom.trim(),
      location: emplacement.trim(),
      level: niveau.trim(),
      capacity, surface: area, image,
    };
    try {
      await addSalle(newRoom); 
      Alert.alert("Succès", "Enregistrée avec succès !", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err) { Alert.alert("Erreur", "Sauvegarde échouée."); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER - MAJUSCULES + LUEUR NOIRE */}
        <View style={[styles.redHeaderPill, styles.blackGlow]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>
            {(formatText(type) + " - BLOC " + blocId).toUpperCase()}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ZONE PHOTO - LUEUR NOIRE */}
        <TouchableOpacity style={[styles.photoZone, styles.blackGlow]} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={40} color="white" />
              <Text style={[styles.photoText, styles.boldSerifItalic]}>
                {formatText("Ajouter une image")}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          {/* CHAMP NOM - PILULE BLANCHE + LUEUR NOIRE */}
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatText("Nom")}</Text>
          <TextInput 
            style={[styles.input, styles.boldSerifItalic, styles.blackGlow]} 
            value={nom} 
            onChangeText={setNom} 
            placeholder="Ex: Salle 102" 
          />

          {/* CHAMP EMPLACEMENT - PILULE BLANCHE + LUEUR NOIRE */}
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatText("Emplacement")}</Text>
          <TextInput 
            style={[styles.input, styles.boldSerifItalic, styles.blackGlow]} 
            value={emplacement} 
            onChangeText={setEmplacement} 
            placeholder="Ex: Aile est" 
          />

          {/* CHAMP NIVEAU (RÉTABLI) - LUEUR NOIRE */}
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatText("Niveau")}</Text>
          <TextInput 
            style={[styles.input, styles.boldSerifItalic, styles.blackGlow, { backgroundColor: '#F8FAFC' }]} 
            value={niveau} 
            editable={false} 
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.label, styles.boldSerifItalic]}>{formatText("Capacité")}</Text>
              <TextInput 
                style={[styles.input, styles.boldSerifItalic, styles.blackGlow]} 
                value={capacity} 
                onChangeText={setCapacity} 
                placeholder="Pers." 
                keyboardType="numeric" 
              />
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={[styles.label, styles.boldSerifItalic]}>{formatText("Superficie")}</Text>
              <TextInput 
                style={[styles.input, styles.boldSerifItalic, styles.blackGlow]} 
                value={area} 
                onChangeText={setArea} 
                placeholder="m²" 
                keyboardType="numeric" 
              />
            </View>
          </View>
        </View>

        {/* BOUTON ENREGISTRER - LUEUR NOIRE */}
        <TouchableOpacity style={[styles.saveBtn, styles.blackGlow]} onPress={handleSaveRoom}>
          <Text style={[styles.saveBtnText, styles.boldSerifItalic]}>
            {formatText("Enregistrer la salle")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { padding: 25, paddingTop: 50, paddingBottom: 60 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', paddingVertical: 12, paddingHorizontal: 15, 
    borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 
  },
  // LUEUR NOIRE PRONONCÉE
  blackGlow: {
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 }
  },
  headerTitleText: { color: 'white', fontSize: 14, letterSpacing: 1 },
  photoZone: { backgroundColor: '#1A237E', borderRadius: 35, height: 180, overflow: 'hidden', marginBottom: 25 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoText: { color: 'white', fontSize: 11, marginTop: 10 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  formContainer: { width: '100%' },
  label: { fontSize: 11, color: '#1A237E', marginBottom: 8, marginLeft: 10 },
  input: { 
    backgroundColor: 'white', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, 
    marginBottom: 18, color: '#374151', borderWidth: 1, borderColor: '#FCE7F3' 
  },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 22, borderRadius: 50, marginTop: 35, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 14 },
  backBtn: { padding: 5 }
});
