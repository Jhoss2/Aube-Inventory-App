import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context'; // Ton contexte qui gère SQLite

export default function AddRoomScreen() {
  const router = useRouter();
  const { addSalle } = useAppContext(); // On récupère la fonction SQLite
  
  // États du formulaire
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [niveau, setNiveau] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');

  const handleSaveRoom = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Le nom de la salle est obligatoire");
      return;
    }

    const newRoom = {
      nom: nom.trim(),
      emplacement: emplacement.trim(),
      niveau: niveau.trim(),
      capacity: capacity.trim(),
      area: area.trim(),
      image: null, // À lier avec ImagePicker plus tard
    };

    try {
      // APPEL SQLITE VIA LE CONTEXTE
      await addSalle(newRoom); 
      
      Alert.alert("Succès", "Salle enregistrée dans la base de données !", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de sauvegarder dans SQLite");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Titre Rouge (Header Style) */}
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>AJOUTER UNE SALLE</Text>
        </View>

        {/* 2. Zone Photo (Rectangle Bleu) */}
        <TouchableOpacity style={styles.photoZone} activeOpacity={0.9}>
          <Feather name="camera" size={48} color="white" />
          <Text style={styles.photoText}>Photo de la salle</Text>
        </TouchableOpacity>

        {/* 3. Formulaire */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={nom}
            onChangeText={setNom}
            placeholder="Nom"
            placeholderTextColor="#9ca3af"
          />

          <TextInput
            style={styles.input}
            value={emplacement}
            onChangeText={setEmplacement}
            placeholder="Emplacement (ex: Bloc A)"
            placeholderTextColor="#9ca3af"
          />

          <TextInput
            style={styles.input}
            value={niveau}
            onChangeText={setNiveau}
            placeholder="Niveau"
            placeholderTextColor="#9ca3af"
          />

          {/* Ligne : Capacité et Superficie */}
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              value={capacity}
              onChangeText={setCapacity}
              placeholder="Capacité"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              value={area}
              onChangeText={setArea}
              placeholder="Superficie (m²)"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* 4. Zone Plan 3D (Pointillés) */}
        <TouchableOpacity style={styles.planZone} activeOpacity={0.6}>
          <Feather name="box" size={42} color="#9ca3af" />
          <Text style={styles.planText}>Ajouter Plan 3D</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 5. Bouton Enregistrer (Fixé en bas) */}
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
  
  redBadge: { 
    backgroundColor: '#B21F18', 
    paddingVertical: 16, 
    borderRadius: 50, 
    elevation: 8,
    marginVertical: 10,
  },
  redBadgeText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 },

  photoZone: { 
    backgroundColor: '#1D3583', 
    borderRadius: 40, 
    height: 180, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 15,
    elevation: 4
  },
  photoText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 10 },

  form: { marginTop: 20 },
  input: { 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#f3f4f6', 
    borderRadius: 50, 
    paddingHorizontal: 25, 
    paddingVertical: 16, 
    fontSize: 15, 
    color: '#374151',
    marginBottom: 15,
    elevation: 2
  },
  row: { flexDirection: 'row' },

  planZone: { 
    borderWidth: 2, 
    borderStyle: 'dashed', 
    borderColor: '#d1d5db', 
    borderRadius: 40, 
    paddingVertical: 40, 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginTop: 10
  },
  planText: { color: '#9ca3af', fontWeight: 'bold', marginTop: 8 },

  footer: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  saveBtn: { 
    backgroundColor: '#1D3583', 
    paddingVertical: 20, 
    borderRadius: 50, 
    alignItems: 'center', 
    elevation: 10,
    shadowColor: '#1D3583',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18, letterSpacing: 2 }
});
