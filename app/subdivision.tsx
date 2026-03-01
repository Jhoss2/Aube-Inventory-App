import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function SubdivisionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // 'A', 'B', etc.

  const niveaux = [
    "· Sous-sol ·", 
    "· Rez-de-chaussée ·", 
    "· Premier Niveau ·",
    "· Deuxième Niveau ·", 
    "· Troisième Niveau ·", 
    "· Quatrième Niveau ·"
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* HEADER ROUGE AVEC RETOUR INTÉGRÉ */}
        <View style={styles.headerContainer}>
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>BLOC {id}1</Text>
            <View style={{ width: 40 }} /> 
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.subTitleContainer}>
            <Text style={styles.subTitleText}>· NIVEAUX DE SUBDIVISION ·</Text>
          </View>

          <View style={styles.listContainer}>
            {niveaux.map((niveau, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.levelBtn}
                onPress={() => router.push({
                  pathname: '/room-profiles',
                  params: { blocId: id, niveau: niveau }
                })}
              >
                <Text style={styles.levelBtnText}>{niveau}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  headerContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: 'white' },
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 15, 
    paddingHorizontal: 10,
    borderRadius: 50,
    elevation: 4
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontWeight: '900', fontSize: 16, letterSpacing: 3, flex: 1, textAlign: 'center' },
  scrollContent: { paddingTop: 20, paddingBottom: 40 },
  subTitleContainer: { alignItems: 'center', marginBottom: 25 },
  subTitleText: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 2.5 },
  listContainer: { paddingHorizontal: 24, gap: 15 },
  levelBtn: { backgroundColor: '#1A237E', paddingVertical: 18, borderRadius: 50, alignItems: 'center', elevation: 2 },
  levelBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
