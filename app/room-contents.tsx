import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams();
  const { appData, deleteMateriel } = useAppContext() as any;

  const inventory = (appData.materiels || []).filter((m: any) => m.roomId === roomId);

  const handleDelete = (id: string) => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteMateriel(id) }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* HEADER ROUGE : Retour et Titre intégrés */}
        <View style={styles.headerWrapper}>
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText} numberOfLines={1}>Matériel de {roomName}</Text>
            <View style={{ width: 44 }} /> 
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                  <Text style={styles.txt}><Text style={styles.labelBlue}>Nom :</Text> {item.nom}</Text>
                  <Text style={styles.txt}><Text style={styles.labelBlue}>Marque :</Text> {item.marque || "-"}</Text>
                  <Text style={styles.txt}><Text style={styles.labelBlue}>Quantité :</Text> {item.quantite}</Text>
                  <Text style={styles.txt}><Text style={styles.labelBlue}>Etat :</Text> <Text style={styles.greenVal}>{item.etat}</Text></Text>
                </View>

                <View style={styles.actionCol}>
                  <TouchableOpacity style={styles.editBtn}>
                    <Pencil size={22} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Trash2 size={22} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {inventory.length === 0 && (
            <Text style={styles.emptyText}>Aucun matériel enregistré.</Text>
          )}
        </ScrollView>

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
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: 'white' },
  headerWrapper: { paddingVertical: 10, alignItems: 'center' },
  redHeaderPill: { 
    backgroundColor: '#B22222', 
    width: '92%', 
    paddingVertical: 15, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  materialCard: { backgroundColor: 'white', borderRadius: 30, marginBottom: 30, elevation: 6, padding: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  imageBox: { marginBottom: 15 },
  materialImg: { width: '100%', aspectRatio: 1, borderRadius: 20, backgroundColor: '#f3f4f6' },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  actionCol: { gap: 12, marginLeft: 10 },
  txt: { fontSize: 15, marginBottom: 5 },
  labelBlue: { color: '#1A237E', fontWeight: '900' },
  greenVal: { color: '#059669', fontWeight: 'bold' },
  editBtn: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12 },
  deleteBtn: { backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12 },
  emptyText: { textAlign: 'center', color: '#ccc', fontStyle: 'italic', marginTop: 50 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, backgroundColor: '#B22222', borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8 }
});
