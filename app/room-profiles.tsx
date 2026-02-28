import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { categoryTitle, subId } = useLocalSearchParams();

  // Liste des niveaux
  const niveaux = [
    "Sous-sol",
    "Rez-de-chaussée",
    "Premier Niveau",
    "Deuxième Niveau",
    "Troisième Niveau",
    "Quatrième Niveau"
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Badge Rouge */}
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>
            {categoryTitle ? categoryTitle : `BLOC ${subId}`}
          </Text>
        </View>

        {/* Sous-titre */}
        <View style={styles.subTitleContainer}>
          <View style={styles.decoCircleOuter}>
            <View style={styles.decoCircleInner} />
          </View>
          <Text style={styles.subTitleText}>· Niveaux de Subdivision ·</Text>
        </View>

        {/* Liste des niveaux */}
        <View style={styles.levelsList}>
          {niveaux.map((niveau, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.levelButton}
              onPress={() => router.push({ 
                pathname: '/room-details', 
                params: { roomName: niveau } 
              })}
            >
              <Text style={styles.levelButtonText}>· {niveau} ·</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Barre de navigation Android simulée */}
      <View style={styles.androidNav}>
        <Ionicons name="chevron-back" size={20} color="#ccc" />
        <View style={styles.navSquare} />
        <View style={styles.navCircle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 32, paddingTop: 24, alignItems: 'center' },
  
  redBadge: { 
    width: '100%', 
    backgroundColor: '#B21F18', 
    paddingVertical: 16, // Correction ici (suppression de py)
    borderRadius: 25, 
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  redBadgeText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: '900', 
    fontSize: 20, 
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' 
  },

  subTitleContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 2,
    position: 'relative'
  },
  decoCircleOuter: {
    position: 'absolute',
    top: -16,
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2
  },
  decoCircleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dbeafe',
  },
  subTitleText: { color: '#1D3583', fontWeight: 'bold', fontSize: 14, letterSpacing: 1.5 },

  levelsList: { width: '100%', marginTop: 24, paddingBottom: 40 },
  levelButton: {
    width: '100%',
    backgroundColor: '#1D3583',
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 12,
    elevation: 4,
    alignItems: 'center'
  },
  levelButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },

  androidNav: {
    marginTop: 'auto',
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    opacity: 0.3
  },
  navSquare: { width: 16, height: 16, borderWidth: 2, borderColor: '#9ca3af', borderRadius: 2 },
  navCircle: { width: 16, height: 16, backgroundColor: '#9ca3af', borderRadius: 8 }
});
