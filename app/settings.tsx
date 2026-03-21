import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, Alert, ImageBackground, Dimensions, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';
import { setGeminiApiKey, loadGeminiApiKey } from '@/lib/aube-engine';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateSettings } = useAppContext() as any;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiSaved, setGeminiSaved] = useState(false);

  useEffect(() => {
    loadGeminiApiKey().then(function(k) {
      if (k) setGeminiKey(k);
    }).catch(function() {});
  }, []);

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) {
      Alert.alert('Erreur', 'La clé API ne peut pas être vide.');
      return;
    }
    await setGeminiApiKey(geminiKey.trim());
    setGeminiSaved(true);
    Alert.alert('✅ Clé enregistrée', 'Aube utilisera cette clé pour se connecter à Gemini.');
    setTimeout(function() { setGeminiSaved(false); }, 3000);
  };

  const [geminiStatus, setGeminiStatus] = useState('');
  const [testingGemini, setTestingGemini] = useState(false);

  const testerConnexionGemini = async () => {
    if (!geminiKey.trim()) {
      Alert.alert('Erreur', 'Entrez d\'abord une clé API.');
      return;
    }
    setTestingGemini(true);
    setGeminiStatus('Test en cours...');
    try {
      var url = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=' + geminiKey.trim();
      var response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Dis juste: OK' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });
      var data = await response.json();
      if (!response.ok) {
        var errMsg = (data && data.error && data.error.message) || ('HTTP ' + response.status);
        setGeminiStatus('❌ Erreur : ' + errMsg);
      } else {
        var txt = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
        if (txt) {
          setGeminiStatus('✅ Connexion OK ! Réponse : ' + txt.trim());
          await setGeminiApiKey(geminiKey.trim());
        } else {
          setGeminiStatus('⚠️ Réponse vide. Clé peut-être invalide.');
        }
      }
    } catch (e: any) {
      setGeminiStatus('❌ Pas de réseau ou URL invalide : ' + (e.message || e));
    }
    setTestingGemini(false);
  };

  const [openSections, setOpenSections] = useState({
    security: true,
    general: false,
    menu: false,
    blocs: false,
    affiches: false,
    chat: false,
    ia: false,
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
      allowsEditing: false, 
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
        <Text style={[styles.rowLabel, styles.boldSerif]}>{label}</Text>
        <TouchableOpacity 
          style={[styles.rowButton, hasValue && styles.rowButtonActive]} 
          onPress={() => pickImage(field)}
        >
          <Feather name={hasValue ? "check-circle" : "image"} size={16} color={hasValue ? "white" : "#666"} />
          <Text style={[styles.rowButtonText, styles.boldSerif, hasValue && {color: 'white'}]}>
            {hasValue ? "Défini" : "Choisir"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isAuthenticated) {
    const settings2 = (appData && appData.settings) || {};
    const authBg = settings2.authBgImage || null;
    const blurVal = settings2.authBlur || 0;

    return (
      <View style={styles.fullContainer}>
        <ImageBackground 
          source={authBg ? { uri: authBg } : undefined} 
          style={[styles.absoluteFull, !authBg && { backgroundColor: '#1D3583' }]}
          resizeMode="cover"
        >
          {authBg && <BlurView intensity={blurVal} tint="dark" style={styles.absoluteFull} />}
          
          <View style={styles.authOverlay}>
            <View style={styles.authModalContent}>
              <MaterialCommunityIcons name="shield-lock" size={60} color="white" style={{marginBottom: 15}} />
              <Text style={[styles.authTitleFull, styles.boldSerif]}>ADMINISTRATEUR</Text>
              
              <View style={styles.haloWrapper}>
                <TextInput 
                  style={[styles.authInputHalo, styles.boldSerif]} 
                  placeholder="CODE" 
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry 
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
              </View>

              <TouchableOpacity style={styles.authBtnFull} onPress={handleLogin}>
                <Text style={[styles.authBtnTextFull, styles.boldSerif]}>VALIDER L'ACCÈS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.back()} style={{marginTop: 25}}>
                <Text style={[styles.boldSerif, {color: 'white', opacity: 0.6, letterSpacing: 1}]}>ANNULER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, styles.boldSerif]}>PARAMÈTRES SYSTÈME</Text>
        <TouchableOpacity onPress={() => router.back()}><Feather name="x" size={24} color="black" /></TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('security')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Sécurité & Design Auth</Text>
          <Feather name={openSections.security ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.security && (
          <View style={styles.accordionContent}>
            <SettingRow label="Fond d'écran Authentification" field="authBgImage" />
            <View style={{marginTop: 15}}>
              <Text style={[styles.rowLabel, styles.boldSerif]}>Intensité du flou : {Math.round(((appData && appData.settings && appData.settings.authBlur) || 0))}%</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={100}
                value={(appData && appData.settings && appData.settings.authBlur) || 0}
                onSlidingComplete={(val) => updateSettings({ authBlur: val })}
                minimumTrackTintColor="#FF0000"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#1D3583"
              />
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('general')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Interface Accueil</Text>
          <Feather name={openSections.general ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.general && (
          <View style={styles.accordionContent}>
            <SettingRow label="Image de l'Université" field="univImage" />
            <SettingRow label="Arrière-plan Accueil" field="bgImage" />
          </View>
        )}

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('menu')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Menu Latéral</Text>
          <Feather name={openSections.menu ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.menu && (
          <View style={styles.accordionContent}>
            <SettingRow label="Arrière-plan du Menu" field="menuBg" />
            <SettingRow label="Logo du Menu" field="menuLogo" />
          </View>
        )}

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('blocs')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Personnalisation des Blocs</Text>
          <Feather name={openSections.blocs ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.blocs && (
          <View style={styles.accordionContent}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((b) => (
              <View key={b} style={styles.blockSection}>
                <Text style={[styles.blockLabel, styles.boldSerif]}>BLOC {b}</Text>
                <SettingRow label={`Vue Aérienne ${b}`} field={`bloc${b}_aerial`} />
                <SettingRow label={`Image Salles ${b}1`} field={`bloc${b}_sub1`} />
                <SettingRow label={`Image Bureaux ${b}2`} field={`bloc${b}_sub2`} />
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('affiches')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Affiches d'Information</Text>
          <Feather name={openSections.affiches ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.affiches && (
          <View style={styles.accordionContent}>
            <SettingRow label="Image Guide d'utilisation" field="guidePoster" />
            <SettingRow label="Image À propos du développeur" field="aboutPoster" />
          </View>
        )}

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('chat')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Assistant Aube — Chat</Text>
          <Feather name={openSections.chat ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.chat && (
          <View style={styles.accordionContent}>
            <SettingRow label="Avatar d'Aube (image de profil)" field="assistantAvatar" />
            <SettingRow label="Votre image de profil" field="userAvatar" />
            <SettingRow label="Fond d'écran du chat" field="chatBgImage" />
          </View>
        )}

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('ia')}>
          <Text style={[styles.accordionTitle, styles.boldSerif]}>Intelligence Aube — Clé API</Text>
          <Feather name={openSections.ia ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.ia && (
          <View style={styles.accordionContent}>
            <Text style={[styles.boldSerif, { fontSize: 13, color: '#555', marginBottom: 10 }]}>
              Clé API Gemini (aistudio.google.com)
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                value={geminiKey}
                onChangeText={setGeminiKey}
                placeholder="Collez votre clé API ici..."
                placeholderTextColor="#aaa"
                secureTextEntry={false}
                style={[styles.keyInput, styles.boldSerif]}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handleSaveGeminiKey}
                style={[styles.saveKeyBtn, geminiSaved && styles.saveKeyBtnOk]}
              >
                <Feather name={geminiSaved ? "check" : "save"} size={20} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={testerConnexionGemini}
              disabled={testingGemini}
              style={[styles.testBtn, testingGemini && { opacity: 0.5 }]}
            >
              <Text style={[styles.boldSerif, { color: 'white', fontSize: 14 }]}>
                {testingGemini ? '⏳ Test en cours...' : '🔌 Tester la connexion Gemini'}
              </Text>
            </TouchableOpacity>
            {geminiStatus !== '' && (
              <View style={styles.statusBox}>
                <Text style={[styles.boldSerif, { fontSize: 13, color: geminiStatus.startsWith('✅') ? '#059669' : geminiStatus.startsWith('⚠️') ? '#d97706' : '#dc2626' }]}>
                  {geminiStatus}
                </Text>
              </View>
            )}
            <Text style={[styles.boldSerif, { fontSize: 11, color: '#888', marginTop: 8 }]}>
              La clé est stockée localement. Elle n'est jamais partagée.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  boldSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontSize: 16,
    fontStyle: 'italic',
  },
  fullContainer: { flex: 1, backgroundColor: 'black' },
  absoluteFull: { position: 'absolute', width: width, height: height },
  authOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  authModalContent: { width: '80%', alignItems: 'center' },
  authTitleFull: { color: 'white', fontSize: 18, letterSpacing: 6, marginBottom: 40 },
  haloWrapper: {
    width: '100%',
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 25,
    marginBottom: 25
  },
  authInputHalo: { 
    backgroundColor: 'rgba(0,0,0,0.8)', 
    borderWidth: 2, 
    borderColor: '#FF0000', 
    borderRadius: 15, 
    padding: 20, 
    color: 'white', 
    textAlign: 'center', 
    fontSize: 24, 
  },
  authBtnFull: { backgroundColor: '#8B1A1A', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 5 },
  authBtnTextFull: { color: 'white', letterSpacing: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
  headerTitle: { fontSize: 16, color: '#1D3583' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  accordionTitle: { color: '#333', fontSize: 14 },
  accordionContent: { padding: 20, backgroundColor: 'white' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  rowLabel: { fontSize: 13, color: '#444', flex: 1 },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  rowButtonActive: { backgroundColor: '#1D3583', borderColor: '#1D3583' },
  rowButtonText: { fontSize: 11 },
  blockSection: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  blockLabel: { fontSize: 13, color: '#8B1A1A', marginBottom: 10 },

  keyInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveKeyBtn: {
    backgroundColor: '#1D3583',
    width: 48, height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveKeyBtnOk: { backgroundColor: '#059669' },
  testBtn: {
    backgroundColor: '#1D3583',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  statusBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
});
                
