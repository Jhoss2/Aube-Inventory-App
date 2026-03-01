import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function SubdivisionScreen() {
  const router = useRouter();
  // On récupère le bloc et le type (salles/bureaux)
  const { blockId, type } = useLocalSearchParams<{ blockId: string, type: string }>();

  const niveaux = [
    "· Sous-sol ·", 
    "· Rez-de-chaussée ·", 
    "· Premier Niveau ·",
    "· Deuxième Niveau ·", 
    "· Troisième Niveau ·", 
    "· Quatrième Niveau ·"
  ];

  const handleLevelPress = (niveau: string) => {
    router.push({
      pathname: '/room-profiles',
      params: { blockId, type, level: niveau }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER ROUGE AVEC RETOUR INTÉGRÉ */}
      <View style={styles.headerPadding}>
        <View style={styles.redHeaderPill}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>
            BLOC {blockId}{type === 'salles' ? '1' : '2'}
          </Text>
          <View style={{ width: 44 }} /> 
        </View>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* TITRE SECTION : PILL BLANCHE TEXTE BLEU */}
        <View style={styles.sectionTitleWrapper}>
          <View style={styles.whitePill}>
            <Text style={styles.sectionTitleText}>
              · NIVEAUX DE SUBDIVISION ·
            </Text>
          </View>
        </View>

        {/* LISTE DES BOUTONS - BLEU MARINE */}
        <View style={styles.buttonList}>
          {niveaux.map((niveau, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => handleLevelPress(niveau)}
              style={styles.levelButton}
              activeOpacity={0.8}
            >
              <Text style={styles.levelButtonText}>
                {niveau}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  headerPadding: { px: 20, paddingTop: 15, paddingHorizontal: 20 },
  scrollContent: { paddingTop: 20, paddingBottom: 40, alignItems: 'center' },
  
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    height: 55, 
    borderRadius: 28, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  backBtn: { padding: 8 },
  headerTitleText: { 
    color: 'white', 
    fontWeight: '900', 
    fontSize: 16, 
    letterSpacing: 4, 
    textAlign: 'center',
    flex: 1
  },

  sectionTitleWrapper: { marginBottom: 30, alignItems: 'center' },
  whitePill: { 
    backgroundColor: 'white', 
    paddingHorizontal: 24, 
    paddingVertical: 10, 
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    elevation: 12, // Lueur noire (shadow) pour tablette
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  sectionTitleText: { 
    color: '#1A237E', 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 2 
  },

  buttonList: { width: '100%', paddingHorizontal: 25, gap: 16, maxWidth: 600 },
  levelButton: { 
    backgroundColor: '#1A237E', 
    height: 55, 
    borderRadius: 28, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4
  },
  levelButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14, 
    letterSpacing: 2,
    textTransform: 'uppercase'
  }
});
