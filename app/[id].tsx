import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppContext } from '@/lib/app-context';

export default function DynamicBlocScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { appData } = useAppContext() as any;

  // Gestion du responsive desktop
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const settings = appData.settings || {};
  const aerialImg = settings[`bloc${id}_aerial`];
  const sub1Img = settings[`bloc${id}_sub1`]; // Image pour B1
  const sub2Img = settings[`bloc${id}_sub2`]; // Image pour B2

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BLOC {id}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}>
        <View style={[styles.innerWrapper, isDesktop && styles.innerWrapperDesktop]}>
          
          <Text style={styles.label}>VUE AÉRIENNE (PLAN)</Text>
          <TouchableOpacity 
            onPress={() => aerialImg && router.push({ pathname: '/fullscreen-view', params: { imageUri: aerialImg } })}
          >
            {aerialImg && <Image source={{ uri: aerialImg }} style={[styles.mainImage, isDesktop && styles.mainImageDesktop]} />}
          </TouchableOpacity>

          <View style={styles.row}>
            {/* CLIQUE B1 -> ÉCRAN SUBDIVISION SALLES */}
            <View style={styles.col}>
              <Text style={styles.label}>SALLES ({id}1)</Text>
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/subdivision', params: { blockId: id, type: 'salles' } })}
              >
                {sub1Img && <Image source={{ uri: sub1Img }} style={[styles.subImage, isDesktop && styles.subImageDesktop]} />}
              </TouchableOpacity>
            </View>

            {/* CLIQUE B2 -> ÉCRAN SUBDIVISION BUREAUX */}
            <View style={styles.col}>
              <Text style={styles.label}>BUREAUX ({id}2)</Text>
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/subdivision', params: { blockId: id, type: 'bureaux' } })}
              >
                {sub2Img && <Image source={{ uri: sub2Img }} style={[styles.subImage, isDesktop && styles.subImageDesktop]} />}
              </TouchableOpacity>
            </View>
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
  scrollContentDesktop: { alignItems: 'center', paddingVertical: 30 },

  innerWrapper: { width: '100%' },
  innerWrapperDesktop: { width: '800px', maxWidth: '100%' },

  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 10, color: '#8B1A1A', marginTop: 10 },
  
  mainImage: { width: '100%', height: 280, backgroundColor: '#f0f0f0', borderRadius: 12 },
  mainImageDesktop: { height: 380 },

  row: { flexDirection: 'row', gap: 15, marginTop: 15 },
  col: { flex: 1 },

  subImage: { width: '100%', height: 160, backgroundColor: '#f0f0f0', borderRadius: 12 },
  subImageDesktop: { height: 240 }
});
