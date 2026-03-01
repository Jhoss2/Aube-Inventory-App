import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground, Modal, Platform } from 'react-native';
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
                <Feather name="x" size={32} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarNav}>
              {[
                { label: "Guide d'utilisation", path: '/guide-viewer' },
                { label: "A propos du développeur", path: '/about-dev' }
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
          
          {/* Header Rouge Pill */}
          <View style={[styles.headerRed, styles.glow]}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="tune" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput placeholder="Que cherchez vous ?" style={[styles.searchInput, styles.glow]} />
            <TouchableOpacity style={styles.botButton} onPress={() => router.push('/chat-aube')}>
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Sélecteur de Blocs - Maillon de chaîne uniforme */}
          <View style={[styles.blockSelectorContainer, styles.glow]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.blockScrollContent}
            >
              {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
                <TouchableOpacity 
                  key={block} 
                  style={styles.blockButton}
                  onPress={() => router.push({ pathname: '/bloc-details', params: { blockId: block } })}
                >
                  <Text style={styles.blockButtonText}>Bloc {block}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section Université - Image avec titre support décollé */}
          <View style={styles.univSection}>
            <View style={[styles.imageContainer, styles.glow]}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={styles.univImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderBlue}>
                  <Feather name="image" size={50} color="rgba(255,255,255,0.3)" />
                </View>
              )}
            </View>

            {/* Support ajustable à la taille du texte */}
            <View style={[styles.titleSupport, styles.glow]}>
              <Text style={styles.titleText}>UNIVERSITÉ AUBE NOUVELLE</Text>
            </View>
          </View> 
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, styles.glow]}>
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
  sidebarDrawer: { 
    width: '50%', 
    height: '100%', 
    backgroundColor: 'rgba(139, 0, 0, 0.92)', 
    padding: 20, 
    paddingTop: 60 
  },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingBottom: 20, marginBottom: 40 },
  sidebarTitle: { 
    color: 'white', fontWeight: '900', fontSize: 28, lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', textTransform: 'uppercase'
  },
  sidebarNav: { flex: 1, alignItems: 'center', paddingTop: 20 },
  sidebarBtn: { marginBottom: 50, width: '100%' },
  sidebarBtnText: { 
    color: 'white', fontWeight: 'bold', fontSize: 22, textAlign: 'center',
    fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif'
  },
  sidebarFooter: { alignItems: 'center', marginBottom: 30 },
  versionText: { color: 'white', fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', padding: 4, justifyContent: 'center', alignItems: 'center' },
  logoImg: { width: '100%', height: '100%', borderRadius: 40 },
  logoPlaceholder: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: '#fbcfe8', justifyContent: 'center', alignItems: 'center' },
  logoPText: { fontSize: 12, fontWeight: 'bold', color: '#8B0000' },

  headerRed: { marginHorizontal: 12, marginTop: 20, height: 60, backgroundColor: '#8B0000', borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  searchContainer: { marginHorizontal: 12, marginTop: 30, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 60, backgroundColor: 'white', borderRadius: 30, paddingLeft: 44, paddingRight: 48, fontSize: 16 },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton: { position: 'absolute', right: 12, zIndex: 1 },
  
  // Conteneur des Blocs corrigé pour la symétrie
  blockSelectorContainer: { 
    marginHorizontal: 12, 
    marginTop: 20, 
    backgroundColor: '#263d7e', 
    borderRadius: 30, 
    height: 60, 
    overflow: 'hidden' 
  },
  blockScrollContent: { 
    paddingHorizontal: 15, // Espace constant bord-bouton
    alignItems: 'center',
    gap: 15 // Espace constant entre CHAQUE bouton
  },
  blockButton: { 
    backgroundColor: '#385598', 
    paddingHorizontal: 18, 
    height: 38, 
    borderRadius: 15, 
    justifyContent: 'center' 
  },
  blockButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  
  univSection: { marginHorizontal: 12, marginTop: 30, alignItems: 'center' },
  imageContainer: { width: '100%', height: 380, borderWidth: 3, borderColor: '#fceef5', borderRadius: 60, overflow: 'hidden', backgroundColor: '#4184f4' },
  univImage: { width: '100%', height: '100%' },
  placeholderBlue: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  titleSupport: { 
    backgroundColor: '#263d7e', 
    paddingHorizontal: 22, 
    paddingVertical: 12, 
    borderRadius: 50, 
    marginTop: 18, 
    borderWidth: 1.5, 
    borderColor: '#fceef5',
    alignSelf: 'center'
  },
  titleText: { color: 'white', fontSize: 13, fontWeight: '900', letterSpacing: 1.5 },

  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 65, borderRadius: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40 },
  glow: { elevation: 15, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } }
});
