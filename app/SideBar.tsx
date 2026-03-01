import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ImageBackground, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '../lib/app-context'; // Ajustement du chemin vers le lib

export default function SideBar({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  const menuBg = appData?.settings?.menuBg;
  const menuLogo = appData?.settings?.menuLogo;

  const menuOptions = [
    { label: "Guide d'utilisation", path: '/guide-viewer' },
    { label: "A propos du développeur", path: '/about-dev' }
  ];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        
        <ImageBackground 
          source={menuBg ? { uri: menuBg } : { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          {/* Superposition bleue sur l'image d'arrière-plan */}
          <View style={styles.blueOverlay} />
        </ImageBackground>

        {/* TIROIR ROUGE SEMI-TRANSPARENT (rgba à 0.92) */}
        <View style={styles.sidebarDrawer}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.titleText}>U-AUBEN{"\n"}SUPPLIES{"\n"}TRACKER</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={32} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.navContainer}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.navButton}
                onPress={() => {
                  onClose();
                  router.push(option.path as any);
                }}
              >
                <Text style={styles.navText}>· {option.label} ·</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.versionText}>· Version 1.1.1 ·</Text>
            <View style={styles.logoOuter}>
              <View style={styles.logoGradient}>
                {menuLogo ? (
                  <Image source={{ uri: menuLogo }} style={styles.logoImage} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoText}>LOGO</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Zone cliquable pour fermer */}
        <TouchableOpacity 
          style={styles.closeZone} 
          onPress={onClose} 
          activeOpacity={1} 
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  blueOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30, 58, 138, 0.4)' },
  
  // Style du tiroir mis à jour
  sidebarDrawer: {
    width: '50%',
    height: '100%',
    // ROUGE PROFOND SEMI-TRANSPARENT (92% opaque)
    backgroundColor: 'rgba(139, 0, 0, 0.92)', 
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleText: { 
    color: 'white', 
    fontWeight: '900', 
    fontSize: 28, 
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', 
    textTransform: 'uppercase'
  },
  navContainer: { flex: 1, paddingTop: 60, alignItems: 'center' },
  navButton: { marginBottom: 50, paddingHorizontal: 15, width: '100%' },
  navText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 22, 
    textAlign: 'center', 
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif',
  },
  footer: { paddingBottom: 40, alignItems: 'center' },
  versionText: { color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', fontSize: 14, marginBottom: 20 },
  logoOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoGradient: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: '#fbcfe8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 16, fontWeight: 'bold', color: '#8B0000' }, // Rouge plein pour le logo interne
  closeZone: { flex: 1, height: '100%' }
});
