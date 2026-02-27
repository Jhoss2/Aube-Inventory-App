import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useAppContext } from '@/lib/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateSettings } = useAppContext();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [openSections, setOpenSections] = useState({
    general: true,
    menu: false,
    blocs: false,
    base: false,
    docs: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogin = () => {
    if (password === '123') { // Tu peux changer le mot de passe ici
      setIsAuthenticated(true);
    } else {
      Alert.alert("Accès refusé", "Mot de passe incorrect.");
    }
  };

  const pickImage = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  const pickDoc = async (field: string) => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) {
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  // Petit composant interne pour les lignes de sélection
  const SettingRow = ({ label, field, type = 'image' }: { label: string, field: string, type?: 'image' | 'pdf' }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <TouchableOpacity 
        style={[styles.rowButton, appData.settings?.[field as any] && styles.rowButtonActive]} 
        onPress={() => type === 'image' ? pickImage(field) : pickDoc(field)}
      >
        <Feather name={appData.settings?.[field as any] ? "check-circle" : "upload"} size={16} color={appData.settings?.[field as any] ? "white" : "#666"} />
        <Text style={[styles.rowButtonText, appData.settings?.[field as any] && {color: 'white'}]}>
          {appData.settings?.[field as any] ? "Modifié" : "Choisir"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authModal}>
          <MaterialCommunityIcons name="shield-lock" size={48} color="#8B1A1A" style={{alignSelf: 'center', marginBottom: 15}} />
          <Text style={styles.authTitle}>ADMINISTRATEUR</Text>
          <TextInput 
            style={styles.authInput} 
            placeholder="Mot de passe" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.authBtn} onPress={handleLogin}>
            <Text style={styles.authBtnText}>VALIDER</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 15}}>
            <Text style={{color: '#666', textAlign: 'center'}}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PARAMÈTRES SYSTÈME</Text>
        <TouchableOpacity onPress={() => router.back()}><Feather name="x" size={24} color="black" /></TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* SECTION GÉNÉRAL */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('general')}>
          <Text style={styles.accordionTitle}>Général</Text>
          <Feather name={openSections.general ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.general && (
          <View style={styles.accordionContent}>
            <SettingRow label="Image de l'Université" field="univImage" />
            <SettingRow label="Arrière-plan Accueil" field="bgImage" />
          </View>
        )}

        {/* SECTION MENU */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('menu')}>
          <Text style={styles.accordionTitle}>Menu Latéral</Text>
          <Feather name={openSections.menu ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.menu && (
          <View style={styles.accordionContent}>
            <SettingRow label="Arrière-plan du Menu" field="menuBg" />
            <SettingRow label="Logo du Menu" field="menuLogo" />
          </View>
        )}

        {/* SECTION BLOCS (A à F) */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('blocs')}>
          <Text style={styles.accordionTitle}>Personnalisation des Blocs</Text>
          <Feather name={openSections.blocs ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.blocs && (
          <View style={styles.accordionContent}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((b) => (
              <View key={b} style={{marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', pb: 10}}>
                <Text style={styles.blockLabel}>BLOC {b}</Text>
                <SettingRow label={`Vue Aérienne ${b}`} field={`bloc${b}_aerial`} />
                <SettingRow label={`Image Salles ${b}1`} field={`bloc${b}_sub1`} />
                <SettingRow label={`Image Bureaux ${b}2`} field={`bloc${b}_sub2`} />
              </View>
            ))}
          </View>
        )}

        {/* SECTION DOCUMENTS */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('docs')}>
          <Text style={styles.accordionTitle}>Documents (PDF)</Text>
          <Feather name={openSections.docs ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.docs && (
          <View style={styles.accordionContent}>
            <SettingRow label="Guide d'utilisation" field="guidePdf" type="pdf" />
            <SettingRow label="À propos du développeur" field="aboutPdf" type="pdf" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1D3583' },
  
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  accordionTitle: { fontWeight: 'bold', color: '#333' },
  accordionContent: { padding: 20, backgroundColor: 'white' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  rowLabel: { fontSize: 14, color: '#444', flex: 1 },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  rowButtonActive: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  rowButtonText: { fontSize: 12, fontWeight: '600' },
  
  blockLabel: { fontSize: 14, fontWeight: '900', color: '#8B1A1A', marginBottom: 10 },

  authContainer: { flex: 1, backgroundColor: '#1D3583', justifyContent: 'center', padding: 30 },
  authModal: { backgroundColor: 'white', borderRadius: 20, padding: 30, elevation: 20 },
  authTitle: { textAlign: 'center', fontSize: 16, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  authInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 20, textAlign: 'center', fontSize: 18 },
  authBtn: { backgroundColor: '#8B1A1A', padding: 15, borderRadius: 10, alignItems: 'center' },
  authBtnText: { color: 'white', fontWeight: 'bold' }
});
