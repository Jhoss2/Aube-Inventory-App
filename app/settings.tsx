import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
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
    donnees: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogin = () => {
    if (password.length > 0) {
      setIsAuthenticated(true);
    } else {
      Alert.alert("Erreur", "Veuillez entrer un mot de passe.");
    }
  };

  const pickImage = async (field: string) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  const pickDocument = async (field: string) => {
    let result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) {
      updateSettings({ [field]: result.assets[0].uri });
    }
  };

  // Composant d'assistance pour le rendu des boutons de sélection de fichiers
  const FileSelector = ({ label, field, isDoc = false }: { label: string, field: string, isDoc?: boolean }) => {
    const hasValue = appData.settings?.[field];
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: 'black', marginBottom: 8 }}>{label}</Text>
        <TouchableOpacity 
          style={styles.fileButton}
          onPress={() => isDoc ? pickDocument(field) : pickImage(field)}
        >
          <Text style={{ fontSize: 14, color: hasValue ? '#16A34A' : '#4B5563' }}>
            {hasValue ? 'Fichier sélectionné ✓' : 'Choisir un fichier...'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- ECRAN DE CONNEXION (MODAL) ---
  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        {/* Arrière-plan flouté/assombri simulant l'application */}
        <View style={styles.authBackground}>
          <View style={{ backgroundColor: '#7B1113', height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
             <Feather name="menu" size={24} color="rgba(255,255,255,0.5)" />
             <MaterialCommunityIcons name="tune" size={24} color="rgba(255,255,255,0.5)" />
          </View>
          <View style={{ padding: 16, backgroundColor: '#f9fafb', flex: 1 }}>
             <View style={{ backgroundColor: '#e5e7eb', height: 40, borderRadius: 8, marginBottom: 16 }} />
             <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, overflow: 'hidden' }}>
                <View style={{ height: 40, width: 80, backgroundColor: '#1D3583', borderRadius: 8 }} />
                <View style={{ height: 40, width: 80, backgroundColor: '#1D3583', borderRadius: 8 }} />
                <View style={{ height: 40, width: 80, backgroundColor: '#1D3583', borderRadius: 8 }} />
             </View>
             <View style={{ backgroundColor: '#1D3583', height: 256, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 40 }} />
          </View>
        </View>

        {/* Overlay sombre et Modal */}
        <View style={styles.authOverlay}>
          <View style={styles.authModal}>
            <Text style={styles.authTitle}>Accès administrateur</Text>
            <Text style={styles.authSubtitle}>Veuillez entrer le mot de passe pour accéder aux paramètres.</Text>
            
            <TextInput 
              style={styles.authInput}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
            
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.authBtnCancel} onPress={() => router.back()}>
                <Text style={styles.authBtnCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.authBtnSubmit} onPress={handleLogin}>
                <Text style={styles.authBtnSubmitText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // --- ECRAN DES PARAMETRES ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PARAMÈTRES</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Feather name="x" size={24} color="#1D3583" />
        </TouchableOpacity>
      </View>

      {/* CONTENU DÉROULANT */}
      <ScrollView style={{ flex: 1, backgroundColor: 'white' }} contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* 1. Général */}
        <View style={styles.sectionBorder}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('general')}>
            <Text style={styles.sectionTitle}>Général</Text>
            <Feather name={openSections.general ? "minus" : "plus"} size={20} color="#2563EB" />
          </TouchableOpacity>
          {openSections.general && (
            <View style={styles.sectionContent}>
              <FileSelector label="Changer l'image de l'université" field="univImage" />
              <FileSelector label="Changer l'arrière-plan de l'accueil" field="bgImage" />
              <FileSelector label="Changer l'icône de l'application" field="appIcon" />
            </View>
          )}
        </View>

        {/* 2. Menu Latéral */}
        <View style={styles.sectionBorder}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('menu')}>
            <Text style={styles.sectionTitle}>Menu Latéral</Text>
            <Feather name={openSections.menu ? "minus" : "plus"} size={20} color="#2563EB" />
          </TouchableOpacity>
          {openSections.menu && (
            <View style={styles.sectionContent}>
              <FileSelector label="Changer l'arrière-plan du menu" field="menuBg" />
              <FileSelector label="Changer le logo du menu" field="menuLogo" />
            </View>
          )}
        </View>

        {/* 3. Personnalisation des Blocs */}
        <View style={styles.sectionBorder}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('blocs')}>
            <Text style={styles.sectionTitle}>Personnalisation des Blocs</Text>
            <Feather name={openSections.blocs ? "minus" : "plus"} size={20} color="#2563EB" />
          </TouchableOpacity>
          {openSections.blocs && (
            <View style={styles.sectionContent}>
              {/* Bloc A */}
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.blockTitle}>Bloc A</Text>
                <FileSelector label="Image Vue Aérienne (A)" field="blocA_aerial" />
                <FileSelector label="Image Sous-Bloc (A1)" field="blocA_sub1" />
                <FileSelector label="Image Sous-Bloc (A2)" field="blocA_sub2" />
              </View>

              {/* Bloc B */}
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.blockTitle}>Bloc B</Text>
                <FileSelector label="Image Vue Aérienne (B)" field="blocB_aerial" />
                <FileSelector label="Image Sous-Bloc (B1)" field="blocB_sub1" />
                <FileSelector label="Image Sous-Bloc (B2)" field="blocB_sub2" />
              </View>

              {/* Bloc E */}
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.blockTitle}>Bloc E</Text>
                <FileSelector label="Image Vue Aérienne (E)" field="blocE_aerial" />
                <FileSelector label="Image Sous-Bloc (E1 - Toilettes)" field="blocE_sub1" />
                <FileSelector label="Image Sous-Bloc (E2 - Jardins)" field="blocE_sub2" />
              </View>

              {/* Bloc F */}
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.blockTitle}>Bloc F</Text>
                <FileSelector label="Image Vue Aérienne (F)" field="blocF_aerial" />
              </View>
            </View>
          )}
        </View>

        {/* 4. Base de Connaissances Aube */}
        <View style={styles.sectionBorder}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('base')}>
            <Text style={styles.sectionTitle}>Base de Connaissances Aube</Text>
            <Feather name={openSections.base ? "minus" : "plus"} size={20} color="#2563EB" />
          </TouchableOpacity>
          {openSections.base && (
            <View style={styles.sectionContent}>
              <Text style={{ fontSize: 14, color: 'black', marginBottom: 8 }}>Informations pour le bot</Text>
              <TextInput 
                style={styles.textArea}
                multiline
                defaultValue={appData.settings?.aubePrompt || "Je suis Aube, un assistant IA..."}
                onChangeText={(text) => updateSettings({ aubePrompt: text })}
              />
              <TouchableOpacity style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 5. Documents */}
        <View style={styles.sectionBorder}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('docs')}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <Feather name={openSections.docs ? "minus" : "plus"} size={20} color="#2563EB" />
          </TouchableOpacity>
          {openSections.docs && (
            <View style={styles.sectionContent}>
              <FileSelector label="Charger le guide d'utilisation (PDF)" field="guidePdf" isDoc={true} />
              <FileSelector label="Charger 'A propos du développeur' (PDF)" field="aboutPdf" isDoc={true} />
            </View>
          )}
        </View>

        {/* 6. Données */}
        <View style={[styles.sectionBorder, { borderBottomWidth: 0 }]}>
          <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection('donnees')}>
            <Text style={styles.sectionTitle}>Données</Text>
            <Feather name={openSections.donnees ? "minus" : "plus"} size={20} color="#2563EB" />
          </TouchableOpacity>
          {openSections.donnees && (
            <View style={styles.sectionContent}>
              <Text style={{ fontSize: 14, color: 'black', marginBottom: 12 }}>Données essentielles</Text>
              <TouchableOpacity style={styles.exportBtn} onPress={() => Alert.alert("Export", "Fonction d'export CSV en cours de création")}>
                <Text style={styles.exportBtnText}>Télécharger les données (.csv)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Auth Modal
  authContainer: { flex: 1, backgroundColor: '#f3f4f6' },
  authBackground: { ...StyleSheet.absoluteFillObject, opacity: 0.5, zIndex: 0 },
  authOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 10, justifyContent: 'center', alignItems: 'center', padding: 16 },
  authModal: { backgroundColor: 'white', borderRadius: 16, width: '100%', maxWidth: 320, padding: 24, elevation: 10 },
  authTitle: { fontSize: 18, fontWeight: 'bold', color: 'black', textAlign: 'center', marginBottom: 12 },
  authSubtitle: { color: '#4b5563', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  authInput: { width: '100%', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 24, letterSpacing: 4, textAlign: 'center', marginBottom: 24 },
  authBtnCancel: { flex: 1, backgroundColor: '#D1D5DB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  authBtnCancelText: { color: 'black', fontWeight: 'bold' },
  authBtnSubmit: { flex: 1, backgroundColor: '#2563EB', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  authBtnSubmitText: { color: 'white', fontWeight: 'bold' },

  // Settings Layout
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: 'white' },
  headerTitle: { fontSize: 20, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase', color: 'black' },
  sectionBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  sectionHeader: { width: '100%', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' },
  sectionTitle: { fontWeight: 'bold', color: 'black', fontSize: 18 },
  sectionContent: { paddingHorizontal: 16, paddingBottom: 24 },
  
  // Custom Controls
  fileButton: { borderWidth: 1, borderColor: '#d1d5db', borderStyle: 'dashed', borderRadius: 8, padding: 12, alignItems: 'center', backgroundColor: '#f9fafb' },
  blockTitle: { fontWeight: 'bold', color: 'black', marginBottom: 12, fontSize: 16 },
  textArea: { width: '100%', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, color: 'black', fontSize: 14, height: 112, textAlignVertical: 'top', marginBottom: 16 },
  saveBtn: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 2 },
  saveBtnText: { color: 'white', fontWeight: 'bold' },
  exportBtn: { width: '100%', backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 2 },
  exportBtnText: { color: 'white', fontWeight: 'bold' }
});
