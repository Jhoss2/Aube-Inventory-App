import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  StatusBar,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Box } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { appData } = useAppContext() as any;

  // Récupération de la salle
  const room = (appData.salles || []).find((s: any) => s.id.toString() === roomId);
  const roomName = room?.name || "Détails";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ROUGE PILL - AVEC LUEUR NOIRE */}
        <View style={[styles.redHeaderPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          
          <Text style={[styles.redHeaderText, styles.boldSerifItalic]} numberOfLines={1}>
            {roomName}
          </Text>
          
          <View style={{ width: 40 }} /> 
        </View>

        {/* INFOS SECTION - STYLE INSTITUTIONNEL */}
        <View style={styles.infoSection}>
          <View style={[styles.infoRow, styles.glowSmall]}>
            <Text style={[styles.infoLabel, styles.boldSerifItalic]}>Capacité :</Text>
            <Text style={[styles.infoValue, styles.boldSerifItalic]}>{room?.capacity || "N/A"}</Text>
          </View>
          
          <View style={[styles.infoRow, styles.glowSmall]}>
            <Text style={[styles.infoLabel, styles.boldSerifItalic]}>Superficie :</Text>
            <Text style={[styles.infoValue, styles.boldSerifItalic]}>{room?.surface || "N/A"} m²</Text>
          </View>

          <View style={[styles.infoRow, styles.glowSmall]}>
            <Text style={[styles.infoLabel, styles.boldSerifItalic]}>Emplacement :</Text>
            <Text style={[styles.infoValue, styles.boldSerifItalic]}>{room?.location || "N/A"}</Text>
          </View>

          {/* SECTION PLAN 3D */}
          <TouchableOpacity 
            style={[styles.planBox, styles.glowSmall]}
            onPress={() => room?.image && router.push({ pathname: '/fullscreen-view', params: { imageUri: room.image } })}
          >
            <Box size={24} color="#1A237E" />
            <Text style={[styles.planText, styles.boldSerifItalic]}>Voir l'image</Text>
          </TouchableOpacity>
        </View>

        {/* BOUTONS D'ACTION (BLEU MARINE) */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.glowSmall]} 
            onPress={() => router.push({ pathname: '/room-contents', params: { roomId, roomName } })}
          >
            <Text style={[styles.actionBtnText, styles.boldSerifItalic]}>Afficher le matériel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.glowSmall]} 
            onPress={() => router.push({ pathname: '/categories', params: { roomId, roomName } })}
          >
            <Text style={[styles.actionBtnText, styles.boldSerifItalic]}>Ajouter du matériel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  
  // STYLE CENTRALISÉ : SERIF + GRAS MAXIMUM
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },

  scrollContent: { 
    padding: 25, 
    paddingTop: 55, 
    paddingBottom: 40 
  },
  
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  redHeaderText: { 
    color: 'white', 
    flex: 1, 
    textAlign: 'center', 
    fontSize: 20, 
    letterSpacing: 1 
  },

  infoSection: { width: '100%', gap: 14 },
  infoRow: { 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FCE7F3',
  },
  infoLabel: { color: '#1A237E', fontSize: 11, letterSpacing: 0.5 },
  infoValue: { fontSize: 16, color: 'black' },

  planBox: { 
    marginTop: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
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
  planText: { fontSize: 16, color: '#1A237E', letterSpacing: 0.5 },

  actionContainer: { marginTop: 45, gap: 20 },
  actionBtn: { 
    backgroundColor: '#1A237E', 
    paddingVertical: 22, 
    borderRadius: 50, 
    alignItems: 'center', 
  },
  actionBtnText: { 
    color: 'white', 
    letterSpacing: 1.5, 
    fontSize: 16 
  },

  // LUEURS
  glowBlack: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }
  },
  glowSmall: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  }
});
                                        
