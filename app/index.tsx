import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const univImage = appData.settings?.univImage;
  const backgroundImage = appData.settings?.bgImage;
  const menuBg = appData.settings?.menuBg;
  const menuLogo = appData.settings?.menuLogo;

  // Liste des blocs pour la recherche
  const allBlocks = [
    { id: 'A', name: 'Bloc A - Salles & Bureaux' },
    { id: 'B', name: 'Bloc B - Salles & Bureaux' },
    { id: 'C', name: 'Bloc C - Salles & Bureaux' },
    { id: 'D', name: 'Bloc D - Salles & Bureaux' },
    { id: 'E', name: 'Bloc E - Salles & Bureaux' },
    { id: 'F', name: 'Bloc F - Salles & Bureaux' },
  ];

  const filteredResults = searchQuery.length > 0 
    ? allBlocks.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* --- SIDEBAR --- */}
      <Modal transparent visible={isMenuOpen} animationType="fade">
        <View style={styles.sidebarContainer}>
          <ImageBackground 
            source={menuBg ? { uri: menuBg } : { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80' }}
            style={StyleSheet.absoluteFill}
          >
            <View style={styles.blueOverlay} />
          </ImageBackground>
          <View style={styles.sidebarDrawer}>
            <View style={styles.sidebarHeader}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <Text style={styles.sidebarTitle}>U-AUBEN{"\n"}SUPPLIES{"\n"}TRACKER</Text>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}><Feather name="x" size={28} color="white" /></TouchableOpacity>
              </View>
            </View>
            <View style={styles.sidebarNav}>
              {["Guide d'utilisation", "A propos du développeur", "Données essentielles"].map((label, i) => (
                <TouchableOpacity key={i} style={styles.sidebarBtn} onPress={() => setIsMenuOpen(false)}>
                  <Text style={styles.sidebarBtnText}>· {label} ·</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sidebarFooter}>
              <View style={styles.logoCircle}>
                {menuLogo ? <Image source={{ uri: menuLogo }} style={styles.logoImg} /> : <View style={styles.logoPlaceholder}><Text style={styles.logoPText}>LOGO</Text></View>}
              </View>
            </View>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMenuOpen(false)} />
        </View>
      </Modal>

      {/* --- ACCUEIL --- */}
      <ImageBackground source={backgroundImage ? { uri: backgroundImage } : null} style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150, paddingTop: 50 }}>
          
          {/* Header */}
          <View style={styles.headerRed}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}><Feather name="menu" size={24} color="white" /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}><MaterialCommunityIcons name="tune" size={24} color="white" /></TouchableOpacity>
          </View>

          {/* Recherche */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
              <TextInput 
                placeholder="Chercher un bloc..." 
                style={styles.searchInput} 
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            {filteredResults.map(res => (
              <TouchableOpacity key={res.id} style={styles.resultItem} onPress={() => {setSearchQuery(''); router.push({ pathname: '/room-contents', params: { blockId: res.id } });}}>
                <Text style={styles.resultText}>{res.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sélecteur de Blocs Horizontaux */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
              <TouchableOpacity key={block} style={styles.blockButton} onPress={() => router.push({ pathname: '/room-contents', params: { blockId: block } })}>
                <Text style={styles.blockButtonText}>Bloc {block}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Image Université */}
          <View style={styles.univSection}>
            <View style={styles.imageContainer}>
              {univImage ? <Image source={{ uri: univImage }} style={styles.univImage} /> : <View style={styles.placeholderBlue}><Text style={styles.placeholderText}>U-AUBEN</Text></View>}
            </View>
            <View style={styles.titleBadge}><Text style={styles.titleText}>UNIVERSITE AUBE NOUVELLE</Text></View>
          </View>

        </ScrollView>

        {/* Nav Basse */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => router.push('/categories')}><Feather name="bell" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/')}><Feather name="home" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/note-editor')}><Feather name="edit-3" size={22} color="white" /></TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: { flex: 1, flexDirection: 'row' },
  blueOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30, 58, 138, 0.4)' },
  sidebarDrawer: { width: '65%', height: '100%', backgroundColor: '#8B1A1A', padding: 24, paddingTop: 60 },
  sidebarHeader: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 20, marginBottom: 40 },
  sidebarTitle: { color: 'white', fontWeight: '900', fontSize: 16 },
  sidebarNav: { flex: 1, alignItems: 'center' },
  sidebarBtn: { marginBottom: 30 },
  sidebarBtnText: { color: 'white', fontWeight: 'bold' },
  sidebarFooter: { alignItems: 'center', marginBottom: 30 },
  logoCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', overflow: 'hidden' },
  logoImg: { width: '100%', height: '100%' },
  logoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoPText: { fontSize: 10, color: '#8B1A1A', fontWeight: 'bold' },

  headerRed: { marginHorizontal: 12, height: 48, backgroundColor: '#c0262b', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  searchSection: { marginHorizontal: 12, marginTop: 12, zIndex: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 22, height: 44, paddingHorizontal: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 13 },
  resultItem: { backgroundColor: 'white', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  resultText: { fontWeight: 'bold', color: '#8B1A1A' },
  
  blockSelector: { marginHorizontal: 12, marginTop: 12, maxHeight: 50 },
  blockButton: { backgroundColor: '#263d7e', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginRight: 8 },
  blockButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  univSection: { marginHorizontal: 12, marginTop: 20, alignItems: 'center' },
  imageContainer: { width: '100%', height: 300, borderRadius: 25, overflow: 'hidden', backgroundColor: '#4184f4' },
  univImage: { width: '100%', height: '100%' },
  placeholderBlue: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: 'white', fontSize: 40, fontWeight: 'bold' },
  titleBadge: { backgroundColor: '#263d7e', padding: 15, borderRadius: 12, marginTop: -25 },
  titleText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  
  bottomNav: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#263d7e', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40 }
});
