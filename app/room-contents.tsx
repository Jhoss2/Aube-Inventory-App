import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react-native';
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
    <View style={styles.container}>
      {/* Fond rose total dès le haut de l'écran */}
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ROUGE AVEC LUEUR NOIRE */}
        <View style={[styles.redHeaderPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            MATÉRIEL DE {roomName?.toUpperCase()}
          </Text>
          <View style={{ width: 40 }} /> 
        </View>

        {inventory.map((item: any) => (
          /* ON GARDE LA CARTE BLANCHE POUR CHAQUE OBJET */
          <View key={item.id} style={[styles.materialCard, styles.glowBlack]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { 
    padding: 25, 
    paddingTop: 55, // Espace pour la barre d'état sans SafeArea
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
    fontWeight: '900', 
    fontSize: 13, 
    flex: 1, 
    textAlign: 'center', 
    letterSpacing: 2,
    textTransform: 'uppercase'
  },

  // Carte Individuelle (Conservée)
  materialCard: { 
    backgroundColor: 'white', 
    borderRadius: 30, 
    marginBottom: 25, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#FCE7F3',
  },
  imageBox: { marginBottom: 15 },
  materialImg: { 
    width: '100%', 
    height: 200, 
    borderRadius: 22, 
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
  infoLine: { flexDirection: 'row', marginBottom: 6, alignItems: 'center' },
  labelBlue: { color: '#64748B', fontWeight: 'bold', fontSize: 10, width: 85 },
  valueTxt: { color: '#374151', fontWeight: 'bold', fontSize: 14 },
  greenVal: { color: '#059669', fontWeight: '900', fontSize: 14 },

  actionCol: { justifyContent: 'space-around', marginLeft: 15, gap: 10 },
  editBtn: { backgroundColor: '#F1F5F9', padding: 12, borderRadius: 18 },
  deleteBtn: { backgroundColor: '#FFE4E8', padding: 12, borderRadius: 18 },

  emptyBox: { marginTop: 80, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },

  // Lueur Noire
  glowBlack: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  }
});
