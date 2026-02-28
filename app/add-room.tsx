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
import { Feather, Ionicons } from '@expo/vector-icons';
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
      image: null,
    };

    try {
      if (addSalle) {
        await addSalle(newRoom); 
        Alert.alert("Succès", "Salle enregistrée !", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (err) {
      Alert.alert("Erreur", "Impossible de sauvegarder dans SQLite");
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

        <TouchableOpacity style={styles.photoZone} activeOpacity={0.9}>
          <Feather name="camera" size={48} color="white" />
          <Text style={styles.photoText}>Photo de la salle</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <TextInput style={styles.input} value={nom} onChangeText={setNom} placeholder="Nom" placeholderTextColor="#9ca3af" />
          <TextInput style={styles.input} value={emplacement} onChangeText={setEmplacement} placeholder="Emplacement" placeholderTextColor="#9ca3af" />
          <TextInput style={styles.input} value={niveau} onChangeText={setNiveau} placeholder="Niveau" placeholderTextColor="#9ca3af" />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={capacity} onChangeText={setCapacity} placeholder="Capacité" keyboardType="numeric" placeholderTextColor="#9ca3af" />
            <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} value={area} onChangeText={setArea} placeholder="Superficie" placeholderTextColor="#9ca3af" />
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
  photoZone: { backgroundColor: '#1D3583', borderRadius: 40, height: 180, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  photoText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  form: { marginTop: 20 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 50, paddingHorizontal: 25, paddingVertical: 16, marginBottom: 15 },
  row: { flexDirection: 'row' },
  planZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 40, paddingVertical: 40, alignItems: 'center', marginTop: 10 },
  planText: { color: '#9ca3af', fontWeight: 'bold', marginTop: 8 },
  footer: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  saveBtn: { backgroundColor: '#1D3583', paddingVertical: 20, borderRadius: 50, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});
