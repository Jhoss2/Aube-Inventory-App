import React, { useMemo } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Image, 
  StyleSheet, SafeAreaView, StatusBar, Dimensions, Alert, Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 40 - 30) / 4; 

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { blockId, type, level } = useLocalSearchParams<{ blockId: string, type: string, level: string }>();
  const { appData, setAppData } = useAppContext() as any;

  const rooms = useMemo(() => {
    return (appData.salles || []).filter((s: any) => 
      String(s.blockId) === String(blockId) && 
      String(s.type) === String(type) && 
      String(s.level || "").trim().toLowerCase() === String(level || "").trim().toLowerCase()
    );
  }, [appData.salles, blockId, type, level]);

  const handleDeleteRoom = (id: string, name: string) => {
    Alert.alert(
      "Suppression",
      `Voulez-vous supprimer "${name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => {
          const updatedSalles = appData.salles.filter((s: any) => s.id !== id);
          setAppData({ ...appData, salles: updatedSalles });
        }}
      ]
    );
  };

  // CASSE NORMALE : Majuscule au début, reste en minuscule
  const formatText = (txt: string) => {
    if (!txt) return "";
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* PILULE ROUGE AVEC LUEUR NOIRE */}
          <View style={[styles.redHeaderPill, styles.blackGlow]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>
              {(level || "Profil").toUpperCase()}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.boldSerifItalic]}>
              {formatText(`Profils des ${type === 'salles' ? 'salles' : 'bureaux'}`)}
            </Text>
          </View>

          <View style={styles.grid}>
            {rooms.map((room: any) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.roomItem}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/room-details', params: { roomId: room.id } })}
                onLongPress={() => handleDeleteRoom(room.id, room.name)}
              >
                {/* ICONE AVEC LUEUR NOIRE ET ARRONDI 35 */}
                <View style={[styles.avatarContainer, styles.blackGlow]}>
                  {room.image ? (
                    <Image source={{ uri: room.image }} style={styles.imageAvatar} />
                  ) : (
                    <View style={styles.initialAvatar}>
                      <Text style={[styles.initialText, styles.boldSerifItalic]}>
                        {room.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.roomName, styles.boldSerifItalic]} numberOfLines={1}>
                  {formatText(room.name)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity 
          style={[styles.fab, styles.blackGlow]}
          onPress={() => router.push({ 
            pathname: '/add-room', 
            params: { blocId: blockId, type: type, level: level } 
          })}
        >
          <Plus size={32} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900', fontStyle: 'italic',
  },
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 100 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', paddingVertical: 14, paddingHorizontal: 15, 
    borderRadius: 50, flexDirection: 'row', alignItems: 'center', 
    justifyContent: 'space-between', marginBottom: 35,
  },
  // LUEUR NOIRE (BLACK GLOW)
  blackGlow: {
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 }
  },
  headerTitleText: { color: 'white', fontSize: 16, textAlign: 'center', letterSpacing: 2 },
  sectionTitle: { color: '#000', fontSize: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  roomItem: { width: COLUMN_WIDTH, alignItems: 'center', marginBottom: 20, marginHorizontal: 5 },
  avatarContainer: { 
    width: '100%', aspectRatio: 1, borderRadius: 35, 
    overflow: 'hidden', backgroundColor: 'white' 
  },
  initialAvatar: { flex: 1, backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  initialText: { color: 'white', fontSize: 24 },
  imageAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  roomName: { marginTop: 8, color: '#000', fontSize: 11, textAlign: 'center' },
  fab: { 
    position: 'absolute', bottom: 30, right: 25, width: 65, height: 65, 
    backgroundColor: '#DC2626', borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', 
  },
  backBtn: { padding: 5 },
  sectionHeader: { marginBottom: 25, paddingLeft: 5 }
});
