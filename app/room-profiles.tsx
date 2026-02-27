import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function RoomProfilesScreen() {
  const router = useRouter();
  const { categoryTitle, subId } = useLocalSearchParams();

  // Simulation de données (À remplacer par ta future BDD Excel/JSON)
  const rooms = [
    { id: '1', name: `Salle ${subId}-01`, items: 12 },
    { id: '2', name: `Salle ${subId}-02`, items: 8 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#8B1A1A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <TouchableOpacity onPress={() => router.push('/add-room')}><Feather name="plus-circle" size={24} color="#8B1A1A" /></TouchableOpacity>
      </View>

      <FlatList 
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.roomItem}
            onPress={() => router.push({ pathname: '/room-details', params: { roomName: item.name } })}
          >
            <View>
              <Text style={styles.roomName}>{item.name}</Text>
              <Text style={styles.roomItems}>{item.items} objets répertoriés</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#8B1A1A" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  roomItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#f9f9f9', borderRadius: 12, marginBottom: 12 },
  roomName: { fontWeight: 'bold', fontSize: 16 },
  roomItems: { fontSize: 12, color: '#666', marginTop: 4 }
});
