import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function SubdivisionScreen() {
  const router = useRouter();
  const { blocId, code } = useLocalSearchParams();

  const niveaux = [
    "· Sous-sol ·",
    "· Rez-de-chaussée ·",
    "· Premier Niveau ·",
    "· Deuxième Niveau ·",
    "· Troisième Niveau ·",
    "· Quatrième Niveau ·"
  ];

  return (
    <View style={styles.container}>
      {/* BOUTON RETOUR (Flèche seule, légèrement transparente) */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <ChevronLeft size={32} color="rgba(0,0,0,0.4)" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* 1. BOUTON HEADER ROUGE */}
        <View style={styles.redBadgeContainer}>
          <View style={styles.redBadge}>
            <Text style={styles.redBadgeText}>BLOC {code || 'A1'}</Text>
          </View>
        </View>

        {/* 2. SOUS-TITRE */}
        <View style={styles.subTitleContainer}>
          <Text style={styles.subTitleText}>· NIVEAUX DE SUBDIVISION ·</Text>
        </View>

        {/* 3. LISTE DE BOUTONS DE NIVEAUX (BLEU MARINE) */}
        <View style={styles.levelsContainer}>
          {niveaux.map((niveau, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.levelBtn}
              activeOpacity={0.8}
              onPress={() => router.push({
                pathname: '/rooms-list',
                params: { blocId, code, niveau }
              })}
            >
              <Text style={styles.levelBtnText}>{niveau}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FB' 
  },
  // Bouton retour flottant (Header "derrière")
  backButton: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    zIndex: 10,
    padding: 5
  },
  scrollContent: { 
    paddingTop: 110, // Espace pour laisser la place à la flèche retour
    paddingBottom: 40 
  },
  redBadgeContainer: { 
    paddingHorizontal: 24, 
    marginBottom: 30 
  },
  redBadge: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 18, 
    borderRadius: 50, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  redBadgeText: { 
    color: 'white', 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    fontSize: 16, 
    letterSpacing: 4 
  },
  subTitleContainer: { 
    alignItems: 'center', 
    marginBottom: 25 
  },
  subTitleText: { 
    color: '#9CA3AF', 
    fontSize: 11, 
    fontWeight: 'bold', 
    letterSpacing: 2.5 
  },
  levelsContainer: { 
    paddingHorizontal: 24, 
    gap: 15 
  },
  levelBtn: { 
    backgroundColor: '#1A237E', 
    paddingVertical: 18, 
    borderRadius: 50, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  levelBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14, 
    letterSpacing: 1 
  }
});
