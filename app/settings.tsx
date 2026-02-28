import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, ScrollView, 
  StyleSheet, Alert, ImageBackground, Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppContext } from '@/lib/app-context';
import { BlurView } from 'expo-blur';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const router = useRouter();
  const { appData, updateSettings } = useAppContext() as any;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const [openSections, setOpenSections] = useState({
    security: true,
    general: false,
    menu: false,
    blocs: false,
    affiches: false,
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
    const authBg = appData.settings?.authBgImage;
    const blurVal = appData.settings?.authBlur || 0;

    return (
      <View style={styles.fullContainer}>
        <ImageBackground 
          // CORRECTION ICI : Suppression du require vers l'icône inexistante
          source={authBg ? { uri: authBg } : undefined} 
          // Ajout d'une couleur de secours si pas d'image
          style={[styles.absoluteFull, !authBg && { backgroundColor: '#1D3583' }]}
          resizeMode="cover"
        >
          {/* Le flou ne s'applique que s'il y a une image pour éviter les artefacts */}
          {authBg && <BlurView intensity={blurVal} tint="dark" style={styles.absoluteFull} />}
          
          <View style={styles.authOverlay}>
            <View style={styles.authModalContent}>
              <MaterialCommunityIcons name="shield-lock" size={60} color="white" style={{marginBottom: 15}} />
              <Text style={styles.authTitleFull}>ADMINISTRATEUR</Text>
              
              <View style={styles.haloWrapper}>
                <TextInput 
                  style={styles.authInputHalo} 
                  placeholder="CODE" 
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry 
                  value={password}
                  onChangeText={setPassword}
                  autoFocus
                />
              </View>

              <TouchableOpacity style={styles.authBtnFull} onPress={handleLogin}>
                <Text style={styles.authBtnTextFull}>VALIDER L'ACCÈS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.back()} style={{marginTop: 25}}>
                <Text style={{color: 'white', opacity: 0.6, letterSpacing: 1}}>ANNULER</Text>
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
        <Text style={styles.headerTitle}>PARAMÈTRES SYSTÈME</Text>
        <TouchableOpacity onPress={() => router.back()}><Feather name="x" size={24} color="black" /></TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('security')}>
          <Text style={styles.accordionTitle}>Sécurité & Design Auth</Text>
          <Feather name={openSections.security ? "chevron-up" : "chevron-down"} size={20} color="#8B1A1A" />
        </TouchableOpacity>
        {openSections.security && (
          <View style={styles.accordionContent}>
            <SettingRow label="Fond d'écran Authentification" field="authBgImage" />
            <View style={{marginTop: 15}}>
              <Text style={styles.rowLabel}>Intensité du flou : {Math.round(appData.settings?.authBlur || 0)}%</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={100}
                value={appData.settings?.authBlur || 0}
                onSlidingComplete={(val) => updateSettings({ authBlur: val })}
                minimumTrackTintColor="#FF0000"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#1D3583"
              />
            </View>
          </View>
        )}

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

        <TouchableOpacity style={styles.accordionHeader} onPress={() => toggleSection('affiches')}>
          <Text style={styles.accordionTitle}>Affiches d'Information</Text>
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
  fullContainer: { flex: 1, backgroundColor: 'black' },
  absoluteFull: { position: 'absolute', width: width, height: height },
  authOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  authModalContent: { width: '80%', alignItems: 'center' },
  authTitleFull: { color: 'white', fontSize: 18, fontWeight: '900', letterSpacing: 6, marginBottom: 40 },
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
    fontWeight: 'bold' 
  },
  authBtnFull: { backgroundColor: '#8B1A1A', padding: 18, borderRadius: 15, width: '100%', alignItems: 'center', elevation: 5 },
  authBtnTextFull: { color: 'white', fontWeight: 'bold', letterSpacing: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white' },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#1D3583' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#f9f9f9', borderBottomWidth: 1, borderBottomColor: '#eee' },
  accordionTitle: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  accordionContent: { padding: 20, backgroundColor: 'white' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  rowLabel: { fontSize: 13, color: '#444', flex: 1 },
  rowButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  rowButtonActive: { backgroundColor: '#1D3583', borderColor: '#1D3583' },
  rowButtonText: { fontSize: 11, fontWeight: '700' },
  blockSection: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  blockLabel: { fontSize: 13, fontWeight: '900', color: '#8B1A1A', marginBottom: 10 }
});
