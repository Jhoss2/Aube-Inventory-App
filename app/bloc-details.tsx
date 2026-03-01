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
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function BlocDetailsScreen() {
  const router = useRouter();
  const { blockId } = useLocalSearchParams<{ blockId: string }>();
  const { appData } = useAppContext() as any;

  // On récupère les données du bloc ou on simule si vide
  const bloc = appData?.blocs?.[blockId as string];

  if (!blockId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>BLOC NON SPÉCIFIÉ</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
            <Text style={styles.errorBtnText}>RETOUR</Text>
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
          
          {/* HEADER ROUGE STYLE ACCUEIL */}
          <View style={[styles.redHeaderPill, styles.glow]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="chevron-left" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>
              EXPLORATION : BLOC {blockId.toUpperCase()}
            </Text>
            <View style={{ width: 32 }} /> 
          </View>

          {/* 1. VUE DE DESSUS */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/fullscreen-view', params: { imageUri: bloc?.mainImage, title: `VUE DE DESSUS - BLOC ${blockId}` } })}
              style={[styles.imageCard, styles.glow]}
              activeOpacity={0.9}
            >
              <Image
                source={bloc?.mainImage ? { uri: bloc.mainImage } : { uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80' }}
                style={styles.landscapeImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={[styles.titleSupport, styles.glow]}>
              <Text style={styles.titleText}>VU AÉRIENNE DU BLOC</Text>
            </View>
          </View>

          {/* 2. SECTION SALLES */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/subdivision', params: { blockId, type: 'salles' } })}
              style={[styles.imageCard, styles.glow]}
              activeOpacity={0.9}
            >
              <Image
                source={bloc?.sallesImage ? { uri: bloc.sallesImage } : { uri: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80' }}
                style={styles.landscapeImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={[styles.titleSupport, styles.glow]}>
              <Text style={styles.titleText}>SALLES</Text>
            </View>
          </View>

          {/* 3. SECTION BUREAUX */}
          <View style={styles.sectionContainer}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/subdivision', params: { blockId, type: 'bureaux' } })}
              style={[styles.imageCard, styles.glow]}
              activeOpacity={0.9}
            >
              <Image
                source={bloc?.bureauxImage ? { uri: bloc.bureauxImage } : { uri: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80' }}
                style={styles.landscapeImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={[styles.titleSupport, styles.glow]}>
              <Text style={styles.titleText}>BUREAUX</Text>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fceef5' }, // Fond rose très pâle comme l'accueil
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 20, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header synchronisé avec l'accueil
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    height: 60,
    borderRadius: 30, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 35
  },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitleText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 13, 
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif-medium'
  },

  sectionContainer: { marginBottom: 40, alignItems: 'center' },
  
  imageCard: { 
    width: '100%',
    height: 200,
    backgroundColor: 'white', 
    borderRadius: 40, 
    overflow: 'hidden', 
    borderWidth: 2,
    borderColor: 'white',
  },
  landscapeImage: { width: '100%', height: '100%' },
  
  // Style Support décollé (identique à l'accueil)
  titleSupport: { 
    backgroundColor: '#263d7e', 
    paddingHorizontal: 25, 
    paddingVertical: 10, 
    borderRadius: 50, 
    marginTop: -20, // Effet de chevauchement léger ou ajuste à 15 pour décoller
    borderWidth: 1.5, 
    borderColor: '#fceef5',
    alignSelf: 'center',
    zIndex: 10
  },
  titleText: { color: 'white', fontSize: 12, fontWeight: '900', letterSpacing: 2 },

  emptyText: { color: '#8B0000', fontWeight: 'bold', marginBottom: 20 },
  errorBtn: { backgroundColor: '#8B0000', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  errorBtnText: { color: 'white', fontWeight: 'bold' },

  glow: { 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 5 } 
  }
});
