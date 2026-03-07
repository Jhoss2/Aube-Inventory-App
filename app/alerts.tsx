import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MapPin, AlertTriangle, CheckCircle, Clock, Calendar } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

// ── Seuil : alerte si renouvellement dans moins de X jours ──────────────────
const SEUIL_JOURS = 30;

type AlertItem = {
  id: string;
  nom: string;
  category?: string;
  etat?: string;
  roomId: string;
  salleNom: string;
  alertType: 'etat' | 'depasse' | 'proche';
  dateRenouvellement?: string;
  joursRestants?: number;
};

export default function AlertsScreen() {
  const router = useRouter();
  const { appData } = useAppContext() as any;

  const materiels = appData?.materiels || [];
  const salles    = appData?.salles    || [];

  const alerts: AlertItem[] = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const result: AlertItem[] = [];

    materiels.forEach((m: any) => {
      const salle    = salles.find((s: any) => String(s.id) === String(m.roomId));
      const salleNom = salle ? salle.name : 'Salle inconnue';

      const etatNorm = (m.etat ?? '').toUpperCase().trim();

      // ── 1. Alerte sur l'état ─────────────────────────────────────────────
      const etatsAlerte = ['ENDOMMAGÉ', 'ENDOMMAGÉ', 'EN PANNE', 'USÉ', 'USE', 'DAMAGED'];
      if (etatsAlerte.includes(etatNorm)) {
        result.push({ ...m, salleNom, alertType: 'etat' });
      }

      // ── 2. Alerte sur la date de renouvellement ──────────────────────────
      if (m.dateRenouvellement) {
        try {
          const dateRenouv = new Date(m.dateRenouvellement);
          dateRenouv.setHours(0, 0, 0, 0);
          const diffMs   = dateRenouv.getTime() - now.getTime();
          const diffJours = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (diffJours < 0) {
            // Date dépassée
            result.push({
              ...m, salleNom,
              alertType: 'depasse',
              joursRestants: diffJours,
            });
          } else if (diffJours <= SEUIL_JOURS) {
            // Date proche (dans les 30 prochains jours)
            result.push({
              ...m, salleNom,
              alertType: 'proche',
              joursRestants: diffJours,
            });
          }
        } catch {}
      }
    });

    // Dédoublonnage : un matériel peut apparaître une seule fois max
    // (on garde la priorité : depasse > etat > proche)
    const seen = new Map<string, AlertItem>();
    const priority = { depasse: 0, etat: 1, proche: 2 };
    result.forEach(item => {
      const existing = seen.get(item.id);
      if (!existing || priority[item.alertType] < priority[existing.alertType]) {
        seen.set(item.id, item);
      }
    });

    return Array.from(seen.values()).sort((a, b) => {
      // Tri : dépassé → état → proche
      return priority[a.alertType] - priority[b.alertType];
    });
  }, [materiels, salles]);

  // ── Couleurs et labels selon le type ─────────────────────────────────────
  const alertConfig = (item: AlertItem) => {
    switch (item.alertType) {
      case 'depasse':
        return {
          barColor:   '#8B0000',
          badgeBg:    '#FFE4E8',
          badgeColor: '#8B0000',
          label:      `⚠️ Renouvellement dépassé de ${Math.abs(item.joursRestants!)} j`,
          icon:       <Calendar size={22} color="#8B0000" />,
        };
      case 'proche':
        return {
          barColor:   '#D97706',
          badgeBg:    '#FEF3C7',
          badgeColor: '#92400E',
          label:      `🕐 Renouvellement dans ${item.joursRestants} j`,
          icon:       <Clock size={22} color="#D97706" />,
        };
      case 'etat':
      default:
        return {
          barColor:   item.etat?.toUpperCase().includes('PANNE') ? '#8B0000' : '#F59E0B',
          badgeBg:    item.etat?.toUpperCase().includes('PANNE') ? '#FFE4E8' : '#FEF3C7',
          badgeColor: item.etat?.toUpperCase().includes('PANNE') ? '#8B0000' : '#92400E',
          label:      (item.etat ?? '').toUpperCase(),
          icon:       <AlertTriangle size={22} color="#1A237E" />,
        };
    }
  };

  const fmtDate = (iso?: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch { return iso; }
  };

  // ── Rendu d'une carte ─────────────────────────────────────────────────────
  const renderAlertItem = ({ item }: { item: AlertItem }) => {
    const cfg = alertConfig(item);
    return (
      <View style={[styles.alertCard, styles.glow]}>
        <View style={[styles.statusIndicator, { backgroundColor: cfg.barColor }]} />

        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={[styles.itemName, styles.SBI]} numberOfLines={1}>
              {(item.nom ?? '').toUpperCase()}
            </Text>
            {item.dateRenouvellement ? (
              <Text style={[styles.alertDate, styles.SBI]}>
                {fmtDate(item.dateRenouvellement)}
              </Text>
            ) : null}
          </View>

          <View style={styles.salleRow}>
            <MapPin size={12} color="#1A237E" />
            <Text style={[styles.salleInfo, styles.SBI]}>
              {(item.salleNom ?? '').toUpperCase()}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            <View style={[styles.stateBadge, { backgroundColor: cfg.badgeBg }]}>
              <Text style={[styles.stateText, styles.SBI, { color: cfg.badgeColor }]}>
                {cfg.label}
              </Text>
            </View>
            {item.category ? (
              <Text style={[styles.categoryText, styles.SBI]}>
                {item.category.toUpperCase()}
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => router.push({ pathname: '/room-contents', params: { roomId: item.roomId, roomName: item.salleNom } })}
        >
          {cfg.icon}
        </TouchableOpacity>
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.headerPadding}>
          <View style={[styles.redHeaderPill, styles.glow]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={[styles.headerTitleText, styles.SBI]}>CENTRE D'ALERTES</Text>
            <View style={styles.badgeCount}>
              <Text style={[styles.badgeCountText, styles.SBI]}>{alerts.length}</Text>
            </View>
          </View>

          {/* Légende */}
          {alerts.length > 0 && (
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
                <Text style={[styles.legendText, styles.SBI]}>Dépassé</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.legendText, styles.SBI]}>État critique</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
                <Text style={[styles.legendText, styles.SBI]}>Proche ({SEUIL_JOURS}j)</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {alerts.length > 0 ? (
            <FlatList
              data={alerts}
              keyExtractor={(item) => `${item.id}-${item.alertType}`}
              renderItem={renderAlertItem}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <CheckCircle size={80} color="#8B0000" strokeWidth={1.5} />
              <Text style={[styles.emptyText, styles.SBI]}>AUCUNE ALERTE CRITIQUE</Text>
              <Text style={[styles.emptySubText, styles.SBI]}>LE MATÉRIEL EST OPÉRATIONNEL.</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },

  SBI: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle:  'italic',
  },

  headerPadding: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 10 },
  redHeaderPill: {
    backgroundColor: '#8B0000',
    paddingVertical: 12, paddingHorizontal: 15,
    borderRadius: 50, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn:        { padding: 5 },
  headerTitleText:{ color: 'white', fontSize: 20, letterSpacing: 2 },
  badgeCount:     { backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 2 },
  badgeCountText: { color: '#8B0000', fontSize: 14 },

  legendRow:  { flexDirection: 'row', gap: 16, marginTop: 12, paddingHorizontal: 4, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#555' },

  content:     { flex: 1 },
  listPadding: { padding: 20, paddingBottom: 40 },

  alertCard: {
    flexDirection: 'row', backgroundColor: 'white',
    borderRadius: 25, marginBottom: 15, overflow: 'hidden',
    borderWidth: 1, borderColor: '#FCE7F3', alignItems: 'center',
  },
  statusIndicator: { width: 8, alignSelf: 'stretch' },
  alertContent:    { flex: 1, padding: 18 },
  alertHeader:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5, gap: 8 },
  itemName:        { fontSize: 15, color: '#1A237E', letterSpacing: 1, flex: 1 },
  alertDate:       { fontSize: 11, color: '#94A3B8' },
  salleRow:        { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  salleInfo:       { fontSize: 11, color: '#1A237E' },
  badgeContainer:  { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  stateBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stateText:       { fontSize: 12 },
  categoryText:    { fontSize: 12, color: '#94A3B8' },
  detailsBtn:      { paddingHorizontal: 15 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText:      { marginTop: 25, fontSize: 16, color: '#1A237E', letterSpacing: 2 },
  emptySubText:   { marginTop: 8, color: '#64748B', fontSize: 16, letterSpacing: 1 },

  glow: {
    elevation: 8, shadowColor: '#000',
    shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
});
                      
