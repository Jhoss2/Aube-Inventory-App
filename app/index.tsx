import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';
import { Video, ResizeMode } from 'expo-av';
import SideBar from './SideBar'; // ← import du composant SideBar (même dossier app/)

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const videoRef = useRef(null);

  const univImage      = (appData && appData.settings && appData.settings.univImage) || null;
  const backgroundImage = (appData && appData.settings && appData.settings.bgImage) || null;

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  // ── SPLASH ────────────────────────────────────────────────────────────────
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar hidden />
        <Video
          ref={videoRef}
          source={require('@/assets/animation.mp4')}
          style={styles.splashVideo}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) setShowSplash(false);
          }}
        />
      </View>
    );
  }

  // ── ÉCRAN PRINCIPAL ───────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* ── SIDEBAR (composant complet avec téléchargement PDF) ── */}
      <SideBar visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* ── CORPS ── */}
      <ImageBackground
        source={backgroundImage ? { uri: backgroundImage } : undefined}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}
        resizeMode="cover"
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER */}
          <View style={[styles.headerRed, styles.glow]}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="tune" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* BARRE DE RECHERCHE */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput
              placeholder="Que cherchez vous ?"
              placeholderTextColor="#9ca3af"
              style={[styles.searchInput, styles.glow, styles.boldSerif]}
            />
            <TouchableOpacity style={styles.botButton} onPress={() => router.push('/chat-aube')}>
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* SÉLECTEUR DE BLOCS */}
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
                  <Text style={[styles.blockButtonText, styles.boldSerif]}>BLOC {block}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* IMAGE UNIVERSITÉ */}
          <View style={styles.univSection}>
            <View style={[styles.imageContainerBosse, styles.intenseGlow]}>
              <View style={styles.innerPadding}>
                {univImage ? (
                  <Image source={{ uri: univImage }} style={styles.univImage} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderBlue}>
                    <Feather name="image" size={50} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.titleSupport, styles.glow]}>
              <Text style={[styles.titleText, styles.boldSerif]}>UNIVERSITÉ AUBE NOUVELLE</Text>
            </View>
          </View>
        </ScrollView>

        {/* BARRE DE NAVIGATION BAS */}
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
  splashContainer: { flex: 1, backgroundColor: '#1A237E' },
  splashVideo:     { flex: 1, width: '100%', height: '100%' },

  boldSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },

  headerRed: {
    marginHorizontal: 12, marginTop: 20, height: 60,
    backgroundColor: '#8B0000', borderRadius: 30,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20,
  },

  searchContainer: { marginHorizontal: 12, marginTop: 30, flexDirection: 'row', alignItems: 'center' },
  searchInput: {
    flex: 1, height: 60, backgroundColor: 'white', borderRadius: 30,
    paddingLeft: 44, paddingRight: 48, fontSize: 14, color: '#333',
  },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton:  { position: 'absolute', right: 12, zIndex: 1 },

  blockSelectorContainer: {
    marginHorizontal: 12, marginTop: 20, backgroundColor: '#263d7e',
    borderRadius: 30, height: 60, overflow: 'hidden',
  },
  blockScrollContent: { paddingHorizontal: 15, alignItems: 'center', gap: 15 },
  blockButton: {
    backgroundColor: '#385598', paddingHorizontal: 18,
    height: 38, borderRadius: 15, justifyContent: 'center',
  },
  blockButtonText: { color: 'white', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },

  univSection: { marginHorizontal: 12, marginTop: 30, alignItems: 'center' },
  imageContainerBosse: {
    width: '100%', height: 380, borderRadius: 80,
    backgroundColor: '#C97EFD', padding: 18,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  innerPadding: {
    flex: 1, borderRadius: 62, overflow: 'hidden',
    backgroundColor: '#C97EFD', borderWidth: 4,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  univImage:        { width: '100%', height: '100%' },
  placeholderBlue:  { flex: 1, backgroundColor: '#4184f4', justifyContent: 'center', alignItems: 'center' },

  titleSupport: {
    backgroundColor: '#263d7e', paddingHorizontal: 22, paddingVertical: 12,
    borderRadius: 50, marginTop: 18, borderWidth: 1.5, borderColor: '#fceef5', alignSelf: 'center',
  },
  titleText: { color: 'white', fontSize: 14, letterSpacing: 4, textTransform: 'uppercase' },

  bottomNav: {
    position: 'absolute', bottom: 16, left: 16, right: 16,
    backgroundColor: '#263d7e', height: 65, borderRadius: 35,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 40,
  },

  intenseGlow: {
    elevation: 30, shadowColor: '#C97EFD',
    shadowOpacity: 0.9, shadowRadius: 25, shadowOffset: { width: 0, height: 15 },
  },
  glow: {
    elevation: 15, shadowColor: '#000',
    shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 8 },
  },
});
          
