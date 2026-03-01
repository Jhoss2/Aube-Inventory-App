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
  Dimensions,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 4; 

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { blockId, type, level } = useLocalSearchParams<{ blockId: string, type: string, level: string }>();
  const { appData, setAppData } = useAppContext() as any;

  // FILTRAGE : Uniquement les salles qui correspondent au bloc, au type et au niveau
  const rooms = useMemo(() => {
    return (appData.salles || []).filter((s: any) => 
      s.blockId === blockId && 
      s.type === type && 
      s.level === level
    );
  }, [appData.salles, blockId, type, level]);

  // FONCTION DE SUPPRESSION AVEC CONFIRMATION
  const handleDeleteRoom = (id: string, name: string) => {
    Alert.alert(
      "Supprimer la salle",
      `Êtes-vous sûr de vouloir supprimer "${name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: () => {
            const updatedSalles = appData.salles.filter((s: any) => s.id !== id);
            setAppData({ ...appData, salles: updatedSalles });
          } 
        }
      ]
    );
  };

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
              {level ? level.toUpperCase() : "PROFIL"}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROFILS DES {type === 'salles' ? 'SALLES' : 'BUREAUX'}</Text>
          </View>

          <View style={styles.grid}>
            {rooms.map((room: any) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.roomItem}
                activeOpacity={0.8}
                onPress={() => router.push({ 
                    pathname: '/room-details', 
                    params: { roomId: room.id, roomName: room.name } 
                })}
                onLongPress={() => handleDeleteRoom(room.id, room.name)} // APPUI LONG
              >
                <View style={styles.avatarContainer}>
                  {room.image ? (
                    <Image source={{ uri: room.image }} style={styles.imageAvatar} />
                  ) : (
                    <View style={styles.initialAvatar}>
                      <Text style={styles.initialText}>{room.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.roomName} numberOfLines={1}>
                  {room.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push({ 
            pathname: '/add-room', 
            params: { blockId, type, level } 
          })}
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
  headerTitleText: { color: 'white', fontWeight: '900', fontSize: 18, textAlign: 'center', letterSpacing: 2 },
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
