import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function AddMaterielScreen() {
  const router = useRouter();
  // Récupération des paramètres envoyés par room-details ou categories
  const { roomId, category, roomName } = useLocalSearchParams<{ roomId: string, category: string, roomName: string }>();
  
  const context = useAppContext();
  const { addMateriel } = context as any;

  // États du formulaire
  const [quantite, setQuantite] = useState('1');
  const [etat, setEtat] = useState('Bon');
  const [couleur, setCouleur] = useState('');
  const [marque, setMarque] = useState('');
  const [dateAcq, setDateAcq] = useState(new Date().toLocaleDateString());
  const [dateRen, setDateRen] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString());
  const [infos, setInfos] = useState('');

  const handleSave = async () => {
    if (!quantite || parseInt(quantite) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide.");
      return;
    }

    const newItem = {
      roomId: roomId, // Correspond à l'ID de la salle
      nom: category || "Matériel", 
      quantite: parseInt(quantite) || 1,
      etat,
      couleur: couleur.trim(),
      marque: marque.trim(),
      dateAcquisition: dateAcq,
      dateRenouvellement: dateRen,
      commentaires: infos.trim(),
    };

    try {
      if (addMateriel) {
        await addMateriel(newItem);
        Alert.alert("Succès", `${category || 'Matériel'} ajouté !`, [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le matériel.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AJOUTER MATÉRIEL</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Badge Rouge d'entête */}
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>INFORMATIONS DÉTAILLÉES</Text>
        </View>

        {/* GRANDE CARTE ROSE ARRONDIE */}
        <View style={styles.pinkCard}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du matériel</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{category || "Non spécifié"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Quantité</Text>
              <TextInput
                value={quantite}
                onChangeText={setQuantite}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={styles.label}>État</Text>
              <TouchableOpacity style={styles.selectInput} activeOpacity={0.7}>
                <Text style={styles.inputText}>{etat}</Text>
                <Ionicons name="chevron-down" size={16} color="#1D3583" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Couleur</Text>
              <TextInput
                placeholder="Ex: Blanc"
                value={couleur}
                onChangeText={setCouleur}
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={styles.label}>Marque</Text>
              <TextInput
                placeholder="Ex: Philips"
                value={marque}
                onChangeText={setMarque}
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo (Optionnel)</Text>
            <TouchableOpacity style={styles.photoBox}>
              <Ionicons name="camera" size={32} color="#1D3583" />
              <Text style={styles.photoText}>Prendre une photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Acquisition</Text>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{dateAcq}</Text>
              </View>
            </View>
            <View style={[styles.flex1, { marginLeft: 15 }]}>
              <Text style={styles.label}>Renouvellement</Text>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{dateRen}</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Informations supplémentaires</Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Détails, notes..."
              value={infos}
              onChangeText={setInfos}
              placeholderTextColor="#9ca3af"
              style={[styles.input, styles.textArea]}
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <Text style={styles.saveBtnText}>ENREGISTRER LE MATÉRIEL</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 15, 
    backgroundColor: 'white', 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  backBtn: { padding: 5 },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#1D3583', fontSize: 18, letterSpacing: 1 },
  scroll: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  redBadge: { backgroundColor: '#8B0000', paddingVertical: 12, borderRadius: 50, alignItems: 'center', marginBottom: 20 },
  redBadgeText: { color: 'white', fontWeight: 'bold', fontSize: 10, letterSpacing: 2 },
  pinkCard: { backgroundColor: '#FDE7F3', borderRadius: 35, padding: 20, borderWidth: 1, borderColor: '#FCE7F3' },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 9, fontWeight: '900', color: '#1D3583', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginLeft: 10 },
  input: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, color: '#374151', fontWeight: 'bold', borderWidth: 1, borderColor: 'white' },
  inputText: { color: '#374151', fontWeight: 'bold' },
  textArea: { height: 100, textAlignVertical: 'top' },
  readOnlyInput: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: 'white' },
  readOnlyText: { color: '#6b7280', fontWeight: 'bold' },
  selectInput: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'white' },
  row: { flexDirection: 'row', marginBottom: 15 },
  flex1: { flex: 1 },
  photoBox: { width: '100%', height: 120, borderRadius: 25, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1D358333', backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  photoText: { fontSize: 10, fontWeight: 'bold', color: '#1D3583', marginTop: 8 },
  dateBox: { backgroundColor: '#F8F9FB', borderRadius: 15, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'white' },
  dateText: { color: '#374151', fontWeight: 'bold', fontSize: 11 },
  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 20, borderRadius: 50, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 2 }
});
