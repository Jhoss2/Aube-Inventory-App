import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

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
        <View style={styles.overlay} />
      </ImageBackground>

      {/* 2. Menu Rouge (Sidebar) - Largeur fixée à 50% */}
      <View style={styles.sidebar}>
        
        {/* Header du Menu */}
        <View className="p-5 pt-12 border-b border-white/20 flex-row justify-between items-start">
          <Text style={{ fontFamily: 'serif' }} className="text-white font-black text-[14px] leading-tight uppercase tracking-tighter">
            U-AUBEN{"\n"}SUPPLIES{"\n"}TRACKER
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Options de Navigation */}
        <View className="flex-1 items-center pt-16 px-2 gap-y-12">
          {menuOptions.map((option, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => {
                onClose();
                router.push(option.route);
              }}
              className="active:scale-95"
            >
              <Text className="text-white font-bold text-[11px] tracking-widest text-center leading-5">
                · {option.label.toUpperCase()} ·
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pied de Page du Menu */}
        <View className="p-8 items-center">
          <Text className="text-white/70 font-bold text-[9px] tracking-[2px] uppercase mb-4">
            Version 1.1.1
          </Text>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoInner}>
               <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                 <Text className="text-[8px] font-bold text-white">LOGO</Text>
               </View>
            </View>
          </View>
        </View>
      </View>

      {/* Zone vide à droite (50%) cliquable pour fermer */}
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Bleu-noir profond pour faire ressortir le rouge
  },
  sidebar: {
    width: width * 0.5, // Exactement 50% de l'écran
    height: '100%',
    backgroundColor: '#8B1A1A',
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },
  logoContainer: {
    width: 70,
    height: 7
