import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, StatusBar, Alert, Image, Platform, Modal 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera, ChevronDown, X, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

// Niveaux disponibles, dans l'ordre hiérarchique attendu par l'écran Bloc Details
const NIVEAUX = ['Rez-de-chaussée', 'Niveau 1', 'Niveau 2', 'Niveau 3', 'Niveau 4', 'Niveau 5'];

export default function AddRoomScreen() {
  const router = useRouter();
  const { blockId, type, level } = useLocalSearchParams<{ blockId: string, type: string, level: string }>();
  const { addSalle } = useAppContext();
  
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [niveau, setNiveau] = useState(NIVEAUX.includes(level) ? level : NIVEAUX[0]);
  const [niveauPickerVisible, setNiveauPickerVisible] = useState(false);

  const formatLabel = (txt: string) => {
    if (!txt) return "";
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }
    addSalle({
      id: Date.now().toString(),
      blockId: blockId,
      type: type,
      name: nom,
      location: emplacement,
      level: niveau,
      capacity, surface: area, image,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.redHeaderPill, styles.blackGlow]}>
          <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={28} color="white" /></TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>{(type + " - BLOC " + blockId).toUpperCase()}</Text>
          <View style={{ width: 40 }} />
        </View>

        <TouchableOpacity style={[styles.photoZone, styles.blackGlow]} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={styles.imagePreview} /> : (
            <View style={styles.photoPlaceholder}>
              <Camera size={40} color="white" />
              <Text style={[styles.photoText, styles.boldSerifItalic]}>{formatLabel("Ajouter une image")}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Nom")}</Text>
          <View style={[styles.inputWrapper, styles.blackGlow]}>
            <TextInput style={[styles.input, styles.boldSerifItalic]} value={nom} onChangeText={setNom} placeholder="Ex: Salle 05" />
          </View>

          <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Emplacement")}</Text>
          <View style={[styles.inputWrapper, styles.blackGlow]}>
            <TextInput style={[styles.input, styles.boldSerifItalic]} value={emplacement} onChangeText={setEmplacement} placeholder="Ex: Bloc C" />
          </View>

          <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Niveau")}</Text>
          <TouchableOpacity
            style={[styles.inputWrapper, styles.blackGlow, styles.selectRow]}
            onPress={() => setNiveauPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.input, styles.boldSerifItalic]}>{niveau}</Text>
            <ChevronDown size={20} color="#1A237E" style={styles.selectIcon} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Capacité")}</Text>
              <View style={[styles.inputWrapper, styles.blackGlow]}><TextInput style={[styles.input, styles.boldSerifItalic]} value={capacity} onChangeText={setCapacity} keyboardType="numeric" /></View>
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={[styles.label, styles.boldSerifItalic]}>{formatLabel("Superficie")}</Text>
              <View style={[styles.inputWrapper, styles.blackGlow]}><TextInput style={[styles.input, styles.boldSerifItalic]} value={area} onChangeText={setArea} keyboardType="numeric" /></View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, styles.blackGlow]} onPress={handleSave}>
          <Text style={[styles.saveBtnText, styles.boldSerifItalic]}>{formatLabel("Enregistrer la salle")}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={niveauPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNiveauPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={[styles.pickerBox, styles.blackGlow]}>
            <View style={styles.pickerHeader}>
              <Text style={[styles.pickerTitle, styles.boldSerifItalic]}>{formatLabel("Choisir le niveau")}</Text>
              <TouchableOpacity onPress={() => setNiveauPickerVisible(false)}>
                <X size={22} color="#8B0000" />
              </TouchableOpacity>
            </View>
            {NIVEAUX.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.pickerOption, n === niveau && styles.pickerOptionActive]}
                onPress={() => { setNiveau(n); setNiveauPickerVisible(false); }}
              >
                <Text style={[styles.pickerOptionText, styles.boldSerifItalic, n === niveau && styles.pickerOptionTextActive]}>
                  {n}
                </Text>
                {n === niveau && <Check size={18} color="#8B0000" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  boldSerifItalic: { fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', fontWeight: '900', fontStyle: 'italic' },
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { padding: 25, paddingTop: 50, paddingBottom: 60 },
  redHeaderPill: { backgroundColor: '#8B0000', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  blackGlow: { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 12 },
  headerTitleText: { color: 'white', fontSize: 20 },
  photoZone: { backgroundColor: '#1A237E', borderRadius: 35, height: 180, overflow: 'hidden', marginBottom: 25 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoText: { color: 'white', fontSize: 14, marginTop: 10 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  formContainer: { width: '100%' },
  label: { fontSize: 11, color: '#1A237E', marginBottom: 8, marginLeft: 10 },
  inputWrapper: { backgroundColor: 'white', borderRadius: 20, marginBottom: 18, borderWidth: 1, borderColor: '#FCE7F3' },
  input: { paddingVertical: 14, paddingHorizontal: 20, color: '#374151' },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 22, borderRadius: 50, marginTop: 35, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16 },

  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectIcon: { marginRight: 16 },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pickerBox: { backgroundColor: 'white', borderRadius: 24, padding: 20, width: '100%', maxWidth: 480 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pickerTitle: { fontSize: 16, color: '#8B0000' },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, marginBottom: 6 },
  pickerOptionActive: { backgroundColor: '#FFE4E8' },
  pickerOptionText: { fontSize: 15, color: '#374151' },
  pickerOptionTextActive: { color: '#8B0000' },
});
