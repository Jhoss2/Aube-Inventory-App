import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Alert,
  Platform 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string, roomName: string }>();
  const { appData, deleteMateriel } = useAppContext() as any;

  const inventory = (appData.materiels || []).filter((m: any) => String(m.roomId) === String(roomId));

  const handleDelete = (id: string) => {
    Alert.alert("Supprimer", "Voulez-vous vraiment supprimer cet objet ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteMateriel(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ROUGE AVEC LUEUR NOIRE */}
        <View style={[styles.redHeaderPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.boldSerif]} numberOfLines={1}>
            Matériel de {roomName}
          </Text>
          <View style={{ width: 40 }} /> 
        </View>

        {inventory.map((item: any) => (
          <View key={item.id} style={[styles.materialCard, styles.glowBlack]}>
            <View style={styles.imageBox}>
              <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/400' }} 
                style={styles.materialImg} 
              />
            </View>

            <View style={styles.detailsRow}>
              <View style={styles.infoCol}>
                <Text style={[styles.mainTitle, styles.boldSerif]}>{item.nom}</Text>
                
                <View style={styles.infoLine}>
                  <Text style={[styles.labelBlue, styles.boldSerif]}>Marque :</Text> 
                  <Text style={[styles.valueTxt, styles.boldSerif]}>{item.marque || "-"}</Text>
                </View>
                
                <View style={styles.infoLine}>
                  <Text style={[styles.labelBlue, styles.boldSerif]}>Quantité :</Text> 
                  <Text style={[styles.valueTxt, styles.boldSerif]}>{item.quantite}</Text>
                </View>
                
                <View style={styles.infoLine}>
                  <Text style={[styles.labelBlue, styles.boldSerif]}>État :</Text> 
                  <Text style={[styles.statusVal, styles.boldSerif, { color: item.etat.toLowerCase().includes('panne') ? '#8B0000' : '#059669' }]}>
                    {item.etat}
                  </Text>
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
            <Text style={[styles.emptyText, styles.boldSerif]}>Aucun matériel enregistré.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  
  // STYLE CENTRALISÉ : SERIF + GRAS MAXIMUM
  boldSerif: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
  },

  scrollContent: { 
    padding: 25, 
    paddingTop: 55, 
    paddingBottom: 40 
  },
  
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 14, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 35,
  },
  backBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontSize: 14, 
    flex: 1, 
    textAlign: 'center', 
    letterSpacing: 1,
  },

  materialCard: { 
    backgroundColor: 'white', 
    borderRadius: 35, 
    marginBottom: 25, 
    padding: 18, 
    borderWidth: 1.5, 
    borderColor: '#FCE7F3',
  },
  imageBox: { marginBottom: 15 },
  materialImg: { 
    width: '100%', 
    height: 200, 
    borderRadius: 25, 
    backgroundColor: '#F1F5F9' 
  },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5 },
  infoCol: { flex: 1 },
  mainTitle: { 
    color: '#1A237E', 
    fontSize: 17, 
    marginBottom: 10, 
    letterSpacing: 0.5 
  },
  infoLine: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  labelBlue: { color: '#64748B', fontSize: 11, width: 85 },
  valueTxt: { color: '#374151', fontSize: 14 },
  statusVal: { fontSize: 14 },

  actionCol: { justifyContent: 'center', marginLeft: 15, gap: 12 },
  editBtn: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 20 },
  deleteBtn: { backgroundColor: '#FFE4E8', padding: 12, borderRadius: 20 },

  emptyBox: { marginTop: 80, alignItems: 'center' },
  emptyText: { color: '#94A3B8', letterSpacing: 1, fontSize: 13 },

  glowBlack: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  }
});
