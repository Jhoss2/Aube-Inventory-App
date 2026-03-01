import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 60) / 4; // Calcul pour 4 colonnes propres

const initialRooms = [
  { id: 1, nom: "Yu", type: "initial", lettre: "Y" },
  { id: 2, nom: "Ujdd", type: "initial", lettre: "U" },
  { id: 3, nom: "Rdfj", type: "initial", lettre: "R" },
  { id: 4, nom: "Gghut", type: "image", image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop" },
  { id: 5, nom: "Salle E", type: "initial", lettre: "E" },
  { id: 6, nom: "Salle F", type: "initial", lettre: "F" },
  { id: 7, nom: "Salle G", type: "initial", lettre: "G" },
  { id: 8, nom: "Salle H", type: "initial", lettre: "H" }
];

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { subId, blocId } = useLocalSearchParams();
  const [rooms] = useState(initialRooms);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* 1. HEADER ROUGE (PILL SHAPE) AVEC RETOUR INTÉGRÉ */}
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>
              {subId || "7U"}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          {/* 2. TITRE DE SECTION */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROFILS DES SALLES</Text>
          </View>

          {/* 3. GRILLE DES SALLES (4 COLONNES) */}
          <View style={styles.grid}>
            {rooms.map((room) => (
              <TouchableOpacity 
                key={room.id} 
                style={styles.roomItem}
                activeOpacity={0.8}
                onPress={() => router.push({ pathname: '/room-details', params: { roomId: room.id, roomName: room.nom } })}
              >
                <View style={styles.avatarContainer}>
                  {room.type === "initial" ? (
                    <View style={styles.initialAvatar}>
                      <Text style={styles.initialText}>{room.lettre}</Text>
                    </View>
                  ) : (
                    <Image 
                      source={{ uri: room.image }} 
                      style={styles.imageAvatar}
                    />
                  )}
                </View>
                <Text style={styles.roomName} numberOfLines={1}>
                  {room.nom}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* 4. FAB (FLOATING ACTION BUTTON) */}
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

  // Header Pill
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 14, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 35,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  backBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontWeight: '900', 
    fontSize: 22, 
    textAlign: 'center',
    letterSpacing: 2
  },

  // Section Title
  sectionHeader: { marginBottom: 25, paddingLeft: 5 },
  sectionTitle: { 
    color: '#000', 
    fontWeight: '900', 
    fontSize: 18, 
    letterSpacing: 0.5 
  },

  // Grid System
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'flex-start',
    marginHorizontal: -5 
  },
  roomItem: { 
    width: COLUMN_WIDTH, 
    alignItems: 'center', 
    marginBottom: 25,
    marginHorizontal: 5
  },
  avatarContainer: { 
    width: '100%', 
    aspectRatio: 1, 
    borderRadius: 26, 
    overflow: 'hidden', 
    elevation: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  initialAvatar: { 
    flex: 1, 
    backgroundColor: '#8B0000', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  initialText: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: '900' 
  },
  imageAvatar: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover' 
  },
  roomName: { 
    marginTop: 8, 
    color: '#000', 
    fontWeight: 'bold', 
    fontSize: 11, 
    textAlign: 'center',
    width: '100%'
  },

  // FAB
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
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10
  }
});
