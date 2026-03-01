import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 4; 

const initialRooms = [
  { id: '1', nom: "Yu", type: "initial", lettre: "Y" },
  { id: '2', nom: "Ujdd", type: "initial", lettre: "U" },
  { id: '3', nom: "Rdfj", type: "initial", lettre: "R" },
  { id: '4', nom: "Gghut", type: "image", image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop" },
  { id: '5', nom: "Salle E", type: "initial", lettre: "E" },
  { id: '6', nom: "Salle F", type: "initial", lettre: "F" },
  { id: '7', nom: "Salle G", type: "initial", lettre: "G" },
  { id: '8', nom: "Salle H", type: "initial", lettre: "H" }
];

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { subId, blocId } = useLocalSearchParams<{ subId: string, blocId: string }>();
  const { appData } = useAppContext() as any;

  // FUSION DES DONNÉES : Test + Nouvelles Salles du contexte
  const rooms = useMemo(() => {
    // On récupère les salles créées par l'utilisateur qui correspondent à ce bloc
    const userRooms = (appData.salles || []).filter((s: any) => s.blocId === blocId);
    
    // On transforme les salles utilisateur pour qu'elles aient le format d'affichage (Initiales si pas d'image)
    const formattedUserRooms = userRooms.map((s: any) => ({
      id: s.id,
      nom: s.name,
      type: s.image ? "image" : "initial",
      lettre: s.name.charAt(0).toUpperCase(),
      image: s.image,
      isUserCreated: true // Flag pour identifier les vraies données
    }));

    return [...initialRooms, ...formattedUserRooms];
  }, [appData.salles, blocId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>
              {subId || "PROFIL"}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROFILS DES SALLES</Text>
          </View>

          <View style={styles.grid}>
            {rooms.map((room: any) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.roomItem}
                activeOpacity={0.8}
                onPress={() => router.push({ 
                    pathname: '/room-details', 
                    params: { roomId: room.id, roomName: room.nom } 
                })}
              >
                <View style={styles.avatarContainer}>
                  {room.type === "initial" ? (
                    <View style={styles.initialAvatar}>
                      <Text style={styles.initialText}>{room.lettre}</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: room.image }} style={styles.imageAvatar} />
                  )}
                </View>
                <Text style={styles.roomName} numberOfLines={1}>
                  {room.nom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push({ pathname: '/add-room', params: { blocId, type: 'SALLES' } })}
        >
          <Plus size={32} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 14, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 35,
    elevation: 8
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontWeight: '900', fontSize: 22, textAlign: 'center', letterSpacing: 2 },
  sectionHeader: { marginBottom: 25, paddingLeft: 5 },
  sectionTitle: { color: '#000', fontWeight: '900', fontSize: 18, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginHorizontal: -5 },
  roomItem: { width: COLUMN_WIDTH, alignItems: 'center', marginBottom: 25, marginHorizontal: 5 },
  avatarContainer: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 26, 
    overflow: 'hidden', 
    elevation: 5, 
    backgroundColor: 'white' 
  },
  initialAvatar: { flex: 1, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  initialText: { color: 'white', fontSize: 32, fontWeight: '900' },
  imageAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  roomName: { marginTop: 8, color: '#000', fontWeight: 'bold', fontSize: 11, textAlign: 'center', width: '100%' },
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 25, 
    width: 65, 
    height: 65, 
    backgroundColor: '#DC2626', 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 10 
  }
});
