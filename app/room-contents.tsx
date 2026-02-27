import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams(); // Récupère 'A', 'B', etc.
  const { appData } = useAppContext();

  // Extraction dynamique des images depuis les paramètres selon le bloc cliqué
  const aerialImage = appData.settings?.[`bloc${blockId}_aerial` as keyof typeof appData.settings];
  const sub1Image = appData.settings?.[`bloc${blockId}_sub1` as keyof typeof appData.settings];
  const sub2Image = appData.settings?.[`bloc${blockId}_sub2` as keyof typeof appData.settings];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header avec bouton Retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Titre du Bloc (Badge Rouge) */}
        <View style={styles.blockBadge}>
          <Text style={styles.blockBadgeText}>BLOC {blockId}</Text>
        </View>

        {/* 1. CARTE VUE AÉRIENNE (Dynamique) */}
        <View style={styles.mainCard}>
          <View style={styles.imageWrapper}>
            {aerialImage ? (
              <Image source={{ uri: aerialImage }} style={styles.fullImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: '#6b7280' }]}>
                <Text style={styles.placeholderText}>Vue Aérienne {blockId}</Text>
              </View>
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>· Bloc {blockId} vu de dessus ·</Text>
          </View>
        </View>

        {/* 2. CARTE SALLES (Dynamique) */}
        <Text style={styles.sectionTitle}>{blockId}1</Text>
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => router.push({ pathname: '/room-details', params: { roomId: `${blockId}1` } })}
        >
          <View style={styles.imageWrapper}>
            {sub1Image ? (
              <Image source={{ uri: sub1Image }} style={styles.fullImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: '#4184f4' }]}>
                <Text style={styles.placeholderText}>Salles {blockId}1</Text>
              </View>
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>· Salles de classe ·</Text>
          </View>
        </TouchableOpacity>

        {/* 3. CARTE BUREAUX (Dynamique) */}
        <Text style={styles.sectionTitle}>{blockId}2</Text>
        <TouchableOpacity 
          style={styles.mainCard}
          onPress={() => router.push({ pathname: '/room-details', params: { roomId: `${blockId}2` } })}
        >
          <View style={styles.imageWrapper}>
            {sub2Image ? (
              <Image source={{ uri: sub2Image }} style={styles.fullImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: '#4184f4' }]}>
                <Text style={styles.placeholderText}>Bureaux {blockId}2</Text>
              </View>
            )}
          </View>
          <View style={styles.cardFooter}>
            <Text style={styles.footerText}>· Bureaux ·</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { paddingHorizontal: 16, paddingTop: 10, backgroundColor: 'white' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, alignItems: 'center', paddingBottom: 40 },
  
  blockBadge: { backgroundColor: '#c0262b', paddingHorizontal: 60, paddingVertical: 12, borderRadius: 25, marginVertical: 20, elevation: 4 },
  blockBadgeText: { color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 },

  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1D3583', marginTop: 25, marginBottom: 10, fontFamily: 'serif' },
  
  mainCard: { width: '100%', backgroundColor: 'white', borderRadius: 20, elevation: 5, overflow: 'hidden', marginBottom: 10 },
  imageWrapper: { width: '100%', height: 220 },
  fullImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: 'white', fontSize: 32, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 10 },
  
  cardFooter: { paddingVertical: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  footerText: { fontSize: 12, color: '#374151', fontStyle: 'italic' }
});
