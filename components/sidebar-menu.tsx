import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context'; // Pour l'image dynamique

const { width } = Dimensions.get('window');

interface SidebarMenuProps {
  onClose: () => void;
}

export default function SidebarMenu({ onClose }: SidebarMenuProps) {
  const router = useRouter();
  const { appData } = useAppContext();

  const menuOptions = [
    { label: "Guide d'utilisation de l'application", route: '/screens/guide' },
    { label: "A propos du développeur", route: '/screens/about' },
    { label: "Données essentielles", route: '/screens/stats' }
  ];

  return (
    <View style={styles.container}>
      {/* 1. Image de fond (Configurable via Paramètres) */}
      <ImageBackground 
        source={{ uri: appData.general.menuBgUrl || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop' }}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Overlay bleuté / flou */}
        <View style={styles.overlay} />
      </ImageBackground>

      {/* 2. Menu Rouge (Sidebar) */}
      <View style={styles.sidebar}>
        
        {/* Header du Menu */}
        <View className="p-6 pt-12 border-b border-white/20 flex-row justify-between items-start">
          <Text style={{ fontFamily: 'serif' }} className="text-white font-black text-lg leading-tight uppercase tracking-tighter">
            U-AUBEN SUPPLIES{"\n"}TRACKER
          </Text>
          <TouchableOpacity onPress={onClose} className="pt-1">
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Options de Navigation */}
        <View className="flex-1 items-center pt-12 px-4 gap-y-12">
          {menuOptions.map((option, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => {
                onClose();
                router.push(option.route);
              }}
              className="active:scale-95"
            >
              <Text className="text-white font-bold text-sm tracking-widest text-center">
                · {option.label.toUpperCase()} ·
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pied de Page du Menu */}
        <View className="p-10 items-center">
          <Text className="text-white/80 font-bold text-[10px] tracking-widest uppercase mb-6">
            · Version 1.1.1 ·
          </Text>
          
          {/* Logo Circulaire avec flou (Glassmorphism) */}
          <View style={styles.logoContainer}>
            <View style={styles.logoInner}>
               {/* Ici, ton logo d'université stocké dans appData */}
               <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center">
                 <Text className="text-[10px] font-bold text-white">LOGO</Text>
               </View>
            </View>
          </View>
        </View>
      </View>

      {/* Zone cliquable à droite pour fermer le menu */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose} 
        style={{ flex: 1 }} 
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 58, 138, 0.4)', // Ton effet bleu foncé transparent
  },
  sidebar: {
    width: width * 0.7, // 70% de la largeur de l'écran
    height: '100%',
    backgroundColor: '#8B1A1A', // Ton rouge brique
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
