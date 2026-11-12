import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  StatusBar, 
  Platform,
  ImageBackground,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function RoomContentsScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string, roomName: string }>();
  const { appData } = useAppContext() as any;

  const inventory = (appData.materiels || []).filter(
    (m: any) => String(m.roomId) === String(roomId)
  );

  const roomContentsBg = (appData && appData.settings && appData.settings.roomContentsBg) || null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {roomContentsBg && (
        <ImageBackground source={{ uri: roomContentsBg }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={[styles.redHeaderPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={[styles.headerTitleText, styles.SBI]} numberOfLines={1}>
            {roomName}
          </Text>
          <View style={{ width: 40 }} /> 
        </View>

        {/* GRILLE DES MATÉRIELS (icônes uniquement) */}
        <View style={styles.grid}>
          {inventory.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/material-details', params: { materialId: item.id } })}
            >
              {item.image
                ? <Image source={{ uri: item.image }} style={styles.materialImg} resizeMode="contain" />
                : <View style={[styles.materialImg, styles.imagePlaceholder]}>
                    <Text style={[styles.placeholderLetter, styles.SBI]}>
                      {item.nom ? item.nom[0].toUpperCase() : '?'}
                    </Text>
                  </View>
              }
            </TouchableOpacity>
          ))}
        </View>
        
        {/* ÉTAT VIDE */}
        {inventory.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, styles.SBI]}>Aucun matériel enregistré.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },

  SBI: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },

  scrollContent: { padding: 25, paddingTop: 55, paddingBottom: 40 },

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
    color: 'white', fontSize: 20, flex: 1,
    textAlign: 'center', letterSpacing: 1,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 20 },

  materialImg: { width: '100%', aspectRatio: 1, borderRadius: 25, backgroundColor: '#F1F5F9' },
  imagePlaceholder: { backgroundColor: '#8B0000', alignItems: 'center', justifyContent: 'center' },
  placeholderLetter: { color: 'white', fontSize: 56 },

  emptyBox: { marginTop: 80, alignItems: 'center' },
  emptyText: { color: '#94A3B8', letterSpacing: 1, fontSize: 16 },

  glowBlack: {
    elevation: 8, shadowColor: '#000',
    shadowOpacity: 0.3, shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});
