import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Box } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const { appData } = useAppContext() as any;

  // Récupération de la salle via le roomId
  const room = (appData.salles || []).find((s: any) => s.id.toString() === roomId);
  const roomName = room?.nom || "Détails";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER ROUGE (PILL SHAPE) : NAV + TITRE SANS BANDEAU BLANC AU-DESSUS */}
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.redHeaderText} numberOfLines={1}>
              DÉTAILS DE {roomName.toUpperCase()}
            </Text>
            
            {/* Spacer pour l'équilibre visuel du titre centré */}
            <View style={{ width: 40 }} /> 
          </View>

          {/* CARTE BLANCHE (DETAILS) */}
          <View style={styles.whiteCard}>
            {/* Capacité */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Capacité :</Text>
              <Text style={styles.infoValue}>{room?.capacity || "N/A"}</Text>
            </View>
            
            {/* Superficie */}
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Superficie :</Text>
              <Text style={styles.infoValue}>{room?.area || "N/A"}</Text>
            </View>

            {/* Encadré Plan 3D */}
            <View style={styles.planBox}>
              <View style={styles.planLeft}>
                <Box size={24} color="#2563EB" />
                <Text style={styles.planText}>Plan 3D / Architecture</Text>
              </View>
              <TouchableOpacity 
                onPress={() => room?.image && router.push({ pathname: '/image-viewer', params: { imageUrl: room.image } })}
              >
                <Text style={styles.planLink}>Voir le plan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOUTONS D'ACTION (BLEU MARINE) */}
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
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' }, // Le fond rose commence dès le haut
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 30 },
  
  // Header Rouge unifié (Bouton Retour + Titre)
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 35,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  redHeaderText: { 
    color: 'white', 
    flex: 1, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    letterSpacing: 1.8, 
    fontSize: 12,
    textTransform: 'uppercase'
  },

  // Carte Blanche
  whiteCard: { 
    backgroundColor: 'white', 
    borderRadius: 35, 
    padding: 25, 
    elevation: 3, 
    borderWidth: 1, 
    borderColor: '#fce7f3' 
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F9FAFB' 
  },
  infoLabel: { color: '#6B7280', fontWeight: 'bold', fontSize: 13 },
  infoValue: { fontWeight: '900', fontSize: 18, color: 'black' },

  // Encadré Plan 3D
  planBox: { 
    marginTop: 20, 
    backgroundColor: '#F8FAFC', 
    borderRadius: 20, 
    padding: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planText: { fontWeight: 'bold', fontStyle: 'italic', fontSize: 13, color: '#374151' },
  planLink: { color: '#2563EB', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 13 },

  // Boutons Bleu Marine
  actionContainer: { marginTop: 40, gap: 18, paddingBottom: 40 },
  actionBtn: { 
    backgroundColor: '#1A237E', 
    paddingVertical: 22, 
    borderRadius: 50, 
    alignItems: 'center', 
    elevation: 4,
    shadowColor: '#1A237E',
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  actionBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    letterSpacing: 2.2, 
    fontSize: 11 
  }
});
