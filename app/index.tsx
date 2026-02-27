import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();

  // Récupération des images depuis les paramètres SQLite
  const univImage = appData.settings?.univImage;
  const backgroundImage = appData.settings?.bgImage;

  // Fonction pour gérer les actions des boutons
  const handleButtonPress = (buttonName: string) => {
    Alert.alert("Action", `Vous avez cliqué sur le bouton : ${buttonName}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Arrière-plan dynamique défini depuis les paramètres */}
      <ImageBackground 
        source={backgroundImage ? { uri: backgroundImage } : null}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}
        resizeMode="cover"
      >
        
        {/* Barre d'état système simulée (Noire) */}
        <View style={styles.statusBarMock}>
          <View style={styles.flexRowCenter}>
            <Text style={styles.statusTime}>12:13</Text>
            <Ionicons name="chatbubble-outline" size={10} color="white" style={{marginLeft: 4}} />
            <Ionicons name="chatbubble-outline" size={10} color="white" />
            <Ionicons name="musical-notes-outline" size={10} color="white" />
          </View>
          <View style={styles.flexRowCenter}>
            <Ionicons name="volume-mute-outline" size={12} color="white" />
            <Ionicons name="wifi-outline" size={12} color="white" />
            <Text style={styles.statusBattery}>38 %</Text>
            <View style={styles.batteryIcon}><View style={styles.batteryLevel} /></View>
          </View>
        </View>

        {/* Contenu défilable de l'application */}
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Header Rouge (Forme Gélule) */}
          <View style={styles.headerRed}>
            <TouchableOpacity onPress={() => handleButtonPress('Menu')}>
              <Feather name="menu" size={24} color="white" style={styles.headerIcon} />
            </TouchableOpacity>
            {/* L'icône de paramètres correcte (sliders-horizontal) */}
            <TouchableOpacity onPress={() => router.push('/screens/settings')}>
              <MaterialCommunityIcons name="sliders-horizontal" size={24} color="white" style={styles.headerIcon} />
            </TouchableOpacity>
          </View>

          {/* Barre de Recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput 
              placeholder="Que cherchez vous aujourd'hui ?" 
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
            {/* Bouton Aube */}
            <TouchableOpacity 
              style={styles.botButton}
              onPress={() => router.push('/screens/chat-aube')}
            >
              <MaterialCommunityIcons name="robot" size={22} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Sélecteur de Blocs (Boutons A à F) */}
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
              {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
                <TouchableOpacity 
                  key={block} 
                  style={styles.blockButton}
                  onPress={() => handleButtonPress(`Bloc ${block}`)}
                >
                  <Text style={styles.blockButtonText}>Bloc {block}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section Université Responsive */}
          <View style={styles.universitySectionContainer}>
            {/* 1. Carte de l'Université (Image Responsive) */}
            <View style={styles.universityCard}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={styles.universityImage} resizeMode="contain" />
              ) : (
                <View style={styles.placeholderCard}>
                   {/* Design alternatif si pas d'image définie */}
                   <Text className="text-gray-400 font-bold">Image de l'Université</Text>
                </View>
              )}
            </View>
            
            {/* 2. Titre de l'Université (Responsive et en dessous) */}
            <View style={styles.titleBadge}>
              <Text style={styles.titleText}>UNIVERSITE AUBE NOUVELLE</Text>
            </View>
          </View>

        </ScrollView>

        {/* Barre de Navigation Flottante au bas */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => handleButtonPress('Alertes')}>
            <Feather name="bell" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleButtonPress('Accueil')}>
            <Feather name="home" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/guide-viewer')}>
            <Feather name="file-text" size={22} color="white" />
          </TouchableOpacity>
        </View>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  // Simulation de la barre d'état système
  statusBarMock: { height: 24, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8, zIndex: 100 },
  statusTime: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  statusBattery: { color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  flexRowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  batteryIcon: { width: 18, height: 9, borderWidth: 1, borderColor: 'white', borderRadius: 2, padding: 1, marginLeft: 4, justifyContent: 'center' },
  batteryLevel: { backgroundColor: 'white', height: '100%', width: '38%' },
  
  // Header rouge
  headerRed: { marginHorizontal: 12, marginTop: 12, height: 48, backgroundColor: '#c0262b', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, elevation: 2 },
  headerIcon: { strokeWidth: 2.5 }, // Pour correspondre au style lucide
  
  // Zone de recherche
  searchContainer: { marginHorizontal: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', zIndex: 50 },
  searchInput: { flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22, paddingLeft: 44, paddingRight: 48, fontSize: 13, fontWeight: '500', elevation: 1, color: '#6b7280' },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton: { position: 'absolute', right: 12, zIndex: 1 },

  // Sélecteur de blocs
  blockSelector: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#263d7e', borderRadius: 10, padding: 6, zIndex: 10 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  blockButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  // Conteneur Université Responsive
  universitySectionContainer: { marginHorizontal: 12, marginTop: 16, alignItems: 'center' },
  // Carte de l'Université (Image Responsive)
  universityCard: { width: '100%', backgroundColor: '#4184f4', borderRadius: 24, elevation: 3, overflow: 'hidden', marginBottom: -25, zIndex: 5 }, // Marges négatives pour que le badge chevauche
  universityImage: { width: '100%', aspectRatio: 16 / 9 }, // Aspect Ratio pour le côté responsive
  // Si pas d'image définie
  placeholderCard: { width: '100%', height: 330, backgroundColor: '#4184f4', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  
  // Badge de titre (Responsive et en dessous)
  titleBadge: { backgroundColor: '#263d7e', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, zIndex: 10 }, // zIndex supérieur pour chevauchement
  titleText: { color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 1, fontFamily: 'Times New Roman', textAlign: 'center' }, // Times New Roman simulé

  // Barre de navigation du bas
  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 56, elevation: 10, zIndex: 100 }
});
