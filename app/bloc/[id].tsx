import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/lib/app-context';
import { Ionicons } from '@expo/vector-icons';

export default function DynamicBlocScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { appData } = useAppContext() as any;

  // Récupération des images depuis les settings
  const aerialImg = appData.settings?.[`bloc${id}_aerial`];
  const sub1Img = appData.settings?.[`bloc${id}_sub1`];
  const sub2Img = appData.settings?.[`bloc${id}_sub2`];

  return (
    <View style={styles.container}>
      {/* Header avec retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DÉTAILS DU BLOC {id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* --- IMAGE VUE DE DESSUS --- */}
        <Text style={styles.sectionTitle}>VUE DE DESSUS (PLAN)</Text>
        <TouchableOpacity 
          activeOpacity={aerialImg ? 0.9 : 1}
          style={styles.aerialContainer}
          onPress={() => aerialImg && router.push({
            pathname: '/image-viewer',
            params: { imageUrl: aerialImg }
          })}
        >
          {aerialImg ? (
            <Image source={{ uri: aerialImg }} style={styles.aerialImage} />
          ) : (
            <View style={[styles.aerialImage, styles.placeholder]}>
              <Ionicons name="map-outline" size={40} color="#999" />
              <Text style={styles.placeholderText}>Aucun plan configuré</Text>
            </View>
          )}
          
          {aerialImg && (
            <View style={styles.zoomBadge}>
              <Ionicons name="expand" size={16} color="white" />
              <Text style={styles.zoomText}>AGRANDIR</Text>
            </View>
          )}
        </TouchableOpacity>


        {/* --- AUTRES IMAGES --- */}
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.subTitle}>SALLES</Text>
            {sub1Img ? (
              <Image source={{ uri: sub1Img }} style={styles.staticImage} />
            ) : (
              <View style={[styles.staticImage, styles.placeholder]}>
                <Ionicons name="images-outline" size={24} color="#ccc" />
              </View>
            )}
          </View>

          <View style={styles.col}>
            <Text style={styles.subTitle}>BUREAUX</Text>
            {sub2Img ? (
              <Image source={{ uri: sub2Img }} style={styles.staticImage} />
            ) : (
              <View style={[styles.staticImage, styles.placeholder]}>
                <Ionicons name="business-outline" size={24} color="#ccc" />
              </View>
            )}
          </View>
        </View>

        <View style={styles.inventoryPlaceholder}>
            <Text style={styles.inventoryText}>Inventaire du matériel bientôt ici...</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 15, backgroundColor: 'white' },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1D3583' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#666', marginBottom: 10, letterSpacing: 1 },
  aerialContainer: { borderRadius: 20, overflow: 'hidden', backgroundColor: '#eee', elevation: 2 },
  aerialImage: { width: '100%', height: 280 },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#e1e1e1' },
  placeholderText: { color: '#999', fontSize: 12, marginTop: 10 },
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
