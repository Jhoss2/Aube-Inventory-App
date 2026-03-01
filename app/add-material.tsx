import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft, Camera } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function AddMaterielScreen() {
  const router = useRouter();
  const { roomId, category, roomName } = useLocalSearchParams<{ roomId: string, category: string, roomName: string }>();
  
  const { addMateriel } = useAppContext() as any;

  const [quantite, setQuantite] = useState('1');
  const [etat, setEtat] = useState('Bon');
  const [couleur, setCouleur] = useState('');
  const [marque, setMarque] = useState('');
  const [infos, setInfos] = useState('');

  const handleSave = async () => {
    if (!quantite || parseInt(quantite) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide.");
      return;
    }

    const newItem = {
      roomId: roomId,
      nom: category, 
      quantite: parseInt(quantite) || 1,
      etat,
      couleur: couleur.trim(),
      marque: marque.trim(),
      dateAcquisition: new Date().toLocaleDateString(),
      commentaires: infos.trim(),
    };

    try {
      await addMateriel(newItem);
      Alert.alert("Succès", `${category} ajouté à ${roomName} !`, [
        { text: "OK", onPress: () => router.push({ pathname: '/room-details', params: { roomId } }) }
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'enregistrer le matériel.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* HEADER ROUGE PILL SHAPE */}
        <View style={styles.headerWrapper}>
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>AJOUTER MATÉRIEL</Text>
            <View style={{ width: 40 }} /> 
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          <View style={styles.redBadgeLabel}>
            <Text style={styles.redBadgeLabelText}>INFORMATIONS DÉTAILLÉES</Text>
          </View>

          {/* GRANDE CARTE ROSE */}
          <View style={styles.pinkCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom du matériel</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{category}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Quantité</Text>
                <TextInput value={quantite} onChangeText={setQuantite} keyboardType="numeric" style={styles.input} />
              </View>
              <View style={[styles.flex1, { marginLeft: 15 }]}>
                <Text style={styles.label}>État</Text>
                <TouchableOpacity style={styles.selectInput}>
                  <Text style={styles.inputText}>{etat}</Text>
                  <Ionicons name="chevron-down" size={16} color="#1D3583" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Couleur</Text>
                <TextInput placeholder="Ex: Blanc" value={couleur} onChangeText={setCouleur} style={styles.input} />
              </View>
              <View style={[styles.flex1, { marginLeft: 15 }]}>
                <Text style={styles.label}>Marque</Text>
                <TextInput placeholder="Ex: Philips" value={marque} onChangeText={setMarque} style={styles.input} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Photo (Optionnel)</Text>
              <TouchableOpacity style={styles.photoBox}>
                <Camera size={32} color="#1D3583" />
                <Text style={styles.photoText}>Prendre une photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Informations supplémentaires</Text>
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Détails, notes..."
                value={infos}
                onChangeText={setInfos}
                style={[styles.input, styles.textArea]}
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>ENREGISTRER LE MATÉRIEL</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerWrapper: { paddingVertical: 10, alignItems: 'center', backgroundColor: 'white' },
  redHeaderPill: { backgroundColor: '#8B0000', width: '92%', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 50, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontWeight: 'bold', fontSize: 14, flex: 1, textAlign: 'center', letterSpacing: 1 },
  scroll: { flex: 1, paddingHorizontal: 20 },
  redBadgeLabel: { backgroundColor: '#8B0000', paddingVertical: 12, borderRadius: 50, alignItems: 'center', marginVertical: 20 },
  redBadgeLabelText: { color: 'white', fontWeight: 'bold', fontSize: 10, letterSpacing: 2 },
  pinkCard: { backgroundColor: '#FDE7F3', borderRadius: 35, padding: 20, borderWidth: 1, borderColor: '#FCE7F3', elevation: 3 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 9, fontWeight: '900', color: '#1D3583', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8, marginLeft: 10 },
  input: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, color: '#374151', fontWeight: 'bold', borderWidth: 1, borderColor: 'white' },
  readOnlyInput: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: 'white' },
  readOnlyText: { color: '#6b7280', fontWeight: 'bold' },
  selectInput: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'white' },
  inputText: { color: '#374151', fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 15 },
  flex1: { flex: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  photoBox: { width: '100%', height: 100, borderRadius: 25, borderStyle: 'dashed', borderWidth: 2, borderColor: '#1D358333', backgroundColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
  photoText: { fontSize: 10, fontWeight: 'bold', color: '#1D3583', marginTop: 8 },
  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 20, borderRadius: 50, marginTop: 30, alignItems: 'center', elevation: 8 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 2 }
});
