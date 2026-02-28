import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomName } = useLocalSearchParams(); 
  const context = useAppContext();
  
  // Cast pour éviter les erreurs TS sur les fonctions SQLite non déclarées dans l'interface
  const { getSallesByLevel, deleteSalle } = context as any;
  
  const [salles, setSalles] = useState<any[]>([]);

  // Sécurisation du nom du niveau pour l'affichage
  const displayLevel = Array.isArray(roomName) ? roomName[0] : roomName;

  useEffect(() => {
    loadSalles();
  }, [roomName]);

  const loadSalles = async () => {
    try {
      if (getSallesByLevel) {
        const data = await getSallesByLevel(displayLevel);
        setSalles(data || []);
      }
    } catch (err) {
      console.log("Erreur chargement SQLite:", err);
    }
  };

  const confirmDelete = (id: string, nom: string) => {
    Alert.alert(
      "Suppression",
      `Voulez-vous vraiment supprimer la salle "${nom}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive", 
          onPress: async () => {
            if (deleteSalle) {
              await deleteSalle(id);
              loadSalles();
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>
            {displayLevel ? displayLevel.toUpperCase() : "NIVEAU"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Profils des salles</Text>

        <View style={styles.grid}>
          {salles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucune salle{"\n"}ajoutée</Text>
            </View>
          ) : (
            salles.map((salle: any) => (
              <TouchableOpacity 
                key={salle.id} 
                style={styles.roomCard}
                onPress={() => router.push({ pathname: '/inventory', params: { roomId: salle.id, roomName: salle.nom } })}
                onLongPress={() => confirmDelete(salle.id, salle.nom)}
                delayLongPress={600}
              >
                <Text style={styles.roomNameText}>{salle.nom}</Text>
                <Text style={styles.roomLevelText}>{salle.niveau || displayLevel}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({ pathname: '/add-room', params: { currentLevel: displayLevel } })}
      >
        <Feather name="plus" size={32} color="white" />
      </TouchableOpacity>

      <View style={styles.androidNav}>
        <Ionicons name="chevron-back" size={20} color="#ccc" />
        <View style={styles.navSquare} />
        <View style={styles.navCircle} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  redBadge: { 
    width: '100%', 
    backgroundColor: '#B21F18', 
    paddingVertical: 18, 
    borderRadius: 25, 
    elevation: 8,
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  redBadgeText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: '900', 
    fontSize: 18, 
    letterSpacing: 2
  },
  sectionTitle: { color: '#1D3583', fontWeight: 'bold', fontSize: 18, marginBottom: 20, marginLeft: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  emptyCard: { 
    width: 130, height: 130, 
    backgroundColor: '#E8EBF2', 
    borderRadius: 35, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  emptyText: { color: '#9ca3af', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  roomCard: {
    width: 130, height: 130,
    backgroundColor: 'white',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  roomNameText: { color: '#1D3583', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  roomLevelText: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', marginTop: 5, textTransform: 'uppercase' },
  fab: { 
    position: 'absolute', bottom: 80, right: 25, 
    width: 65, height: 65, borderRadius: 32.5, 
    backgroundColor: '#F44336', 
    justifyContent: 'center', alignItems: 'center', 
    elevation: 10
  },
  androidNav: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', opacity: 0.2 },
  navSquare: { width: 16, height: 16, borderWidth: 2, borderColor: '#9ca3af', borderRadius: 2 },
  navCircle: { width: 16, height: 16, backgroundColor: '#9ca3af', borderRadius: 8 }
});
