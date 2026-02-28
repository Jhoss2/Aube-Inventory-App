import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '@/lib/app-context';

export default function AlertsScreen() {
  const router = useRouter();
  const { materiels, salles } = useAppContext() as any;

  // Filtrage en temps réel des alertes (Matériel endommagé ou en panne)
  const alerts = useMemo(() => {
    return materiels
      .filter((m: any) => m.etat === 'Endommagé' || m.etat === 'En panne')
      .map((m: any) => {
        const salle = salles.find((s: any) => s.id === m.salleId);
        return {
          ...m,
          salleNom: salle ? salle.nom : 'Salle inconnue',
        };
      })
      .sort((a: any, b: any) => b.id - a.id); // Les plus récents en premier
  }, [materiels, salles]);

  const renderAlertItem = ({ item }: { item: any }) => (
    <View style={styles.alertCard}>
      <View style={[styles.statusIndicator, { backgroundColor: item.etat === 'En panne' ? '#B21F18' : '#F59E0B' }]} />
      
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.itemName}>{item.nom}</Text>
          <Text style={styles.alertDate}>{new Date(parseInt(item.id)).toLocaleDateString()}</Text>
        </View>
        
        <Text style={styles.salleInfo}>
          <Feather name="map-pin" size={12} color="#6b7280" /> {item.salleNom}
        </Text>

        <View style={styles.badgeContainer}>
          <View style={[styles.stateBadge, { backgroundColor: item.etat === 'En panne' ? '#FEE2E2' : '#FEF3C7' }]}>
            <Text style={[styles.stateText, { color: item.etat === 'En panne' ? '#B91C1C' : '#92400E' }]}>
              {item.etat.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.categoryText}>{item.categorie}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.detailsBtn}
        onPress={() => router.push({ pathname: '/room-contents', params: { id: item.salleId } })}
      >
        <Ionicons name="arrow-forward-circle" size={30} color="#1D3583" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CENTRE D'ALERTES</Text>
        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>{alerts.length}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {alerts.length > 0 ? (
          <FlatList
            data={alerts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAlertItem}
            contentContainerStyle={styles.listPadding}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="check-circle" size={80} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucune alerte critique</Text>
            <Text style={styles.emptySubText}>Tout votre matériel est opérationnel.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#1D3583', letterSpacing: 1 },
  backBtn: { p: 5 },
  badgeCount: { backgroundColor: '#B21F18', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeCountText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  content: { flex: 1 },
  listPadding: { padding: 20 },
  alertCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 15, 
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    alignItems: 'center'
  },
  statusIndicator: { width: 6, height: '100%' },
  alertContent: { flex: 1, padding: 15 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemName: { fontWeight: 'bold', fontSize: 16, color: '#1f2937' },
  alertDate: { fontSize: 11, color: '#9ca3af' },
  salleInfo: { fontSize: 13, color: '#6b7280', marginBottom: 10 },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  stateText: { fontSize: 10, fontWeight: 'bold' },
  categoryText: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
  detailsBtn: { paddingHorizontal: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { marginTop: 20, fontSize: 18, fontWeight: 'bold', color: '#374151' },
  emptySubText: { marginTop: 8, color: '#9ca3af' }
});
