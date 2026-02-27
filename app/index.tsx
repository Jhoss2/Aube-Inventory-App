import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  // Liste des Blocs de l'Université
  const blocks = [
    { id: 'A', name: 'Bloc A', desc: 'Administration & Bureaux', icon: 'business' },
    { id: 'B', name: 'Bloc B', desc: 'Amphithéâtres & Cours', icon: 'school' },
    { id: 'C', name: 'Bloc C', desc: 'Laboratoires & TP', icon: 'flask' },
    { id: 'E', name: 'Bloc E', desc: 'Salles de cours', icon: 'book' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      
      {/* Header Accueil Stabilisé */}
      <View style={styles.header}>
        <View>
          <Text style={styles.universityName}>U-AUBEN TRACKER</Text>
          <Text style={styles.subtitle}>Gestionnaire de Matériel</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/screens/chat-aube')}
          style={styles.chatButton}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Résumé Statistique (Optionnel) */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>ÉTAT GLOBAL</Text>
          <View className="flex-row justify-between mt-2">
             <Text className="text-white font-bold">128 Salles</Text>
             <Text className="text-white font-bold">1,450 Articles</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>PARCOURIR PAR BLOC</Text>

        {/* Grille des Blocs */}
        <View style={styles.grid}>
          {blocks.map((block) => (
            <TouchableOpacity 
              key={block.id}
              style={styles.blockCard}
              onPress={() => router.push({ pathname: '/screens/room-contents', params: { blockId: block.id } })}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={block.icon as any} size={30} color="#1D3583" />
              </View>
              <Text style={styles.blockName}>{block.name}</Text>
              <Text style={styles.blockDesc}>{block.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Bouton Flottant d'Ajout (Fixe en bas) */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/screens/add-room')}
      >
        <Ionicons name="add" size={30} color="white" />
        <Text style={styles.fabText}>NOUVELLE SALLE</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#B21F18',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  universityName: { color: 'white', fontWeight: '900', fontSize: 20 },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', fontSize: 12 },
  chatButton: { backgroundColor: '#1D3583', p: 10, borderRadius: 15, padding: 10 },
  container: { padding: 20, paddingBottom: 100 },
  statsCard: { backgroundColor: '#1D3583', padding: 20, borderRadius: 20, marginBottom: 25 },
  statsTitle: { color: 'white', opacity: 0.6, fontSize: 10, fontWeight: '900' },
  sectionTitle: { color: '#1D3583', fontWeight: '900', fontSize: 14, marginBottom: 15, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  blockCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: { backgroundColor: '#F1F5F9', width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  blockName: { fontWeight: '900', fontSize: 16, color: '#1D3583' },
  blockDesc: { fontSize: 10, color: '#64748B', marginTop: 4, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#1D3583',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50,
    elevation: 10,
    shadowColor: '#1D3583',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: { color: 'white', fontWeight: '900', marginLeft: 10, fontSize: 14 }
});
