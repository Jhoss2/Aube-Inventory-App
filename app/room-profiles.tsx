import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { blocId, niveau } = useLocalSearchParams();
  const { appData } = useAppContext() as any;

  // Filtrage des salles par bloc et niveau
  const salles = (appData.salles || []).filter((s: any) => 
    s.blocId === blocId && s.niveau === niveau
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{niveau}</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={salles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => router.push({ pathname: '/room-details', params: { roomId: item.id } })}
          >
            <Image source={{ uri: item.image }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.nom}</Text>
              <Text style={styles.meta}>{item.capacity} places · {item.area} m²</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucune salle enregistrée.</Text>}
      />

      {/* BOUTON PLUS : Ouvre add-room.tsx */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push({ pathname: '/add-room', params: { blocId, niveau } })}
      >
        <Feather name="plus" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: 'white' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'white', borderRadius: 20, marginBottom: 12, elevation: 2 },
  img: { width: 60, height: 60, borderRadius: 15, marginRight: 15, backgroundColor: '#eee' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1A237E' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 65, height: 65, borderRadius: 35, backgroundColor: '#8B0000', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});
