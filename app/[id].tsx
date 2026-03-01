import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// On retire un "../" car le fichier est maintenant plus proche de la racine
import { useAppContext } from '@/lib/app-context';

export default function DynamicBlocScreen() {
  const { id } = useLocalSearchParams(); 
  const { appData } = useAppContext() as any;

  // Récupération brute des données
  const settings = appData.settings || {};
  const aerialImg = settings[`bloc${id}_aerial`];
  const sub1Img = settings[`bloc${id}_sub1`];
  const sub2Img = settings[`bloc${id}_sub2`];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLOC {id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>VUE AÉRIENNE</Text>
        {aerialImg && (
          <Image source={{ uri: aerialImg }} style={styles.mainImage} />
        )}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>SALLES</Text>
            {sub1Img && (
              <Image source={{ uri: sub1Img }} style={styles.subImage} />
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>BUREAUX</Text>
            {sub2Img && (
              <Image source={{ uri: sub2Img }} style={styles.subImage} />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  scrollContent: { padding: 15 },
  label: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#333', textTransform: 'uppercase' },
  mainImage: { width: '100%', height: 250, marginBottom: 25, borderRadius: 0 },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  subImage: { width: '100%', height: 160, borderRadius: 0 }
});
