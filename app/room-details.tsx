import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Box } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { appData } = useAppContext() as any;

  // Récupération de la salle (nom de propriété 'name' pour matcher add-room)
  const room = (appData.salles || []).find((s: any) => s.id.toString() === roomId);
  const roomName = room?.name || "DÉTAILS";

  return (
    <View style={styles.container}>
      {/* Barre d'état translucide pour que le rose monte tout en haut */}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ROUGE PILL - AVEC LUEUR */}
        <View style={styles.redHeaderPill}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.redHeaderText} numberOfLines={1}>
            {roomName.toUpperCase()}
          </Text>
          
          <View style={{ width: 40 }} /> 
        </View>

        {/* INFOS SECTION - AVEC LUEUR SUR LES PILLULES */}
        <View style={styles.infoSection}>
          <View style={[styles.infoRow, styles.glowEffect]}>
            <Text style={styles.infoLabel}>CAPACITÉ :</Text>
            <Text style={styles.infoValue}>{room?.capacity || "N/A"}</Text>
          </View>
          
          <View style={[styles.infoRow, styles.glowEffect]}>
            <Text style={styles.infoLabel}>SUPERFICIE :</Text>
            <Text style={styles.infoValue}>{room?.surface || "N/A"} m²</Text>
          </View>

          <View style={[styles.infoRow, styles.glowEffect]}>
            <Text style={styles.infoLabel}>EMPLACEMENT :</Text>
            <Text style={styles.infoValue}>{room?.location || "N/A"}</Text>
          </View>

          {/* SECTION PLAN 3D - AVEC LUEUR */}
          <TouchableOpacity 
            style={[styles.planBox, styles.glowEffect]}
            onPress={() => room?.image && router.push({ pathname: '/fullscreen-view', params: { imageUri: room.image } })}
          >
            <Box size={24} color="#1A237E" />
            <Text style={styles.planText}>VOIR LE PLAN 3D / ARCHI</Text>
          </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { 
    padding: 25, 
    paddingTop: 55, // Padding pour compenser l'absence de SafeAreaView
    paddingBottom: 40 
  },
  
  // Header Rouge Pill
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 40,
    // Lueur noire sur le header
    elevation: 8, 
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  redHeaderText: { 
    color: 'white', flex: 1, textAlign: 'center', fontWeight: '900', 
    letterSpacing: 2, fontSize: 13, textTransform: 'uppercase' 
  },

  // Section Infos Flottantes
  infoSection: { width: '100%', gap: 12 },
  infoRow: { 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  infoLabel: { color: '#1A237E', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  infoValue: { fontWeight: 'bold', fontSize: 16, color: 'black' },

  // Encadré Plan 3D
  planBox: { 
    marginTop: 15, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    borderRadius: 25, 
    padding: 20, 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#1A237E',
    
  },
  planText: { fontWeight: '900', fontSize: 11, color: '#1A237E', letterSpacing: 1 },

  // Effet de Lueur Noire (Glow)
  glowEffect: {
    elevation: 6, // Plus faible pour les petites pilules
    shadowColor: '#000',
    shadowOpacity: 0.2, // Lueur noire subtile
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },

  // Boutons Bleu Marine
  actionContainer: { marginTop: 45, gap: 20 },
  actionBtn: { 
    backgroundColor: '#1A237E', 
    paddingVertical: 22, 
    borderRadius: 50, 
    alignItems: 'center', 
    // Lueur bleue pour les boutons (shadowColor hérité)
    elevation: 5,
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  actionBtnText: { 
    color: 'white', 
    fontWeight: '900', 
    letterSpacing: 2.5, 
    fontSize: 12 
  }
});
