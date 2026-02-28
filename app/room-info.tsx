import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function RoomInfoScreen() {
  const router = useRouter();
  // On récupère les infos de la salle cliquée
  const { roomName, capacity, area, roomId } = useLocalSearchParams();

  // Sécurisation du nom pour l'affichage en majuscules
  const displayName = Array.isArray(roomName) ? roomName[0] : roomName;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* BARRE DE NAVIGATION SUPÉRIEURE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName || "Détails"}</Text>
        <View style={{ width: 40 }} /> {/* Spacer pour centrer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. BOUTON HEADER ROUGE (PILL SHAPE) */}
        <View style={styles.redPill}>
          <Text style={styles.redPillText}>
            DÉTAILS DE {displayName ? displayName.toUpperCase() : "LA SALLE"}
          </Text>
        </View>

        {/* 2. CARTE BLANCHE (CARD) */}
        <View style={styles.whiteCard}>
          {/* Capacité */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Capacité :</Text>
            <Text style={styles.infoValue}>{capacity || "N/A"}</Text>
          </View>
          
          {/* Superficie */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Superficie :</Text>
            <Text style={styles.infoValue}>{area || "N/A"}</Text>
          </View>

          {/* Encadré Plan 3D */}
          <View style={styles.planBox}>
            <View style={styles.planLeft}>
              <Feather name="box" size={24} color="#2563EB" />
              <Text style={styles.planText}>Plan 3D / Architecture</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.planLink}>Voir le plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. BOUTONS D'ACTION (BLEU MARINE) */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/room-materials', params: { roomId, roomName: displayName } })}
          >
            <Text style={styles.actionBtnText}>AFFICHER LE MATÉRIEL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/add-material', params: { roomId, roomName: displayName } })}
          >
            <Text style={styles.actionBtnText}>AJOUTER DU MATÉRIEL</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Barre Android Nav Simulation */}
      <View style={styles.androidNav}>
        <View style={styles.navSquare} />
        <View style={styles.navCircle} />
        <Ionicons name="chevron-back" size={20} color="black" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 50, 
    paddingBottom: 15, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'black' },
  
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingVertical: 32 
  },

  redPill: { 
    width: '100%', 
    backgroundColor: '#8B0000', 
    paddingVertical: 16, 
    borderRadius: 50, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 25
  },
  redPillText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    letterSpacing: 1.5,
    fontSize: 14 
  },

  whiteCard: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#fce7f3'
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f9fafb' 
  },
  infoLabel: { color: '#6b7280', fontWeight: 'bold', fontSize: 14 },
  infoValue: { color: 'black', fontWeight: '900', fontSize: 18 },

  planBox: {
    marginTop: 25,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planText: { color: '#374151', fontStyle: 'italic', fontWeight: 'bold', fontSize: 13 },
  planLink: { color: '#2563EB', fontWeight: 'bold', fontSize: 13, textDecorationLine: 'underline' },

  actionContainer: { marginTop: 30, gap: 15 },
  actionBtn: {
    width: '100%',
    backgroundColor: '#1A237E',
    paddingVertical: 20,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#1A237E',
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  actionBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 12, 
    letterSpacing: 1.5, 
    textTransform: 'uppercase' 
  },

  androidNav: { 
    height: 48, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    opacity: 0.2,
    marginBottom: 5
  },
  navSquare: { width: 16, height: 16, borderWidth: 2, borderColor: 'black', borderRadius: 2 },
  navCircle: { width: 18, height: 18, backgroundColor: 'black', borderRadius: 9 }
});
