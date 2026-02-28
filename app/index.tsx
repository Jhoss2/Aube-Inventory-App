import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const univImage = appData?.settings?.univImage;
  const backgroundImage = appData?.settings?.bgImage;
  const menuBg = appData?.settings?.menuBg;
  const menuLogo = appData?.settings?.menuLogo;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* --- MENU LATÉRAL --- */}
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
              <Text style={styles.sidebarTitle}>U-AUBEN{"\n"}SUPPLIES{"\n"}TRACKER</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Feather name="x" size={28} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarNav}>
              {[
                { label: "Guide d'utilisation", path: '/guide-viewer' },
                { label: "À propos du développeur", path: '/about-dev' },
                { label: "Gestion des Salles", path: '/room-profiles' }, // Correction chemin
                { label: "Paramètres", path: '/settings' }
              ].map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.sidebarBtn}
                  onPress={() => { setIsMenuOpen(false); router.push(option.path as any); }}
                >
                  <Text style={styles.sidebarBtnText}>· {option.label} ·</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sidebarFooter}>
              <Text style={styles.versionText}>· Version 1.1.1 ·</Text>
              <View style={styles.logoCircle}>
                {menuLogo ? (
                  <Image source={{ uri: menuLogo }} style={styles.logoImg} />
                ) : (
                  <View style={styles.logoPlaceholder}><Text style={styles.logoPText}>LOGO</Text></View>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMenuOpen(false)} />
        </View>
      </Modal>

      {/* --- CORPS DE L'APPLICATION --- */}
      <ImageBackground 
        source={backgroundImage ? { uri: backgroundImage } : undefined}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}
        resizeMode="cover"
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
          
          {/* Header Rouge */}
          <View style={styles.headerRed}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>ACCUEIL</Text>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="tune" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput placeholder="Que cherchez vous ?" style={styles.searchInput} />
            <TouchableOpacity style={styles.botButton} onPress={() => router.push('/chat-aube')}>
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Sélecteur de Blocs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
              <TouchableOpacity 
                key={block} 
                style={styles.blockButton}
                onPress={() => router.push({ pathname: '/room-profiles', params: { blockId: block } })}
              >
                <Text style={styles.blockButtonText}>Bloc {block}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section Université / Accès aux Profils */}
          <TouchableOpacity 
            style={styles.univSection} 
            activeOpacity={0.9}
            onPress={() => router.push('/room-profiles')}
          >
            <View style={styles.imageContainer}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={styles.univImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderBlue}>
                  <Feather name="image" size={50} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.placeholderText}>Cliquer pour voir les salles</Text>
                </View>
              )}
            </View>
            <View style={styles.titleBadgeUnder}>
              <Text style={styles.titleText}>VOIR LES PROFILS DES SALLES</Text>
            </View>
          </TouchableOpacity> 
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          {/* Correction : mène maintenant aux Alertes */}
          <TouchableOpacity onPress={() => router.push('/alerts')}>
            <Feather name="bell" size={24} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Feather name="home" size={24} color="#fbcfe8" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/note-editor')}>
            <Feather name="edit-3" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebarContainer: { flex: 1, flexDirection: 'row' },
  blueOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30, 58, 138, 0.4)' },
  sidebarDrawer: { width: '65%', height: '100%', backgroundColor: '#8B1A1A', padding: 24, paddingTop: 50 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 20, marginBottom: 40 },
  sidebarTitle: { color: 'white', fontWeight: '900', fontSize: 16 },
  sidebarNav: { flex: 1, alignItems: 'center' },
  sidebarBtn: { marginBottom: 35 },
  sidebarBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  sidebarFooter: { alignItems: 'center', marginBottom: 30 },
  versionText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 15 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  logoImg: { width: '100%', height: '100%', borderRadius: 35 },
  logoPlaceholder: { width: '100%', height: '100%', borderRadius: 35, backgroundColor: '#fbcfe8', justifyContent: 'center', alignItems: 'center' },
  logoPText: { fontSize: 8, fontWeight: 'bold', color: '#8B1A1A' },

  headerRed: { marginHorizontal: 12, marginTop: 20, height: 60, backgroundColor: '#c0262b', borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  searchContainer: { marginHorizontal: 12, marginTop: 30, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  searchInput: { flex: 1, height: 60, backgroundColor: 'white', borderRadius: 30, paddingLeft: 44, paddingRight: 48, fontSize: 16, elevation: 2 },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton: { position: 'absolute', right: 12, zIndex: 1 },
  blockSelector: { marginHorizontal: 12, marginTop: 20, backgroundColor: '#263d7e', borderRadius: 30, padding: 6, maxHeight: 60 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, marginRight: 6, justifyContent: 'center' },
  blockButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  univSection: { marginHorizontal: 12, marginTop: 30, alignItems: 'center' },
  imageContainer: { width: '100%', height: 400, borderWidth: 3, borderColor: '#fceef5', borderRadius: 60, overflow: 'hidden', backgroundColor: '#4184f4', elevation: 10 },
  univImage: { width: '100%', height: '100%' },
  placeholderBlue: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: 'white', fontWeight: 'bold', marginTop: 10 },
  titleBadgeUnder: { backgroundColor: '#263d7e', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15, marginTop: -30, elevation: 5, borderWidth: 1, borderColor: '#fceef5' },
  titleText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 65, borderRadius: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, elevation: 10 }
});
