import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Image, ImageBackground, Modal, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const univImage = appData.settings?.univImage;
  const backgroundImage = appData.settings?.bgImage;

  return (
    <View style={{ flex: 1 }}>
      {/* --- MENU LATÉRAL (SIDE-BAR) --- */}
      <Modal transparent visible={isMenuOpen} animationType="none">
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setIsMenuOpen(false)}>
          <Animated.View style={styles.sideMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>AUBE INVENTORY</Text>
              <Text style={styles.menuSubtitle}>Menu Principal</Text>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); router.push('/guide-viewer'); }}>
                <Feather name="book-open" size={20} color="#1D3583" />
                <Text style={styles.menuItemText}>Guide d'utilisation</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); /* Lien vers le PDF Dev */ }}>
                <Feather name="user" size={20} color="#1D3583" />
                <Text style={styles.menuItemText}>À propos du développeur</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity style={styles.menuItem} onPress={() => { setIsMenuOpen(false); router.push('/settings'); }}>
                <Feather name="settings" size={20} color="#1D3583" />
                <Text style={styles.menuItemText}>Paramètres système</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* --- CONTENU PRINCIPAL --- */}
      <ImageBackground source={backgroundImage ? { uri: backgroundImage } : null} style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 150 }}>
          
          {/* Header avec bouton Menu */}
          <View style={styles.headerRed}>
            <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <MaterialCommunityIcons name="tune" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Recherche & Robot Aube */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput placeholder="Que cherchez-vous ?" style={styles.searchInput} />
            <TouchableOpacity style={styles.botButton} onPress={() => router.push('/chat-aube')}>
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Sélecteur de Blocs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
              <TouchableOpacity key={block} style={styles.blockButton} onPress={() => router.push({ pathname: '/room-contents', params: { blockId: block } })}>
                <Text style={styles.blockButtonText}>Bloc {block}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Image Université Responsive */}
          <View style={styles.univSection}>
            <View style={styles.imageContainer}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={{width: '100%', height: '100%'}} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderBlue}><Text style={styles.placeholderText}>Université</Text></View>
              )}
            </View>
            <View style={styles.titleBadge}><Text style={styles.titleText}>UNIVERSITE AUBE NOUVELLE</Text></View>
          </View>
        </ScrollView>

        {/* Navigation Bas : Alerte, Accueil, Notes */}
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
  // Styles du Menu Latéral
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sideMenu: { width: '75%', height: '100%', backgroundColor: 'white', padding: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  menuHeader: { marginTop: 40, marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuTitle: { fontSize: 22, fontWeight: '900', color: '#c0262b' },
  menuSubtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  menuItems: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, gap: 15 },
  menuItemText: { fontSize: 16, color: '#1D3583', fontWeight: '600' },
  menuDivider: { height: 1, backgroundColor: '#eee', my: 10 },

  // Styles Accueil (existants)
  headerRed: { marginHorizontal: 12, marginTop: 40, height: 48, backgroundColor: '#c0262b', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  searchContainer: { marginHorizontal: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22, paddingLeft: 44, paddingRight: 48, fontSize: 13 },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton: { position: 'absolute', right: 12, zIndex: 1 },
  blockSelector: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#1D3583', borderRadius: 10, padding: 6, maxHeight: 50 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  blockButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  univSection: { marginHorizontal: 12, marginTop: 20, alignItems: 'center' },
  imageContainer: { width: '100%', height: 320, borderRadius: 25, overflow: 'hidden', backgroundColor: '#4184f4' },
  placeholderBlue: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: 'white', fontSize: 52, fontWeight: 'bold' },
  titleBadge: { backgroundColor: '#1D3583', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: -20, elevation: 5 },
  titleText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#1D3583', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 56 }
});
