import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function AlertsScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  // Extraction sécurisée des données depuis appData
  const materiels = appData?.materiels || [];
  const salles = appData?.salles || [];

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
      .sort((a: any, b: any) => b.id - a.id);
  }, [materiels, salles]);

  const renderAlertItem = ({ item }: { item: any }) => (
    <View style={styles.alertCard}>
      {/* Barre d'état latérale */}
      <View style={[styles.statusIndicator, { backgroundColor: item.etat === 'En panne' ? '#8B0000' : '#F59E0B' }]} />
      
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={styles.itemName}>{item.nom.toUpperCase()}</Text>
          <Text style={styles.alertDate}>{new Date(parseInt(item.id)).toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.salleRow}>
          <MapPin size={12} color="#64748B" />
          <Text style={styles.salleInfo}>{item.salleNom}</Text>
        </View>

        <View style={styles.badgeContainer}>
          <View style={[styles.stateBadge, { backgroundColor: item.etat === 'En panne' ? '#FFE4E8' : '#FEF3C7' }]}>
            <Text style={[styles.stateText, { color: item.etat === 'En panne' ? '#8B0000' : '#92400E' }]}>
              {item.etat.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.categoryText}>{item.categorie}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.detailsBtn}
        onPress={() => router.push({ pathname: '/room-profiles', params: { id: item.salleId } })}
      >
        <AlertTriangle size={24} color="#1A237E" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        {/* HEADER ROUGE PILL SHAPE */}
        <View style={styles.headerPadding}>
            <View style={styles.redHeaderPill}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitleText}>CENTRE D'ALERTES</Text>
                <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{alerts.length}</Text>
                </View>
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
              <CheckCircle size={80} color="#8B0000" strokeWidth={1} />
              <Text style={styles.emptyText}>AUCUNE ALERTE CRITIQUE</Text>
              <Text style={styles.emptySubText}>Tout votre matériel est opérationnel.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  headerPadding: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    elevation: 6
  },
  backBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontWeight: '900', 
    fontSize: 13, 
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },
  badgeCount: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  badgeCountText: { color: '#8B0000', fontWeight: '900', fontSize: 12 },
  
  content: { flex: 1 },
  listPadding: { padding: 20, paddingBottom: 40 },
  
  alertCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 25, 
    marginBottom: 15, 
    overflow: 'hidden',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center'
  },
  statusIndicator: { width: 6, height: '100%' },
  alertContent: { flex: 1, padding: 18 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemName: { fontWeight: '900', fontSize: 14, color: '#1A237E' },
  alertDate: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8' },
  salleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  salleInfo: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stateBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stateText: { fontSize: 9, fontWeight: '900' },
  categoryText: { fontSize: 11, color: '#94A3B8', fontStyle: 'italic', fontWeight: '600' },
  detailsBtn: { paddingHorizontal: 15 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { marginTop: 20, fontSize: 16, fontWeight: '900', color: '#1A237E', letterSpacing: 1 },
  emptySubText: { marginTop: 8, color: '#64748B', fontSize: 13, fontWeight: '500' }
});
