import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const univImage = appData.settings?.univImage;
  const backgroundImage = appData.settings?.bgImage;
  const menuBg = appData.settings?.menuBg;
  const menuLogo = appData.settings?.menuLogo;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* --- MENU LATÉRAL (SIDEBAR ROUGE) --- */}
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
                { label: "A propos du développeur", path: '/about-dev' },
                { label: "Données essentielles", path: '/categories' }
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
        source={backgroundImage ? { uri: backgroundImage } : null}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}
        resizeMode="cover"
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.headerRed}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="tune" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Recherche & Robot */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput placeholder="Que cherchez vous aujourd'hui ?" style={styles.searchInput} />
            <TouchableOpacity style={styles.botButton} onPress={() => router.push('/chat-aube')}>
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Blocs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
              <TouchableOpacity 
                key={block} 
                style={styles.blockButton}
                onPress={() => router.push({ pathname: '/room-contents', params: { blockId: block } })}
              >
                <Text style={styles.blockButtonText}>Bloc {block}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Université Section */}
          <View style={styles.univSection}>
            <View style={styles.imageContainer}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={styles.univImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderBlue}><Text style={styles.placeholderText}>Université</Text></View>
              )}
            </View>
            <View style={styles.titleBadge}>
              <Text style={styles.titleText}>UNIVERSITE AUBE NOUVELLE</Text>
            </View>
          </View>
        </ScrollView>

        {/* Barre de Navigation : Alerte, Accueil, Notes */}
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
  // SideBar Styles
  sidebarContainer: { flex: 1, flexDirection: 'row' },
  blueOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30, 58, 138, 0.4)' },
  sidebarDrawer: { width: '65%', height: '100%', backgroundColor: '#8B1A1A', padding: 24, paddingTop: 50 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', pb: 20, mb: 40 },
  sidebarTitle: { color: 'white', fontWeight: '900', fontSize: 16, lineHeight: 18 },
  sidebarNav: { flex: 1, alignItems: 'center' },
  sidebarBtn: { marginBottom: 35 },
  sidebarBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  sidebarFooter: { alignItems: 'center', marginBottom: 30 },
  versionText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 2, marginBottom: 15 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)', padding: 4, justifyContent: 'center', alignItems: 'center' },
  logoImg: { width: '100%', height: '100%', borderRadius: 35 },
  logoPlaceholder: { width: '100%', height: '100%', borderRadius: 35, backgroundColor: '#fbcfe8', justifyContent: 'center', alignItems: 'center' },
  logoPText: { fontSize: 8, fontWeight: 'bold', color: '#8B1A1A' },

  // Home Styles
  headerRed: { marginHorizontal: 12, marginTop: 40, height: 48, backgroundColor: '#c0262b', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  searchContainer: { marginHorizontal: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22, paddingLeft: 44, paddingRight: 48, fontSize: 13 },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton: { position: 'absolute', right: 12, zIndex: 1 },
  blockSelector: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#263d7e', borderRadius: 10, padding: 6, maxHeight: 50 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  blockButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  univSection: { marginHorizontal: 12, marginTop: 20, alignItems: 'center' },
  imageContainer: { width: '100%', height: 320, borderRadius: 25, overflow: 'hidden', backgroundColor: '#4184f4' },
  univImage: { width: '100%', height: '100%' },
  placeholderBlue: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: 'white', fontSize: 52, fontWeight: 'bold' },
  titleBadge: { backgroundColor: '#263d7e', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: -20, elevation: 5 },
  titleText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 56 }
});
