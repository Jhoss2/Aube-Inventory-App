import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, StatusBar, Alert, Image, Platform 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function AddRoomScreen() {
  const router = useRouter();
  const { blocId, type, level } = useLocalSearchParams<{ blocId: string, type: string, level: string }>();
  const { addSalle } = useAppContext() as any;
  
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Formate le texte : "Nom" au lieu de "NOM" ou "nom"
  const formatLabel = (txt: string) => {
    if (!txt) return "";
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Accès galerie requis.");
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
      level: level,
      capacity, surface: area, image,
    };
    try {
      await addSalle(newRoom); 
      router.back();
    } catch (err) { Alert.alert("Erreur", "Sauvegarde échouée."); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER - MAJUSCULES + LUEUR */}
        <View style={[styles.redHeaderPill, styles.blackGlow]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>
            {(type + " - BLOC " + blocId).toUpperCase()}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ZONE PHOTO - LUEUR */}
        <TouchableOpacity style={[styles.photoZone, styles.blackGlow]} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={40} color="white" />
              <Text style={[styles.photoText, styles.boldSerifItalic]}>
                {formatLabel("Ajouter une image")}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          {/* NOM */}
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Nom")}</Text>
          <View style={[styles.inputWrapper, styles.blackGlow]}>
            <TextInput style={[styles.input, styles.boldSerifItalic]} value={nom} onChangeText={setNom} placeholder="Ex: Salle 102" />
          </View>

          {/* EMPLACEMENT */}
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Emplacement")}</Text>
          <View style={[styles.inputWrapper, styles.blackGlow]}>
            <TextInput style={[styles.input, styles.boldSerifItalic]} value={emplacement} onChangeText={setEmplacement} placeholder="Ex: Aile est" />
          </View>

          {/* NIVEAU (CHAMP RÉTABLI) */}
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Niveau")}</Text>
          <View style={[styles.inputWrapper, styles.blackGlow, { backgroundColor: '#F1F5F9' }]}>
            <TextInput style={[styles.input, styles.boldSerifItalic]} value={level} editable={false} />
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Capacité")}</Text>
              <View style={[styles.inputWrapper, styles.blackGlow]}>
                <TextInput style={[styles.input, styles.boldSerifItalic]} value={capacity} onChangeText={setCapacity} placeholder="Pers." keyboardType="numeric" />
              </View>
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Superficie")}</Text>
              <View style={[styles.inputWrapper, styles.blackGlow]}>
                <TextInput style={[styles.input, styles.boldSerifItalic]} value={area} onChangeText={setArea} placeholder="m²" keyboardType="numeric" />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, styles.blackGlow]} onPress={handleSaveRoom}>
          <Text style={[styles.saveBtnText, styles.boldSerifItalic]}>
            {formatLabel("Enregistrer la salle")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900', fontStyle: 'italic',
  },
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { padding: 25, paddingTop: 50, paddingBottom: 60 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', paddingVertical: 12, paddingHorizontal: 15, 
    borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 
  },
  blackGlow: {
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }, elevation: 12,
  },
  headerTitleText: { color: 'white', fontSize: 14, letterSpacing: 1 },
  photoZone: { backgroundColor: '#1A237E', borderRadius: 35, height: 180, overflow: 'hidden', marginBottom: 25 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoText: { color: 'white', fontSize: 11, marginTop: 10 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  formContainer: { width: '100%' },
  label: { fontSize: 11, color: '#1A237E', marginBottom: 8, marginLeft: 10 },
  inputWrapper: { backgroundColor: 'white', borderRadius: 20, marginBottom: 18, borderWidth: 1, borderColor: '#FCE7F3' },
  input: { paddingVertical: 14, paddingHorizontal: 20, color: '#374151' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 22, borderRadius: 50, marginTop: 35, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 14 },
  backBtn: { padding: 5 }
});
