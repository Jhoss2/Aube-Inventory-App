import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Box } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { appData } = useAppContext() as any;

  const room = (appData.salles || []).find((s: any) => s.id.toString() === roomId);
  const roomName = room?.nom || "Détails";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* HEADER BLANC : Retour et Titre sur la même ligne */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Badge Rouge Statique */}
          <View style={styles.redPill}>
            <Text style={styles.redPillText}>DÉTAILS DE {roomName.toUpperCase()}</Text>
          </View>

          {/* Carte des caractéristiques */}
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacité :</Text>
              <Text style={styles.infoValue}>{room?.capacity || "0"}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Superficie :</Text>
              <Text style={styles.infoValue}>{room?.area || "0"}</Text>
            </View>
            
            <View style={styles.planBox}>
              <View style={styles.planLeft}>
                <Box size={22} color="#2563EB" />
                <Text style={styles.planText}>Plan 3D / Architecture</Text>
              </View>
              <TouchableOpacity onPress={() => room?.image && router.push({ pathname: '/image-viewer', params: { imageUrl: room.image } })}>
                <Text style={styles.planLink}>Voir le plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Boutons d'Action Bleu Marine */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push({ pathname: '/room-contents', params: { roomId, roomName } })}
            >
              <Text style={styles.actionBtnText}>AFFICHER LE MATÉRIEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={() => router.push({ pathname: '/categories', params: { roomId, roomName } })}
            >
              <Text style={styles.actionBtnText}>AJOUTER DU MATÉRIEL</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  headerNav: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15, 
    height: 60, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'black', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 25, paddingTop: 30 },
  redPill: { backgroundColor: '#8B0000', paddingVertical: 15, borderRadius: 50, marginBottom: 25, elevation: 3 },
  redPillText: { color: 'white', textAlign: 'center', fontWeight: 'bold', letterSpacing: 1.5, fontSize: 13 },
  card: { backgroundColor: 'white', borderRadius: 30, padding: 25, elevation: 2, borderWidth: 1, borderColor: '#FCE7F3' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  infoLabel: { color: '#6B7280', fontWeight: 'bold' },
  infoValue: { fontWeight: '900', fontSize: 18 },
  planBox: { marginTop: 25, backgroundColor: '#F8FAFC', borderRadius: 20, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planText: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 13 },
  planLink: { color: '#2563EB', fontWeight: 'bold', textDecorationLine: 'underline' },
  actionContainer: { marginTop: 30, gap: 15 },
  actionBtn: { backgroundColor: '#1A237E', paddingVertical: 20, borderRadius: 50, alignItems: 'center', elevation: 4 },
  actionBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1.5, fontSize: 12 }
});
