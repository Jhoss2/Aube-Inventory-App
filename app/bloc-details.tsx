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
  const { blocId } = useLocalSearchParams<{ blocId: string }>();
  const { appData } = useAppContext() as any;

  const bloc = appData?.blocs?.[blocId as string];

  if (!blocId || !bloc) {
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

  const handleSubBlocPress = (subId: string) => {
    router.push({
      pathname: '/room-profiles',
      params: { subId, blocId },
    });
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
            <Text style={styles.headerTitleText}>
              BLOC {blocId.toUpperCase()}
            </Text>
            <View style={{ width: 40 }} /> 
          </View>

          {/* IMAGE PRINCIPALE DU BLOC */}
          <View style={styles.mainCard}>
            <Image
              source={{ uri: bloc.mainImage }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            <View style={styles.imageCaption}>
              <Text style={styles.captionText}>VUE D'ENSEMBLE DU BLOC {blocId}</Text>
            </View>
          </View>

          {/* LISTE DES SOUS-BLOCS */}
          <View style={styles.subBlocsContainer}>
            {bloc.subBlocs && (bloc.subBlocs as any[]).map((subBloc: any, index: number) => (
              <TouchableOpacity
                key={subBloc.id || index}
                onPress={() => handleSubBlocPress(subBloc.id)}
                style={styles.subBlocWrapper}
                activeOpacity={0.9}
              >
                <View style={styles.subBlocHeader}>
                  <Text style={styles.subBlocTitle}>{subBloc.title.toUpperCase()}</Text>
                </View>

                <View style={styles.subBlocCard}>
                  <Image
                    source={{ uri: subBloc.image }}
                    style={styles.subImage}
                    resizeMode="cover"
                  />
                  <View style={styles.subCaption}>
                    <Text style={styles.subCaptionText}>{subBloc.imageTitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 30, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  // Header Rouge Pill
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  backBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14, 
    letterSpacing: 2,
    textTransform: 'uppercase'
  },

  // Carte Image Principale
  mainCard: { 
    backgroundColor: 'white', 
    borderRadius: 35, 
    overflow: 'hidden', 
    elevation: 4, 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#FCE7F3'
  },
  mainImage: { width: '100%', height: 180 },
  imageCaption: { padding: 12, backgroundColor: 'white', alignItems: 'center' },
  captionText: { color: '#64748B', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },

  // Sous-Blocs
  subBlocsContainer: { gap: 25 },
  subBlocWrapper: { marginBottom: 10 },
  subBlocHeader: { marginBottom: 10, alignItems: 'center' },
  subBlocTitle: { 
    color: '#1A237E', 
    fontWeight: '900', 
    fontSize: 16, 
    letterSpacing: 1.5 
  },
  subBlocCard: { 
    backgroundColor: 'white', 
    borderRadius: 30, 
    overflow: 'hidden', 
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FCE7F3'
  },
  subImage: { width: '100%', height: 160 },
  subCaption: { padding: 10, alignItems: 'center' },
  subCaptionText: { 
    color: '#64748B', 
    fontSize: 10, 
    fontStyle: 'italic', 
    fontWeight: '600' 
  },

  // Utils
  emptyText: { color: '#8B0000', fontWeight: 'bold', marginBottom: 20 },
  saveBtn: { backgroundColor: '#1A237E', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 50 },
  saveBtnText: { color: 'white', fontWeight: 'bold' }
});
