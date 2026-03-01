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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function AddMaterialScreen() {
  const router = useRouter();
  const { roomId, roomName, category } = useLocalSearchParams<{ roomId: string, roomName: string, category: string }>();
  const { addMateriel } = useAppContext() as any;

  // États du formulaire
  const [nom, setNom] = useState(''); // Champ désormais vide et éditable
  const [quantite, setQuantite] = useState('1');
  const [etat, setEtat] = useState('BON'); 
  const [marque, setMarque] = useState('');
  const [couleur, setCouleur] = useState('');
  const [infos, setInfos] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission", "Accès à la galerie requis.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    // On utilise le nom saisi, ou la catégorie par défaut si vide
    const finalName = nom.trim() || category || "Matériel";

    const newItem = {
      id: `item-${Date.now()}`,
      roomId,
      nom: finalName, 
      category,
      quantite,
      etat,
      marque,
      couleur,
      infos,
      image
    };

    try {
      await addMateriel(newItem);
      Alert.alert("Succès", "Enregistré avec succès !", [
        { text: "OK", onPress: () => router.push({ pathname: '/room-contents', params: { roomId, roomName } }) }
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Sauvegarde impossible");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER PILL AVEC LUEUR NOIRE */}
        <View style={[styles.headerPill, styles.glow]}>
          <TouchableOpacity onPress={() => router.back()}><ChevronLeft size={28} color="white" /></TouchableOpacity>
          <Text style={styles.headerTitle}>NOUVEL OBJET</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* NOM / TYPE (DÉSORMAIS ÉDITABLE) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom ou Type de matériel</Text>
          <TextInput 
            style={[styles.input, styles.glow]} 
            value={nom} 
            onChangeText={setNom} 
            placeholder={`Ex: ${category || 'Climatiseur'}...`}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 0.4 }}>
            <Text style={styles.label}>Quantité</Text>
            <TextInput 
              style={[styles.input, styles.glow]} 
              value={quantite} 
              onChangeText={setQuantite} 
              keyboardType="numeric" 
            />
          </View>
          <View style={{ flex: 0.6 }}>
            <Text style={styles.label}>État actuel</Text>
            <View style={styles.stateSelector}>
              {['NEUF', 'BON', 'USÉ'].map((s) => (
                <TouchableOpacity 
                  key={s} 
                  onPress={() => setEtat(s)}
                  style={[styles.stateBtn, etat === s && styles.stateBtnActive, styles.glow]}
                >
                  <Text style={[styles.stateBtnText, etat === s && styles.whiteText]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Marque</Text>
            <TextInput style={[styles.input, styles.glow]} value={marque} onChangeText={setMarque} placeholder="Ex: Sony" placeholderTextColor="#94A3B8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Couleur</Text>
            <TextInput style={[styles.input, styles.glow]} value={couleur} onChangeText={setCouleur} placeholder="Ex: Noir" placeholderTextColor="#94A3B8" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo de l'équipement</Text>
          <TouchableOpacity style={[styles.photoBox, styles.glow]} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.fullImg} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Camera size={32} color="#1A237E" />
                <Text style={styles.photoText}>AJOUTER UNE PHOTO</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Informations / Notes</Text>
          <TextInput 
            style={[styles.input, styles.textArea, styles.glow]} 
            multiline 
            value={infos} 
            onChangeText={setInfos} 
            placeholder="Détails techniques, emplacement précis..."
            placeholderTextColor="#94A3B8"
          />
        </View>

        <TouchableOpacity style={[styles.saveBtn, styles.glow]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>VALIDER L'ENREGISTREMENT</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { padding: 25, paddingTop: 55, paddingBottom: 40 },
  
  headerPill: { 
    backgroundColor: '#8B0000', height: 55, borderRadius: 50, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 15, marginBottom: 35 
  },
  headerTitle: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 9, fontWeight: '900', color: '#1A237E', letterSpacing: 1.5, marginLeft: 10, marginBottom: 8, textTransform: 'uppercase' },
  
  input: { 
    backgroundColor: 'white', borderRadius: 20, padding: 15, 
    fontWeight: '700', color: '#374151', borderWidth: 1, borderColor: '#FCE7F3' 
  },
  
  row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  stateSelector: { flexDirection: 'row', gap: 6, flex: 1 },
  stateBtn: { flex: 1, backgroundColor: 'white', borderRadius: 15, justifyContent: 'center', alignItems: 'center', height: 50 },
  stateBtnActive: { backgroundColor: '#1A237E' },
  stateBtnText: { fontSize: 9, fontWeight: '900', color: '#1A237E' },
  whiteText: { color: 'white' },
  
  photoBox: { 
    backgroundColor: 'white', height: 130, borderRadius: 25, 
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden', 
    borderWidth: 2, borderColor: '#1A237E', borderStyle: 'dashed' 
  },
  photoText: { fontSize: 9, fontWeight: '900', color: '#1A237E', marginTop: 8 },
  fullImg: { width: '100%', height: '100%' },
  textArea: { height: 90, textAlignVertical: 'top' },
  
  saveBtn: { 
    backgroundColor: '#1A237E', paddingVertical: 20, borderRadius: 50, 
    marginTop: 10, alignItems: 'center' 
  },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  
  // Lueur noire prononcée
  glow: { 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOpacity: 0.25, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 5 } 
  }
});
