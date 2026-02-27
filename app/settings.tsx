import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateSettings } = useAppContext();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [openSections, setOpenSections] = useState<any>({ general: true });

  const toggleSection = (section: string) => {
    setOpenSections((prev: any) => ({ ...prev, [section]: !prev[section] }));
  };

  // VÉRITABLE LOGIQUE DE MISE À JOUR
  const pickImage = async (field: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      // Met à jour uniquement le champ concerné dans le contexte global
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  // Écran de verrouillage Admin
  if (!isAuthenticated) {
    return (
      <View style={styles.authOverlay}>
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>ACCÈS ADMINISTRATEUR</Text>
          <Text style={styles.authSubtitle}>ENTREZ LE MOT DE PASSE</Text>
          <TextInput 
            secureTextEntry
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••"
            placeholderTextColor="#DDD"
            autoFocus
          />
          <View style={styles.authButtons}>
            <TouchableOpacity onPress={() => router.back()} style={[styles.btn, styles.btnCancel]}>
              <Text style={styles.btnTextCancel}>ANNULER</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => password === '1234' ? setIsAuthenticated(true) : Alert.alert("Erreur", "Mot de passe incorrect")} 
              style={[styles.btn, styles.btnConfirm]}
            >
              <Text style={styles.btnTextConfirm}>VALIDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      
      {/* HEADER STABILISÉ */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRed}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PARAMÈTRES SYSTÈME</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          
          {/* SECTION GÉNÉRAL */}
          <AccordionItem title="GÉNÉRAL" isOpen={openSections.general} onToggle={() => toggleSection('general')}>
            <SettingImageRow label="Image de l'Université" uri={appData.settings?.univImage} onPress={() => pickImage('univImage')} />
            <SettingImageRow label="Arrière-plan Global" uri={appData.settings?.bgImage} onPress={() => pickImage('bgImage')} />
          </AccordionItem>

          {/* SECTION AUBE (IA) */}
          <AccordionItem title="INTELLIGENCE AUBE" isOpen={openSections.aube} onToggle={() => toggleSection('aube')}>
            <Text style={styles.inputLabel}>PROMPT SYSTÈME (RÔLE)</Text>
            <TextInput 
              multiline
              numberOfLines={4}
              style={styles.textArea}
              defaultValue={appData.settings?.aubePrompt}
              onChangeText={(text) => updateSettings({ aubePrompt: text })}
              placeholder="Ex: Tu es Aube, un assistant technique..."
              textAlignVertical="top"
            />
            <SettingImageRow label="Avatar de Aube" uri={appData.settings?.assistantAvatar} onPress={() => pickImage('assistantAvatar')} />
          </AccordionItem>

          {/* SECTION GUIDES */}
          <AccordionItem title="GUIDES ET DOCUMENTS" isOpen={openSections.docs} onToggle={() => toggleSection('docs')}>
            <SettingImageRow label="Image du Guide Utilisateur" uri={appData.settings?.guideImage} onPress={() => pickImage('guideImage')} />
            <SettingImageRow label="Image Développeur" uri={appData.settings?.devImage} onPress={() => pickImage('devImage')} />
          </AccordionItem>

          {/* SECTION SÉCURITÉ */}
          <AccordionItem title="DONNÉES & SÉCURITÉ" isOpen={openSections.donnees} onToggle={() => toggleSection('donnees')}>
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="download-outline" size={20} color="white" />
              <Text style={styles.exportBtnText}>EXPORTER LES DONNÉES (.CSV)</Text>
            </TouchableOpacity>
          </AccordionItem>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Composants internes stylisés
const AccordionItem = ({ title, isOpen, onToggle, children }: any) => (
  <View style={styles.accordionContainer}>
    <TouchableOpacity onPress={onToggle} style={styles.accordionHeader}>
      <Text style={styles.accordionTitle}>{title}</Text>
      <Ionicons name={isOpen ? "remove-circle" : "add-circle"} size={24} color="#1D3583" />
    </TouchableOpacity>
    {isOpen && <View style={styles.accordionContent}>{children}</View>}
  </View>
);

const SettingImageRow = ({ label, uri, onPress }: any) => (
  <View style={styles.imageRow}>
    <View style={{ flex: 1 }}>
      <Text style={styles.imageLabel}>{label}</Text>
      {uri && <Text style={styles.uriHint} numberOfLines={1}>{uri.split('/').pop()}</Text>}
    </View>
    <TouchableOpacity onPress={onPress} style={styles.modifyBtn}>
      <Text style={styles.modifyBtnText}>MODIFIER</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  authOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  authCard: { backgroundColor: 'white', width: '85%', borderRadius: 30, padding: 30, alignItems: 'center' },
  authTitle: { fontSize: 18, fontWeight: '900', color: '#1D3583', marginBottom: 5 },
  authSubtitle: { fontSize: 10, fontWeight: '900', color: '#94A3B8', letterSpacing: 2, marginBottom: 20 },
  passwordInput: { width: '100%', borderBottomWidth: 2, borderBottomColor: '#F1F5F9', paddingVertical: 15, textAlign: 'center', fontSize: 24, fontWeight: '900', color: '#1D3583', marginBottom: 30 },
  authButtons: { flexDirection: 'row', gap: 15 },
  btn: { flex: 1, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  btnCancel: { backgroundColor: '#F1F5F9' },
  btnConfirm: { backgroundColor: '#1D3583' },
  btnTextCancel: { color: '#94A3B8', fontWeight: '900' },
  btnTextConfirm: { color: 'white', fontWeight: '900' },
  headerContainer: { padding: 15 },
  headerRed: { backgroundColor: '#B21F18', borderRadius: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, elevation: 5 },
  headerTitle: { flex: 1, textAlign: 'center', color: 'white', fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  accordionContainer: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  accordionTitle: { fontSize: 15, fontWeight: '900', color: '#1D3583', letterSpacing: 0.5 },
  accordionContent: { px: 25, paddingHorizontal: 25, pb: 20, paddingBottom: 30 },
  imageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  imageLabel: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  uriHint: { fontSize: 9, color: '#94A3B8', marginTop: 2 },
  modifyBtn: { backgroundColor: '#1D3583', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
  modifyBtnText: { color: 'white', fontSize: 10, fontWeight: '900' },
  inputLabel: { fontSize: 10, fontWeight: '900', color: '#1D3583', marginBottom: 10, letterSpacing: 1 },
  textArea: { backgroundColor: '#F8FAFC', borderRadius: 15, padding: 15, borderWidth: 1, borderColor: '#F1F5F9', color: '#475569', fontWeight: 'bold', fontSize: 13, marginBottom: 20 },
  exportBtn: { backgroundColor: '#16A34A', paddingVertical: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  exportBtnText: { color: 'white', fontWeight: '900', fontSize: 13 }
});

