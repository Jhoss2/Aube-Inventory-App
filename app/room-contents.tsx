import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil, Trash2, Plus } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string, roomName: string }>();
  const { appData, deleteMateriel } = useAppContext() as any;

  const inventory = (appData.materiels || []).filter((m: any) => m.roomId === roomId);

  const handleDelete = (id: string) => {
    Alert.alert("SUPPRIMER", "Voulez-vous vraiment supprimer cet objet ?", [
      { text: "ANNULER", style: "cancel" },
      { text: "SUPPRIMER", style: "destructive", onPress: () => deleteMateriel(id) }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER ROUGE PILL SHAPE : RETOUR + TITRE */}
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText} numberOfLines={1}>
              MATÉRIEL DE {roomName?.toUpperCase()}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          {inventory.map((item: any) => (
            <View key={item.id} style={styles.materialCard}>
              <View style={styles.imageBox}>
                <Image 
                  source={{ uri: item.image || 'https://via.placeholder.com/400' }} 
                  style={styles.materialImg} 
                />
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.infoCol}>
                  <Text style={styles.mainTitle}>{item.nom.toUpperCase()}</Text>
                  
                  <View style={styles.infoLine}>
                    <Text style={styles.labelBlue}>MARQUE :</Text> 
                    <Text style={styles.valueTxt}>{item.marque || "-"}</Text>
                  </View>
                  
                  <View style={styles.infoLine}>
                    <Text style={styles.labelBlue}>QUANTITÉ :</Text> 
                    <Text style={styles.valueTxt}>{item.quantite}</Text>
                  </View>
                  
                  <View style={styles.infoLine}>
                    <Text style={styles.labelBlue}>ÉTAT :</Text> 
                    <Text style={styles.greenVal}>{item.etat.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity style={styles.editBtn}>
                    <Pencil size={20} color="#1A237E" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={20} color="#8B0000" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {inventory.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>AUCUN MATÉRIEL ENREGISTRÉ.</Text>
            </View>
          )}
        </ScrollView>

        {/* FAB BOUTON AJOUTER (BLEU MARINE) */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push({ pathname: '/categories', params: { roomId, roomName } })}
        >
          <Plus size={32} color="white" strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 30, paddingBottom: 120 },
  
  // Header Rouge Pill
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  backBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 12, 
    flex: 1, 
    textAlign: 'center', 
    letterSpacing: 1.5 
  },

  // Carte Matériel (Design épuré)
  materialCard: { 
    backgroundColor: 'white', 
    borderRadius: 35, 
    marginBottom: 25, 
    elevation: 4, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#FCE7F3' 
  },
  imageBox: { marginBottom: 15 },
  materialImg: { 
    width: '100%', 
    height: 180, 
    borderRadius: 25, 
    backgroundColor: '#F1F5F9' 
  },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  infoCol: { flex: 1 },
  mainTitle: { 
    color: '#1A237E', 
    fontWeight: '900', 
    fontSize: 16, 
    marginBottom: 10, 
    letterSpacing: 1 
  },
  infoLine: { flexDirection: 'row', marginBottom: 4, alignItems: 'center' },
  labelBlue: { color: '#64748B', fontWeight: 'bold', fontSize: 10, width: 75 },
  valueTxt: { color: '#374151', fontWeight: 'bold', fontSize: 13 },
  greenVal: { color: '#059669', fontWeight: '900', fontSize: 13 },

  actionCol: { justifyContent: 'space-around', marginLeft: 10 },
  editBtn: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 20 },
  deleteBtn: { backgroundColor: '#FFE4E8', padding: 12, borderRadius: 20 },

  emptyBox: { marginTop: 60, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontWeight: 'bold', letterSpacing: 1, fontSize: 12 },

  // FAB (Bleu Marine pour contraster avec le fond rose/rouge)
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 65, 
    height: 65, 
    backgroundColor: '#1A237E', 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: '#1A237E',
    shadowOpacity: 0.4,
    shadowRadius: 10
  }
});
