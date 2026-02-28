import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateSettings } = useAppContext() as any;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [openSections, setOpenSections] = useState({
    general: true,
    menu: false,
    blocs: false,
    affiches: false, // Renommé de 'docs' à 'affiches'
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogin = () => {
    if (password === '123') { 
      setIsAuthenticated(true);
    } else {
      Alert.alert("Accès refusé", "Mot de passe incorrect.");
    }
  };

  const pickImage = async (field: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Désactivé pour garder l'aspect ratio de ton affiche originale
      quality: 0.9,
    });
    if (!result.canceled) {
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  const SettingRow = ({ label, field }: { label: string, field: string }) => {
    const settings = (appData.settings || {}) as any;
    const hasValue = !!settings[field];

    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <TouchableOpacity 
          style={[styles.rowButton, hasValue && styles.rowButtonActive]} 
          onPress={() => pickImage(field)}
        >
          <Feather name={hasValue ? "check-circle" : "image"} size={16} color={hasValue ? "white" : "#666"} />
          <Text style={[styles.rowButtonText, hasValue && {color: 'white'}]}>
            {hasValue ? "Défini" : "Choisir"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
            autoFocus
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
        {/* Section Générale */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('general')}>
          <Text style={styles.accordionTitle}>Interface Accueil</Text>
          <Feather name={openSections.general ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.general && (
          <View style={styles.accordionContent}>
            <SettingRow label="Image de l'Université" field="univImage" />
            <SettingRow label="Arrière-plan Accueil" field="bgImage" />
          </View>
        )}

        {/* Section Menu */}
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

        {/* Section Blocs */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('blocs')}>
          <Text style={styles.accordionTitle}>Personnalisation des Blocs</Text>
          <Feather name={openSections.blocs ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.blocs && (
          <View style={styles.accordionContent}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((b) => (
              <View key={b} style={styles.blockSection}>
                <Text style={styles.blockLabel}>BLOC {b}</Text>
                <SettingRow label={`Vue Aérienne ${b}`} field={`bloc${b}_aerial`} />
                <SettingRow label={`Image Salles ${b}1`} field={`bloc${b}_sub1`} />
                <SettingRow label={`Image Bureaux ${b}2`} field={`bloc${b}_sub2`} />
              </View>
            ))}
          </View>
        )}

        {/* Section Affiches - Le nouveau "Bricolage" */}
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('affiches')}>
          <Text style={styles.accordionTitle}>Affiches d'Information (Images)</Text>
          <Feather name={openSections.affiches ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.affiches && (
          <View style={styles.accordionContent}>
            <SettingRow label="Image Guide d'utilisation" field="guidePoster" />
            <SettingRow label="Image À propos du développeur" field="aboutPoster" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#1D3583', letterSpacing: 1 },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  accordionTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  accordionContent: { padding: 20, backgroundColor: 'white' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  rowLabel: { fontSize: 13, color: '#444', flex: 1 },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  rowButtonActive: { backgroundColor: '#1D3583', borderColor: '#1D3583' },
  rowButtonText: { fontSize: 11, fontWeight: '700' },
  blockSection: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  blockLabel: { fontSize: 13, fontWeight: '900', color: '#8B1A1A', marginBottom: 10 },
  authContainer: { flex: 1, backgroundColor: '#1D3583', justifyContent: 'center', padding: 30 },
  authModal: { backgroundColor: 'white', borderRadius: 25, padding: 30, elevation: 20 },
  authTitle: { textAlign: 'center', fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 20, color: '#1D3583' },
  authInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 15, marginBottom: 20, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
  authBtn: { backgroundColor: '#8B1A1A', padding: 18, borderRadius: 12, alignItems: 'center' },
  authBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1 }
});
