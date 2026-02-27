import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const { appData, deleteMateriel } = useAppContext();

  const materiels = useMemo(() => {
    return appData.materiels.filter((item) => item.salleId === salleId);
  }, [appData.materiels, salleId]);

  const roomName = useMemo(() => {
    return appData.salles.find(s => s.id === salleId)?.nom || "la Salle";
  }, [appData.salles, salleId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* HEADER FIXE ET STABILISÉ */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          MATÉRIEL : {roomName}
        </Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {materiels.length > 0 ? (
          materiels.map((item) => (
            <View key={item.id} style={styles.card}>
              
              {/* Image du Matériel */}
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <MaterialCommunityIcons name="image-off" size={48} color="#CBD5E1" />
                    <Text style={styles.placeholderText}>Aucune photo</Text>
                  </View>
                )}
                
                <View style={styles.statusBadge}>
                  <Text style={[styles.statusText, { color: item.etat === 'Bon' ? '#16A34A' : '#F59E0B' }]}>
                    {item.etat.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Corps de la Carte */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.nom}</Text>
                    <Text style={styles.itemBrand}>{item.marque || 'MARQUE NON SPÉCIFIÉE'}</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
                      <Ionicons name="pencil" size={18} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => deleteMateriel(item.id)}
                    >
                      <Ionicons name="trash" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Détails Techniques */}
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>QUANTITÉ</Text>
                    <Text style={styles.detailValue}>{item.quantite}</Text>
                  </View>
                  <View style={[styles.detailItem, styles.detailBorder]}>
                    <Text style={styles.detailLabel}>ACQUISITION</Text>
                    <Text style={styles.detailSmallValue}>{item.dateAcquisition}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>RENOUVELLEMENT</Text>
                    <Text style={[styles.detailSmallValue, { color: '#EF4444' }]}>{item.dateRenouvellement}</Text>
                  </View>
                </View>

                {/* Zone Commentaires */}
                <View style={styles.commentBox}>
                  <Text style={styles.commentLabel}>COMMENTAIRES :</Text>
                  <Text style={styles.commentText}>
                    {item.commentaires || "Aucune note supplémentaire."}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#E2E8F0" />
            <Text style={styles.emptyText}>Aucun matériel enregistré dans cette salle.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FB' },
  fixedHeader: {
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: { padding: 10 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#1D3583',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  card: {
    backgroundColor: 'white',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  imageContainer: { width: '100%', height: 200, backgroundColor: '#F1F5F9' },
  itemImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#94A3B8', fontWeight: 'bold', marginTop: 8 },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    elevation: 3,
  },
  statusText: { fontSize: 10, fontWeight: '900' },
  cardBody: { padding: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemName: { fontSize: 22, fontWeight: '900', color: '#1D3583', letterSpacing: -0.5 },
  itemBrand: { fontSize: 11, color: '#94A3B8', fontWeight: '900', marginTop: 2 },
  actionButtons: { flexDirection: 'row' },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  editBtn: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE' },
  deleteBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  detailsRow: { 
    flexDirection: 'row', 
    borderTopWidth: 1, 
    borderBottomWidth: 1, 
    borderColor: '#F8FAFC', 
    paddingVertical: 15, 
    marginVertical: 15 
  },
  detailItem: { flex: 1, alignItems: 'center' },
  detailBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#F1F5F9' },
  detailLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '900', marginBottom: 5 },
  detailValue: { fontSize: 18, fontWeight: '900', color: '#1D3583' },
  detailSmallValue: { fontSize: 12, fontWeight: '900', color: '#475569' },
  commentBox: { backgroundColor: '#F8F9FB', padding: 15, borderRadius: 15 },
  commentLabel: { fontSize: 9, color: '#94A3B8', fontWeight: '900', marginBottom: 5 },
  commentText: { fontSize: 13, color: '#475569', fontStyle: 'italic', lineHeight: 18 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#94A3B8', fontWeight: 'bold', marginTop: 20, textAlign: 'center' }
});

