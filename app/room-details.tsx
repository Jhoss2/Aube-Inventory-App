import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { roomName } = useLocalSearchParams(); // Récupère le niveau (ex: Sous-sol)
  
  // Simulation d'une liste de salles (vide par défaut selon ton code)
  const [salles, setSalles] = useState([]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#4b5563" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Badge Rouge central "NIVEAU" */}
        <View style={styles.redBadge}>
          <Text style={styles.redBadgeText}>
            {roomName ? roomName.toUpperCase() : "SOUS-SOL"}
          </Text>
        </View>

        {/* Titre de la section */}
        <Text style={styles.sectionTitle}>Profils des salles</Text>

        {/* Grille des salles */}
        <View style={styles.grid}>
          {salles.length === 0 ? (
            /* Carré gris "Aucune salle ajoutée" */
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Aucune salle{"\n"}ajoutée
              </Text>
            </View>
          ) : (
            /* Affichage des salles si présentes */
            salles.map((salle: any) => (
              <TouchableOpacity 
                key={salle.id} 
                style={styles.roomCard}
                onPress={() => router.push({ pathname: '/inventory', params: { roomId: salle.id } })}
              >
                <Text style={styles.roomNameText}>{salle.nom}</Text>
                <Text style={styles.roomLevelText}>{salle.niveau}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bouton d'action flottant (+) en bas à droite */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/add-room')}
      >
        <Feather name="plus" size={32} color="white" />
      </TouchableOpacity>

      {/* Barre de navigation Android simulée */}
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
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6' 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  
  // Badge Rouge
  redBadge: { 
    width: '100%', 
    backgroundColor: '#B21F18', 
    paddingVertical: 16, 
    borderRadius: 25, 
    elevation: 10,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  redBadgeText: { 
    color: 'white', 
    textAlign: 'center', 
    fontWeight: '900', 
    fontSize: 18, 
    letterSpacing: 2,
    fontFamily: 'serif' 
  },

  sectionTitle: { 
    color: '#1D3583', 
    fontBold: 'bold', 
    fontWeight: 'bold',
    fontSize: 18, 
    marginBottom: 20,
    marginLeft: 4
  },

  // Grille et Cartes
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  emptyCard: { 
    width: 128, 
    height: 128, 
    backgroundColor: '#E8EBF2', 
    borderRadius: 30, // Pour l'effet "rounded-3xl"
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  emptyText: { 
    color: '#9ca3af', 
    fontSize: 12, 
    textAlign: 'center', 
    fontWeight: '500',
    lineHeight: 16
  },
  roomCard: {
    width: 128,
    height: 128,
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  roomNameText: { color: '#1D3583', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  roomLevelText: { color: '#9ca3af', fontSize: 10, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },

  // Floating Action Button
  fab: { 
    position: 'absolute', 
    bottom: 80, 
    right: 24, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#F44336', 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 12,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 20
  },

  // Android Nav
  androidNav: {
    height: 48,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f9fafb',
    opacity: 0.2
  },
  navSquare: { width: 16, height: 16, borderWidth: 2, borderColor: '#9ca3af', borderRadius: 2 },
  navCircle: { width: 16, height: 16, backgroundColor: '#9ca3af', borderRadius: 8 }
});
