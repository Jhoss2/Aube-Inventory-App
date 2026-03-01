import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/lib/app-context';

export default function DynamicBlocScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { appData } = useAppContext() as any;

  const settings = appData.settings || {};
  const aerialImg = settings[`bloc${id}_aerial`];
  const sub1Img = settings[`bloc${id}_sub1`]; // Image pour B1
  const sub2Img = settings[`bloc${id}_sub2`]; // Image pour B2

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLOC {id}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>VUE AÉRIENNE (PLAN)</Text>
        <TouchableOpacity 
          onPress={() => aerialImg && router.push({ pathname: '/image-viewer', params: { imageUrl: aerialImg } })}
        >
          {aerialImg && <Image source={{ uri: aerialImg }} style={styles.mainImage} />}
        </TouchableOpacity>

        <View style={styles.row}>
          {/* CLIQUE B1 -> ÉCRAN SUBDIVISION SALLES */}
          <View style={styles.col}>
            <Text style={styles.label}>SALLES ({id}1)</Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/subdivision', params: { blocId: id, type: 'SALLES', code: id + '1' } })}
            >
              {sub1Img && <Image source={{ uri: sub1Img }} style={styles.subImage} />}
            </TouchableOpacity>
          </View>

          {/* CLIQUE B2 -> ÉCRAN SUBDIVISION BUREAUX */}
          <View style={styles.col}>
            <Text style={styles.label}>BUREAUX ({id}2)</Text>
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/subdivision', params: { blocId: id, type: 'BUREAUX', code: id + '2' } })}
            >
              {sub2Img && <Image source={{ uri: sub2Img }} style={styles.subImage} />}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  scrollContent: { padding: 15 },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 10, color: '#8B1A1A' },
  mainImage: { width: '100%', height: 280, backgroundColor: '#f0f0f0' },
  row: { flexDirection: 'row', gap: 15 },
  col: { flex: 1 },
  subImage: { width: '100%', height: 160, backgroundColor: '#f0f0f0' }
});
