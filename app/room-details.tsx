import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function RoomDetailsScreen() {
  const { roomName } = useLocalSearchParams();
  const router = useRouter();

  const inventory = [
    { id: 1, name: "Table de bureau", qty: 2, status: "Bon" },
    { id: 2, name: "Chaise ergonomique", qty: 2, status: "Usé" },
    { id: 3, name: "Vidéoprojecteur", qty: 1, status: "Neuf" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{roomName}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.tableHeader}>
          <Text style={[styles.col, { flex: 2 }]}>DÉSIGNATION</Text>
          <Text style={styles.col}>QTÉ</Text>
          <Text style={styles.col}>ÉTAT</Text>
        </View>

        {inventory.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}>{item.name}</Text>
            <Text style={styles.cell}>{item.qty}</Text>
            <Text style={[styles.cell, { color: item.status === 'Usé' ? 'orange' : 'green' }]}>{item.status}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-material')}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { backgroundColor: '#1D3583', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
  content: { padding: 15 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8 },
  col: { fontWeight: 'bold', fontSize: 12, color: '#666', textAlign: 'center' },
  tableRow: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center' },
  cell: { fontSize: 13, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#8B1A1A', justifyContent: 'center', alignItems: 'center', elevation: 5 }
});
