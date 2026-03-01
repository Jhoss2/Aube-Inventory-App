import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function BlocDetailsScreen() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const { appData } = useAppContext() as any;

  const bloc = appData?.blocs?.[blockId as string];

  if (!blockId || !bloc) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>BLOC NON TROUVÉ</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>RETOUR</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER ROUGE PILL SHAPE */}
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>
              BLOC {blockId.toUpperCase()}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          {/* 1. VUE DE DESSUS (Pointe vers l'affichage plein écran) */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/fullscreen-view', params: { imageUri: bloc.mainImage, title: `VUE DE DESSUS - BLOC ${blockId}` } })}
            style={styles.imageCard}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: bloc.mainImage }}
              style={styles.landscapeImage}
              resizeMode="cover"
            />
            <View style={styles.imageLabelContainer}>
              <Text style={styles.imageLabelText}>VUE DE DESSUS</Text>
            </View>
          </TouchableOpacity>

          {/* 2. SECTION SALLES (Pointe vers subdivision) */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/subdivision', params: { blockId, type: 'salles' } })}
            style={styles.imageCard}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: bloc.sallesImage || bloc.mainImage }}
              style={styles.landscapeImage}
              resizeMode="cover"
            />
            <View style={styles.imageLabelContainer}>
              <Text style={styles.imageLabelText}>SALLES</Text>
            </View>
          </TouchableOpacity>

          {/* 3. SECTION BUREAUX (Pointe vers subdivision) */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/subdivision', params: { blockId, type: 'bureaux' } })}
            style={styles.imageCard}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: bloc.bureauxImage || bloc.mainImage }}
              style={styles.landscapeImage}
              resizeMode="cover"
            />
            <View style={styles.imageLabelContainer}>
              <Text style={styles.imageLabelText}>BUREAUX</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 30, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 25,
    elevation: 6
  },
  backBtn: { padding: 5 },
  headerTitleText: { color: 'white', fontWeight: 'bold', fontSize: 14, letterSpacing: 2 },

  imageCard: { 
    backgroundColor: 'white', 
    borderRadius: 30, 
    overflow: 'hidden', 
    elevation: 4, 
    marginBottom: 20,
    height: 180, 
    borderWidth: 1,
    borderColor: '#FCE7F3',
    position: 'relative'
  },
  landscapeImage: { width: '100%', height: '100%' },
  
  imageLabelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(26, 35, 126, 0.8)', 
    paddingVertical: 8,
    alignItems: 'center'
  },
  imageLabelText: { 
    color: 'white', 
    fontWeight: '900', 
    fontSize: 12, 
    letterSpacing: 3 
  },

  emptyText: { color: '#8B0000', fontWeight: 'bold', marginBottom: 20 },
  saveBtn: { backgroundColor: '#1A237E', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 50 },
  saveBtnText: { color: 'white', fontWeight: 'bold' }
});
