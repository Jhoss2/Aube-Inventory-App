import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Camera, ChevronDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AddMaterialScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  const [quantite, setQuantite] = useState('1');
  const [etat, setEtat] = useState('Bon');
  const [couleur, setCouleur] = useState('');
  const [marque, setMarque] = useState('');
  const [dateAcquisition, setDateAcquisition] = useState('');
  const [dateRenouvellement, setDateRenouvellement] = useState('');
  const [infos, setInfos] = useState('');

  const handleSave = () => {
    console.log("Sauvegarde...", { category, quantite });
    router.back();
  };

  return (
    <View style={styles.mainContainer}>
      {/* Rendre la barre d'état transparente pour que le fond rose passe dessous */}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER ROUGE PILL - Positionné pour éviter l'encoche sans bande blanche */}
        <View style={styles.headerPill}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AJOUTER MATÉRIEL</Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* GRANDE CARTE BLANCHE */}
        <View style={styles.mainCard}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du matériel</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{category || "Climatiseur"}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Quantité</Text>
              <TextInput 
                keyboardType="numeric"
                value={quantite}
                onChangeText={setQuantite}
                style={styles.input}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>État</Text>
              <View style={styles.selectWrapper}>
                <TextInput value={etat} editable={false} style={styles.input} />
                <ChevronDown size={16} color="#1A237E" style={styles.selectIcon} />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Couleur</Text>
              <TextInput 
                placeholder="Ex: Blanc"
                value={couleur}
                onChangeText={setCouleur}
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Marque</Text>
              <TextInput 
                placeholder="Ex: LG"
                value={marque}
                onChangeText={setMarque}
                style={styles.input}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date d'acquisition</Text>
              <TextInput 
                placeholder="JJ/MM/AAAA"
                value={dateAcquisition}
                onChangeText={setDateAcquisition}
                style={styles.input}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Renouvellement</Text>
              <TextInput 
                placeholder="JJ/MM/AAAA"
                value={dateRenouvellement}
                onChangeText={setDateRenouvellement}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo (Optionnel)</Text>
            <TouchableOpacity style={styles.photoBtn}>
              <Camera size={30} color="#1A237E" />
              <Text style={styles.photoBtnText}>PRENDRE UNE PHOTO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Informations supplémentaires</Text>
            <TextInput
              placeholder="Détails, notes..."
              multiline
              numberOfLines={3}
              value={infos}
              onChangeText={setInfos}
              style={[styles.input, styles.textArea]}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>ENREGISTRER LE MATÉRIEL</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50, 
    paddingBottom: 50 
  },
  
  headerPill: { 
    backgroundColor: '#8B0000', 
    height: 55, 
    borderRadius: 30, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    elevation: 5,
    marginBottom: 25
  },
  headerTitle: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  backBtn: { padding: 5 },

  mainCard: { 
    backgroundColor: 'white', 
    borderRadius: 35, 
    padding: 20, 
    elevation: 8,
    borderWidth: 1,
    borderColor: '#FCE7F3'
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 9, fontWeight: '900', color: '#1A237E', textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 10, marginBottom: 5 },
  input: { backgroundColor: '#F8F9FB', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 20, fontSize: 14, fontWeight: '700', color: '#374151', borderWidth: 1, borderColor: '#EDF0F5' },
  readOnlyInput: { backgroundColor: '#F1F5F9', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  readOnlyText: { color: '#64748B', fontWeight: '900', fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  selectWrapper: { position: 'relative', justifyContent: 'center' },
  selectIcon: { position: 'absolute', right: 15 },
  
  photoBtn: { backgroundColor: '#F8FAFC', height: 100, borderRadius: 25, borderWidth: 2, borderColor: 'rgba(26, 35, 126, 0.1)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoBtnText: { fontSize: 10, fontWeight: '900', color: '#1A237E', marginTop: 8 },
  textArea: { height: 80, textAlignVertical: 'top' },

  saveBtn: { backgroundColor: '#1A237E', paddingVertical: 18, borderRadius: 30, marginTop: 30, alignItems: 'center', elevation: 10 },
  saveBtnText: { color: 'white', fontWeight: '900', fontSize: 13, letterSpacing: 2.5 }
});
