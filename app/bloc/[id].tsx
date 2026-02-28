import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DynamicBlocScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Récupère "A", "B", "C"...
  const { appData } = useAppContext() as any;

  // Génération dynamique des clés pour récupérer les bonnes images
  const aerialImg = appData.settings?.[`bloc${id}_aerial`];
  const sub1Img = appData.settings?.[`bloc${id}_sub1`];
  const sub2Img = appData.settings?.[`bloc${id}_sub2`];

  return (
    <View style={styles.container}>
      {/* Header simple avec retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DÉTAILS DU BLOC {id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- IMAGE VUE DE DESSUS (CLIQUABLE) --- */}
        <Text style={styles.sectionTitle}>VUE DE DESSUS (PLAN)</Text>
        <TouchableOpacity 
          activeOpacity={0.9}
          style={styles.aerialContainer}
          onPress={() => router.push({
            pathname: '/image-viewer',
            params: { imageUrl: aerialImg }
          })}
        >
          <Image 
            source={aerialImg ? { uri: aerialImg } : require('@/assets/images/icon.png')} 
            style={styles.aerialImage} 
          />
          <View style={styles.zoomBadge}>
            <Ionicons name="expand" size={16} color="white" />
            <Text style={styles.zoomText}>AGRANDIR</Text>
          </View>
        </TouchableOpacity>


        {/* --- AUTRES IMAGES (STATIQUES) --- */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.subTitle}>SALLES</Text>
            <Image 
              source={sub1Img ? { uri: sub1Img } : require('@/assets/images/icon.png')} 
              style={styles.staticImage} 
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.subTitle}>BUREAUX</Text>
            <Image 
              source={sub2Img ? { uri: sub2Img } : require('@/assets/images/icon.png')} 
              style={styles.staticImage} 
            />
          </View>
        </View>

        {/* Espace pour tes futures listes de matériel */}
        <View style={styles.inventoryPlaceholder}>
            <Text style={styles.inventoryText}>Inventaire du matériel bientôt ici...</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'white', gap: 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1D3583' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#666', marginBottom: 10, letterSpacing: 1 },
  aerialContainer: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#ddd', elevation: 5 },
  aerialImage: { width: '100%', height: 280 },
  zoomBadge: { 
    position: 'absolute', bottom: 15, right: 15, 
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, 
    paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 
  },
  zoomText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  
  row: { flexDirection: 'row', gap: 15, marginTop: 25 },
  col: { flex: 1 },
  subTitle: { fontSize: 11, fontWeight: '900', color: '#8B1A1A', marginBottom: 8, textAlign: 'center' },
  staticImage: { width: '100%', height: 140, borderRadius: 15, backgroundColor: '#eee' },
  
  inventoryPlaceholder: { marginTop: 30, padding: 40, borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc', borderRadius: 20, alignItems: 'center' },
  inventoryText: { color: '#aaa', fontStyle: 'italic' }
});
