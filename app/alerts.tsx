import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function AlertsScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  const materiels = appData?.materiels || [];
  const salles = appData?.salles || [];

  const alerts = useMemo(() => {
    return materiels
      .filter((m: any) => m.etat === 'Endommagé' || m.etat === 'En panne' || m.etat === 'USÉ')
      .map((m: any) => {
        const salle = salles.find((s: any) => s.id === m.roomId);
        return {
          ...m,
          salleNom: salle ? salle.name : 'SALLE INCONNUE',
        };
      })
      .sort((a: any, b: any) => b.id.localeCompare(a.id));
  }, [materiels, salles]);

  const renderAlertItem = ({ item }: { item: any }) => (
    <View style={[styles.alertCard, styles.glow]}>
      <View style={[styles.statusIndicator, { backgroundColor: item.etat === 'En panne' ? '#8B0000' : '#F59E0B' }]} />
      
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <Text style={[styles.itemName, styles.boldSerifItalic]}>{item.nom.toUpperCase()}</Text>
          <Text style={[styles.alertDate, styles.boldSerifItalic]}>{new Date().toLocaleDateString()}</Text>
        </View>
        
        <View style={styles.salleRow}>
          <MapPin size={12} color="#1A237E" />
          <Text style={[styles.salleInfo, styles.boldSerifItalic]}>{item.salleNom.toUpperCase()}</Text>
        </View>

        <View style={styles.badgeContainer}>
          <View style={[styles.stateBadge, { backgroundColor: item.etat === 'En panne' ? '#FFE4E8' : '#FEF3C7' }]}>
            <Text style={[styles.stateText, styles.boldSerifItalic, { color: item.etat === 'En panne' ? '#8B0000' : '#92400E' }]}>
              {item.etat.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.categoryText, styles.boldSerifItalic]}>{item.category?.toUpperCase()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.detailsBtn}
        onPress={() => router.push({ pathname: '/room-profiles', params: { id: item.roomId } })}
      >
        <AlertTriangle size={24} color="#1A237E" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <View style={styles.headerPadding}>
            <View style={[styles.redHeaderPill, styles.glow]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>CENTRE D'ALERTES</Text>
                <View style={styles.badgeCount}>
                    <Text style={[styles.badgeCountText, styles.boldSerifItalic]}>{alerts.length}</Text>
                </View>
            </View>
        </View>

        <View style={styles.content}>
          {alerts.length > 0 ? (
            <FlatList
              data={alerts}
              keyExtractor={(item) => item.id}
              renderItem={renderAlertItem}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <CheckCircle size={80} color="#8B0000" strokeWidth={1.5} />
              <Text style={[styles.emptyText, styles.boldSerifItalic]}>AUCUNE ALERTE CRITIQUE</Text>
              <Text style={[styles.emptySubText, styles.boldSerifItalic]}>LE MATÉRIEL EST OPÉRATIONNEL.</Text>
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

  // STYLE CENTRALISÉ : SERIF + GRAS MAXIMUM
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
  },

  headerPadding: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase' },
  badgeCount: { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  badgeCountText: { color: '#8B0000', fontSize: 14 },
  
  content: { flex: 1 },
  listPadding: { padding: 20, paddingBottom: 40 },
  
  alertCard: { 
    flexDirection: 'row', 
    backgroundColor: 'white', 
    borderRadius: 25, 
    marginBottom: 15, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center'
  },
  statusIndicator: { width: 8, height: '100%' },
  alertContent: { flex: 1, padding: 18 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  itemName: { fontSize: 16, color: '#1A237E', letterSpacing: 1 },
  alertDate: { fontSize: 16, color: '#94A3B8' },
  salleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  salleInfo: { fontSize: 11, color: '#1A237E', textTransform: 'uppercase' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stateText: { fontSize: 14, textTransform: 'uppercase' },
  categoryText: { fontSize: 16, color: '#94A3B8', textTransform: 'uppercase' },
  detailsBtn: { paddingHorizontal: 15 },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { marginTop: 25, fontSize: 16, color: '#1A237E', letterSpacing: 2 },
  emptySubText: { marginTop: 8, color: '#64748B', fontSize: 16, letterSpacing: 1 },

  glow: { 
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, 
    shadowRadius: 10, shadowOffset: { width: 0, height: 5 } 
  }
});
