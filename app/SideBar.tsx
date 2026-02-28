import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ImageBackground, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/lib/app-context';

export default function SideBar({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const router = useRouter();
  const { appData } = useAppContext();

  const menuBg = appData?.settings?.menuBg;
  const menuLogo = appData?.settings?.menuLogo;

  const menuOptions = [
    { label: "Guide d'utilisation de l'application", path: '/guide-viewer' },
    { label: "A propos du développeur", path: '/about-dev' },
    { label: "Données essentielles", path: '/categories' }
  ];

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.container}>
        
        <ImageBackground 
          source={menuBg ? { uri: menuBg } : { uri: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        >
          <View style={styles.blueOverlay} />
        </ImageBackground>

        <View style={styles.sidebarDrawer}>
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <Text style={styles.titleText}>U-AUBEN{"\n"}SUPPLIES{"\n"}TRACKER</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={28} color="white" />
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
  sidebarDrawer: {
    width: '65%',
    height: '100%',
    backgroundColor: '#8B1A1A',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  header: { padding: 24, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: -0.5, lineHeight: 20 },
  navContainer: { flex: 1, paddingTop: 50, alignItems: 'center' },
  navButton: { marginBottom: 40, paddingHorizontal: 10 },
  navText: { color: 'white', fontWeight: 'bold', fontSize: 13, textAlign: 'center', letterSpacing: 0.5 },
  footer: { paddingBottom: 40, alignItems: 'center' },
  versionText: { color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', fontSize: 10, letterSpacing: 2, marginBottom: 20 },
  logoOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)', padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logoGradient: { width: '100%', height: '100%', borderRadius: 40, backgroundColor: '#fbcfe8', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.4)', justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 10, fontWeight: 'bold', color: '#8B1A1A' },
  closeZone: { flex: 1, height: '100%' }
});
