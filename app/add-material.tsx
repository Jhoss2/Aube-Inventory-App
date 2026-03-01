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
import { ChevronLeft, Camera, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker'; // Assure-toi que c'est installé
import { useAppContext } from '@/lib/app-context';

export default function AddMaterialScreen() {
  const router = useRouter();
  const { roomId, roomName, category } = useLocalSearchParams<{ roomId: string, roomName: string, category: string }>();
  const { addMateriel } = useAppContext() as any;

  // États du formulaire
  const [quantite, setQuantite] = useState('1');
  const [etat, setEtat] = useState('BON'); // Valeur par défaut
  const [couleur, setCouleur] = useState('');
  const [marque, setMarque] = useState('');
  const [dateAcquisition, setDateAcquisition] = useState('');
  const [dateRenouvellement, setDateRenouvellement] = useState('');
  const [infos, setInfos] = useState('');
  const [image, setImage] = useState<string | null>(null);

  // Fonction pour sélectionner une image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission requise", "Nous avons besoin d'accéder à vos photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!category) {
      Alert.alert("Erreur", "La catégorie est manquante.");
      return;
    }

    const newItem = {
      id: `item-${Date.now()}`,
      roomId: roomId,
      nom: category, // On utilise la catégorie comme nom principal
      category: category,
      quantite: quantite || '1',
      etat: etat,
      couleur: couleur,
      marque: marque,
      dateAcquisition: dateAcquisition,
      dateRenouvellement: dateRenouvellement,
      infos: infos,
      image: image // L'URI de l'image est bien transmise
    };

    try {
      await addMateriel(newItem);
      Alert.alert("Succès", "Matériel enregistré !", [
        { text: "OK", onPress: () => router.push({ pathname: '/room-contents', params: { roomId, roomName } }) }
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Échec de la sauvegarde.");
    }
  };

  // Composant pour le sélecteur d'état
  const StateOption = ({ label }: { label: string }) => (
    <TouchableOpacity 
      style={[styles.stateTab, etat === label && styles.stateTabActive, styles.glowBlack]}
      onPress={() => setEtat(label)}
    >
      <Text style={[styles.stateTabText, etat === label && styles.stateTabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={[styles.headerPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AJOUTER MATÉRIEL</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* CHAMPS FLOTTANTS */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie sélectionnée</Text>
          <View style={[styles.readOnlyInput, styles.glowBlack]}>
            <Text style={styles.readOnlyText}>{category?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 0.4 }]}>
            <Text style={styles.label}>Quantité</Text>
            <TextInput 
              keyboardType="numeric"
              value={quantite}
              onChangeText={setQuantite}
              style={[styles.input, styles.glowBlack]}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.6 }]}>
            <Text style={styles.label}>État du matériel</Text>
            <View style={styles.stateContainer}>
              <StateOption label="NEUF" />
              <StateOption label="BON" />
              <StateOption label="USÉ" />
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Marque</Text>
            <TextInput 
              placeholder="Ex: Samsung"
              value={marque}
              onChangeText={setMarque}
              style={[styles.input, styles.glowBlack]}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Couleur</Text>
            <TextInput 
              placeholder="Ex: Gris"
              value={couleur}
              onChangeText={setCouleur}
              style={[styles.input, styles.glowBlack]}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo de l'objet</Text>
          <TouchableOpacity style={[styles.photoBtn, styles.glowBlack]} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <>
                <Camera size={30} color="#1A237E" />
                <Text style={styles.photoBtnText}>CHOISIR UNE IMAGE</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes / Infos</Text>
          <TextInput
            placeholder="Commentaires..."
            multiline
            value={infos}
            onChangeText={setInfos}
            style={[styles.input, styles.textArea, styles.glowBlack]}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <TouchableOpacity style={[styles.saveBtn, styles.glowBlack]} onPress={handleSave}>
          <Text style={styles.saveBtnText}>ENREGISTRER</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 55, paddingBottom: 50 },
  
  headerPill: { 
    backgroundColor: '#8B0000', height: 55, borderRadius: 50, 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 15, marginBottom: 35
  },
  headerTitle: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  backBtn: { padding: 5 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 9, fontWeight: '900', color: '#1A237E', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 10, marginBottom: 8 },
  
  input: { 
    backgroundColor: 'white', borderRadius: 20, paddingVertical: 14, 
    paddingHorizontal: 20, fontSize: 14, fontWeight: '700', color: '#374151', 
    borderWidth: 1, borderColor: '#FCE7F3' 
  },
  readOnlyInput: { 
    backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 20, 
    paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: '#FCE7F3' 
  },
  readOnlyText: { color: '#1A237E', fontWeight: '900', fontSize: 14 },
  
  row: { flexDirection: 'row', gap: 12 },
  
  // Sélecteur d'état
  stateContainer: { flexDirection: 'row', gap: 5, flex: 1 },
  stateTab: { flex: 1, backgroundColor: 'white', borderRadius: 15, justifyContent: 'center', alignItems: 'center', height: 48, borderWidth: 1, borderColor: '#FCE7F3' },
  stateTabActive: { backgroundColor: '#1A237E', borderColor: '#1A237E' },
  stateTabText: { fontSize: 10, fontWeight: '900', color: '#1A237E' },
  stateTabTextActive: { color: 'white' },
  
  photoBtn: { 
    backgroundColor: 'white', height: 120, borderRadius: 25, borderWidth: 2, 
    borderColor: '#1A237E', borderStyle: 'dashed', alignItems: 'center', 
    justifyContent: 'center', overflow: 'hidden' 
  },
  imagePreview: { width: '100%', height: '100%' },
  photoBtnText: { fontSize: 10, fontWeight: '900', color: '#1A237E', marginTop: 10 },
  
  textArea: { height: 80, textAlignVertical: 'top' },

  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 20, borderRadius: 50, marginTop: 20, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 2.5 },

  glowBlack: {
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }
  }
});
