import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function AddRoomScreen() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');

  const handleSave = () => {
    if (!roomName) {
      Alert.alert("Erreur", "Veuillez donner un nom ou un numéro à la pièce.");
      return;
    }
    Alert.alert("Succès", `La pièce "${roomName}" a été ajoutée.`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={26} color="#1D3583" /></TouchableOpacity>
        <Text style={styles.headerTitle}>AJOUTER UNE PIÈCE</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.iconCircle}>
          <Feather name="plus-square" size={40} color="#8B1A1A" />
        </View>

        <Text style={styles.instruction}>Entrez le nom ou le numéro de la nouvelle salle / bureau :</Text>

        <TextInput 
          style={styles.input}
          placeholder="Ex: Salle A1-05 ou Bureau 204"
          value={roomName}
          onChangeText={setRoomName}
          autoFocus
        />

        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <Text style={styles.btnText}>CRÉER LA PIÈCE</Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>Elle sera automatiquement rattachée au bloc actuel.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3583', marginLeft: 20 },
  form: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fceef5', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  instruction: { textAlign: 'center', color: '#666', marginBottom: 20, fontSize: 14 },
  input: { width: '100%', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 15, fontSize: 18, textAlign: 'center', borderWidth: 1, borderColor: '#eee', marginBottom: 30 },
  btn: { backgroundColor: '#1D3583', width: '100%', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  hint: { marginTop: 20, color: '#bbb', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }
});
