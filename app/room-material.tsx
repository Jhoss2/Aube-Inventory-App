import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Alert, 
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function RoomMaterialsScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams();
  const { getMaterielBySalle, deleteMateriel } = useAppContext();
  
  const [materiels, setMateriels] = useState([]);

  useEffect(() => {
    loadMaterials();
  }, [roomId]);

  const loadMaterials = async () => {
    try {
      const data = await getMaterielBySalle(roomId);
      setMateriels(data || []);
    } catch (err) {
      console.log("Erreur SQLite:", err);
    }
  };

  const confirmDelete = (id: string, nom: string) => {
    Alert.alert(
      "Supprimer",
      `Voulez-vous retirer "${nom}" de l'inventaire ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: async () => {
            await deleteMateriel(id);
            loadMaterials();
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MATÉRIEL : {roomName || "SALLE"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {materiels.length > 0 ? (
          materiels.map((item: any) => (
            <View key={item.id} style={styles.largeCard}>
              
              {/* IMAGE EN GRAND (Partie Haute de la carte ou Gauche) */}
              <View style={styles.imageContainer}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.fullImage} />
                ) : (
                  <View style={styles.placeholderLarge}>
                    <MaterialCommunityIcons name="camera-off" size={40} color="#d1d5db" />
                    <Text style={styles.noPhotoText}>Aucune photo disponible</Text>
                  </View>
                )}
                {/* Badge d'état flottant sur l'image */}
                <View style={[styles.statusBadge, { backgroundColor: item.etat === 'Mauvais' ? '#EF4444' : '#00C853' }]}>
                  <Text style={styles.statusText}>{item.etat?.toUpperCase() || 'BON'}</Text>
                </View>
              </View>

              {/* CONTENU DE LA CARTE */}
              <View style={styles.cardDetails}>
                <View style={styles.mainInfo}>
                  <View>
                    <Text style={styles.itemTitle}>{item.nom}</Text>
                    <Text style={styles.itemSub}>Marque: {item.marque || 'N/A'} • Qté: {item.quantite}</Text>
                  </View>
                  
                  {/* BOUTONS D'ACTION */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.miniBtn, { backgroundColor: '#EFF6FF' }]}
                      onPress={() => router.push({ pathname: '/edit-material', params: { id: item.id } })}
                    >
                      <Feather name="edit-3" size={18} color="#3B82F6" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.miniBtn, { backgroundColor: '#FEF2F2' }]}
                      onPress={() => confirmDelete(item.id, item.nom)}
                    >
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ZONE COMMENTAIRES / INFOS */}
                {item.commentaires ? (
                  <View style={styles.commentBox}>
                    <Text style={styles.commentLabel}>Notes & Commentaires :</Text>
                    <Text style={styles.commentText}>{item.commentaires}</Text>
                  </View>
                ) : null}

                {/* FOOTER DE LA CARTE (DATES) */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateInfo}>Acquis le: {item.dateAcquisition}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={50} color="#d1d5db" />
            <Text style={styles.emptyLabel}>Inventaire vide pour cette salle</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 15, 
    backgroundColor: 'white', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' 
  },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '900', color: '#1D3583', fontSize: 16 },
  backBtn: { padding: 5 },
  
  scrollContent: { padding: 16, paddingBottom: 40 },

  largeCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },

  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
    position: 'relative'
  },
  fullImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderLarge: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noPhotoText: { color: '#9ca3af', fontSize: 12, fontWeight: 'bold', marginTop: 5 },

  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: { color: 'white', fontWeight: '900', fontSize: 10, letterSpacing: 1 },

  cardDetails: { padding: 16 },
  mainInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { fontSize: 20, fontWeight: '900', color: '#1D3583' },
  itemSub: { fontSize: 13, color: '#6b7280', fontWeight: '700', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 10 },
  miniBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  commentBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#1D3583'
  },
  commentLabel: { fontSize: 10, fontWeight: '900', color: '#1D3583', marginBottom: 4, textTransform: 'uppercase' },
  commentText: { fontSize: 13, color: '#4b5563', lineHeight: 18 },

  cardFooter: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  dateInfo: { fontSize: 11, color: '#9ca3af', fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyLabel: { color: '#d1d5db', fontWeight: 'bold', marginTop: 10, fontSize: 14, textTransform: 'uppercase' }
});
