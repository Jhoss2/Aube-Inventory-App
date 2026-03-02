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
      blockId: blocId,
      type: type,
      name: nom.trim(),
      location: emplacement.trim(),
      level: niveau.trim(),
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ROUGE PILL */}
        <View style={[styles.redHeaderPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.boldSerif]}>
            {type?.toUpperCase()} - BLOC {blocId}
          </Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* ZONE PHOTO */}
        <TouchableOpacity style={[styles.photoZone, styles.glow]} activeOpacity={0.9} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera size={40} color="white" />
              <Text style={[styles.photoText, styles.boldSerif]}>AJOUTER UNE IMAGE</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FORMULAIRE (STYLE TOUT EN GRAS) */}
        <View style={styles.formContainer}>
          <Text style={[styles.label, styles.boldSerif]}>NOM</Text>
          <TextInput 
            style={[styles.input, styles.boldSerif]} 
            value={nom} 
            onChangeText={setNom} 
            placeholder="Ex: Salle 102" 
            placeholderTextColor="#94A3B8" 
          />

          <Text style={[styles.label, styles.boldSerif]}>EMPLACEMENT</Text>
          <TextInput 
            style={[styles.input, styles.boldSerif]} 
            value={emplacement} 
            onChangeText={setEmplacement} 
            placeholder="Ex: Bâtiment A, Aile Est" 
            placeholderTextColor="#94A3B8" 
          />

          <Text style={[styles.label, styles.boldSerif]}>NIVEAU</Text>
          <TextInput 
            style={[styles.input, styles.boldSerif, { backgroundColor: '#F1F5F9' }]} 
            value={niveau} 
            placeholderTextColor="#94A3B8"
            editable={false} 
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.label, styles.boldSerif]}>CAPACITÉ</Text>
              <TextInput 
                style={[styles.input, styles.boldSerif]} 
                value={capacity} 
                onChangeText={setCapacity} 
                placeholder="Pers." 
                keyboardType="numeric" 
                placeholderTextColor="#94A3B8" 
              />
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={[styles.label, styles.boldSerif]}>SUPERFICIE</Text>
              <TextInput 
                style={[styles.input, styles.boldSerif]} 
                value={area} 
                onChangeText={setArea} 
                placeholder="m²" 
                keyboardType="numeric" 
                placeholderTextColor="#94A3B8" 
              />
            </View>
          </View>

          <TouchableOpacity style={[styles.planBox, styles.glow]}>
            <Box size={24} color="#1A237E" />
            <Text style={[styles.planText, styles.boldSerif]}>AJOUTER PLAN 3D</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.saveBtn, styles.glow]} onPress={handleSaveRoom}>
          <Text style={[styles.saveBtnText, styles.boldSerif]}>ENREGISTRER</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { 
    padding: 25, 
    paddingTop: 55, 
    paddingBottom: 60 
  },

  // STYLE CENTRALISÉ : SERIF + GRAS MAXIMUM
  boldSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
  },
  
  redHeaderPill: { 
    backgroundColor: '#8B0000', paddingVertical: 12, paddingHorizontal: 15, 
    borderRadius: 50, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', marginBottom: 35
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontSize: 13, letterSpacing: 3, textTransform: 'uppercase' },
  
  photoZone: { backgroundColor: '#1A237E', borderRadius: 35, height: 180, overflow: 'hidden', marginBottom: 25 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoText: { color: 'white', fontSize: 11, marginTop: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  imagePreview: { width: '100%', height: '100%' },

  formContainer: { width: '100%' },
  label: { fontSize: 10, color: '#1A237E', letterSpacing: 2, marginBottom: 8, marginLeft: 10, textTransform: 'uppercase' },
  input: { 
    backgroundColor: 'white', 
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, 
    marginBottom: 18, color: '#374151', fontSize: 15,
    borderWidth: 1, borderColor: '#FCE7F3'
  },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  planBox: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#1A237E', 
    borderRadius: 25, paddingVertical: 20, marginTop: 5, backgroundColor: 'rgba(255,255,255,0.7)' 
  },
  planText: { color: '#1A237E', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },

  saveBtn: { 
    backgroundColor: '#1A237E', paddingVertical: 22, borderRadius: 50, 
    marginTop: 35, alignItems: 'center' 
  },
  saveBtnText: { color: 'white', fontSize: 14, letterSpacing: 3, textTransform: 'uppercase' },
  
  glow: { 
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, 
    shadowRadius: 10, shadowOffset: { width: 0, height: 5 } 
  }
});
