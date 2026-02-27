import React from 'react';
// CORRECTION ICI : on importe depuis 'react-native'
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native'; 
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams();
  const { appData } = useAppContext();

  // Récupération des images dynamiques
  const aerialImg = appData.settings?.[`bloc${blockId}_aerial` as any];
  const sub1Img = appData.settings?.[`bloc${blockId}_sub1` as any];
  const sub2Img = appData.settings?.[`bloc${blockId}_sub2` as any];

  const categories = [
    { id: 1, title: `SALLES DU BLOC ${blockId}`, sub: `${blockId}1`, image: sub1Img, color: '#4184f4' },
    { id: 2, title: `BUREAUX DU BLOC ${blockId}`, sub: `${blockId}2`, image: sub2Img, color: '#34a853' }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ESPACES BLOC {blockId}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Carte Vue Aérienne */}
        <View style={styles.aerialCard}>
          {aerialImg ? (
            <Image source={{ uri: aerialImg }} style={styles.fullImg} />
          ) : (
            <View style={[styles.fullImg, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
              <Feather name="map" size={40} color="#999" />
              <Text style={{color: '#999', marginTop: 10}}>Vue aérienne non configurée</Text>
            </View>
          )}
        </View>

        {/* Boutons Catégories */}
        {categories.map((cat) => (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.catCard}
            onPress={() => router.push({ 
              pathname: '/room-profiles', 
              params: { categoryTitle: cat.title, subId: cat.sub } 
            })}
          >
            <View style={[styles.imgPlaceholder, { backgroundColor: cat.color }]}>
              {cat.image ? (
                <Image source={{ uri: cat.image }} style={styles.fullImg} />
              ) : (
                <Feather name="home" size={30} color="white" />
              )}
            </View>
            <View style={styles.catInfo}>
              <Text style={styles.catTitle}>{cat.title}</Text>
              <Text style={styles.catSub}>Gérer l'inventaire des pièces</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    backgroundColor: '#8B1A1A', 
    paddingTop: 50, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  scroll: { padding: 15 },
  aerialCard: { 
    width: '100%', 
    height: 220, 
    borderRadius: 15, 
    overflow: 'hidden', 
    marginBottom: 20, 
    elevation: 3,
    backgroundColor: 'white'
  },
  fullImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  catCard: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15, 
    elevation: 2 
  },
  imgPlaceholder: { 
    width: 65, 
    height: 65, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden' 
  },
  catInfo: { flex: 1, marginLeft: 15 },
  catTitle: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  catSub: { fontSize: 12, color: '#999', marginTop: 4 }
});
