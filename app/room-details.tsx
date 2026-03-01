import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, Dimensions, SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Box } from 'lucide-react-native'; // Utilisation de la version Native
import { useAppContext } from '@/lib/app-context';

const { width } = Dimensions.get('window');

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { appData } = useAppContext() as any;

  // Récupération des données de la salle via la BDD/Context
  const room = (appData.rooms || []).find((r: any) => r.id.toString() === roomId);

  // Si pas de salle trouvée, on affiche des valeurs par défaut ou "Vzzt" comme dans ton exemple
  const roomName = room?.name || "Vzzt";
  const capacity = room?.capacity || "2695";
  const surface = room?.surface || "52622";
  const planUrl = room?.image; // L'image enregistrée sert de plan

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* BARRE DE NAVIGATION SUPÉRIEURE */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{roomName}</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* 1. BOUTON HEADER ROUGE (PILL SHAPE) - STATIQUE */}
          <View style={styles.redPill}>
            <Text style={styles.redPillText}>DÉTAILS DE {roomName}</Text>
          </View>

          {/* 2. CARTE BLANCHE (CARD) */}
          <View style={styles.card}>
            {/* Capacité */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacité :</Text>
              <Text style={styles.infoValue}>{capacity}</Text>
            </View>
            
            {/* Superficie */}
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Superficie :</Text>
              <Text style={styles.infoValue}>{surface}</Text>
            </View>

            {/* Encadré Plan 3D */}
            <View style={styles.planBox}>
              <View style={styles.planLeft}>
                <Box size={22} color="#2563EB" />
                <Text style={styles.planText}>Plan 3D / Architecture</Text>
              </View>
              <TouchableOpacity onPress={() => planUrl && router.push({ pathname: '/image-viewer', params: { imageUrl: planUrl } })}>
                <Text style={styles.planLink}>Voir le plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. BOUTONS D'ACTION (BLEU MARINE) */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/inventory-list', params: { roomId } })}
            >
              <Text style={styles.actionBtnText}>AFFICHER LE MATÉRIEL</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: '/inventory-form', params: { roomId } })}
            >
              <Text style={styles.actionBtnText}>AJOUTER DU MATÉRIEL</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Barre de navigation Android simulée (Design uniquement) */}
        <View style={styles.androidNav}>
           <View style={styles.navSquare} />
           <View style={styles.navCircle} />
           <ChevronLeft size={20} color="rgba(0,0,0,0.2)" />
        </View>

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
    paddingHorizontal: 15, 
    height: 60, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: { padding: 5 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: 'black' },
  scrollContent: { paddingHorizontal: 25, paddingVertical: 30 },
  
  redPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 15, 
    borderRadius: 50, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 25
  },
  redPillText: { color: 'white', textAlign: 'center', fontWeight: 'bold', letterSpacing: 1.5, fontSize: 13 },

  card: { 
    backgroundColor: 'white', 
    borderRadius: 30, 
    padding: 25, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#FCE7F3'
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F9FAFB' 
  },
  infoLabel: { color: '#6B7280', fontWeight: 'bold', fontSize: 14 },
  infoValue: { color: 'black', fontWeight: '900', fontSize: 18 },

  planBox: { 
    marginTop: 25, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    padding: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  planText: { color: '#374151', fontWeight: 'bold', fontSize: 13, fontStyle: 'italic' },
  planLink: { color: '#2563EB', fontWeight: 'bold', fontSize: 13, textDecorationLine: 'underline' },

  actionContainer: { marginTop: 30, gap: 15 },
  actionBtn: { 
    backgroundColor: '#1A237E', 
    paddingVertical: 20, 
    borderRadius: 50, 
    alignItems: 'center', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6
  },
  actionBtnText: { color: 'white', fontWeight: 'bold', letterSpacing: 1.5, fontSize: 12 },

  androidNav: { 
    height: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center',
    paddingBottom: 10
  },
  navSquare: { width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(0,0,0,0.2)', borderRadius: 2 },
  navCircle: { width: 18, height: 18, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10 }
});
