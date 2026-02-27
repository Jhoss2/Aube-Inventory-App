import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddMaterialScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', quantity: '', status: 'Bon état', note: '' });

  const handleSave = () => {
    if (!form.name || !form.quantity) {
      Alert.alert("Erreur", "Veuillez remplir au moins le nom et la quantité.");
      return;
    }
    // Ici on pourra ajouter la logique de sauvegarde en base de données
    Alert.alert("Succès", "Matériel ajouté à l'inventaire !");
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>NOUVEAU MATÉRIEL</Text>
        <TouchableOpacity onPress={handleSave}><Feather name="check" size={26} color="white" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>DÉSIGNATION DE L'OBJET</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: Table de bureau, Split, Ordinateur..."
            value={form.name}
            onChangeText={(txt) => setForm({...form, name: txt})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>QUANTITÉ</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Ex: 05"
            keyboardType="numeric"
            value={form.quantity}
            onChangeText={(txt) => setForm({...form, quantity: txt})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ÉTAT ACTUEL</Text>
          <View style={styles.statusContainer}>
            {['Bon état', 'Usé', 'En panne'].map((st) => (
              <TouchableOpacity 
                key={st} 
                style={[styles.statusBtn, form.status === st && styles.statusBtnActive]}
                onPress={() => setForm({...form, status: st})}
              >
                <Text style={[styles.statusText, form.status === st && {color: 'white'}]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>OBSERVATIONS / NOTES</Text>
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
            placeholder="Détails supplémentaires..."
            multiline
            value={form.note}
            onChangeText={(txt) => setForm({...form, note: txt})}
          />
        </View>

        <TouchableOpacity style={styles.mainSaveBtn} onPress={handleSave}>
          <Text style={styles.mainSaveBtnText}>ENREGISTRER L'OBJET</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#8B1A1A', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  content: { padding: 25 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 12, fontWeight: '900', color: '#1D3583', marginBottom: 10, letterSpacing: 1 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, fontSize: 15, borderWidth: 1, borderColor: '#eee' },
  statusContainer: { flexDirection: 'row', gap: 10 },
  statusBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#1D3583', borderColor: '#1D3583' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  mainSaveBtn: { backgroundColor: '#8B1A1A', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  mainSaveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
