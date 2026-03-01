import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export default function SubdivisionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Récupère A, B, C...

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
      {/* BOUTON RETOUR TRANSPARENT */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButton}
      >
        <ChevronLeft size={32} color="rgba(0,0,0,0.4)" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* BOUTON HEADER ROUGE */}
        <View style={styles.headerSpacer}>
          <View style={styles.redBadge}>
            <Text style={styles.redBadgeText}>BLOC {id}1</Text>
          </View>
        </View>

        {/* SOUS-TITRE */}
        <View style={styles.subTitleContainer}>
          <Text style={styles.subTitleText}>· NIVEAUX DE SUBDIVISION ·</Text>
        </View>

        {/* LISTE DE BOUTONS BLEU MARINE */}
        <View style={styles.listContainer}>
          {niveaux.map((niveau, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.levelBtn}
              onPress={() => router.push({
                pathname: '/room-profiles',
                params: { blocId: id, niveau: niveau }
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
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scrollContent: { paddingTop: 110, paddingBottom: 40 },
  headerSpacer: { paddingHorizontal: 24, marginBottom: 30 },
  redBadge: { backgroundColor: '#8B0000', paddingVertical: 18, borderRadius: 50, alignItems: 'center' },
  redBadgeText: { color: 'white', fontWeight: '900', textTransform: 'uppercase', fontSize: 16, letterSpacing: 4 },
  subTitleContainer: { alignItems: 'center', marginBottom: 25 },
  subTitleText: { color: '#9CA3AF', fontSize: 11, fontWeight: 'bold', letterSpacing: 2.5, textTransform: 'uppercase' },
  listContainer: { paddingHorizontal: 24, gap: 15 },
  levelBtn: { backgroundColor: '#1A237E', paddingVertical: 18, borderRadius: 50, alignItems: 'center' },
  levelBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
