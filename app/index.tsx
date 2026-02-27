import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fceef5' }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      {/* Barre d'état système simulée (Noire) */}
      <View style={styles.statusBarMock}>
        <View style={styles.flexRowCenter}>
          <Text style={styles.statusTime}>12:13</Text>
          <Ionicons name="chatbubble-outline" size={10} color="white" style={{marginLeft: 4}} />
          <Ionicons name="chatbubble-outline" size={10} color="white" />
          <Ionicons name="musical-notes-outline" size={10} color="white" />
        </View>
        <View style={styles.flexRowCenter}>
          <Ionicons name="volume-mute-outline" size={12} color="white" />
          <Ionicons name="wifi-outline" size={12} color="white" />
          <Text style={styles.statusBattery}>38 %</Text>
          <View style={styles.batteryIcon}><View style={styles.batteryLevel} /></View>
        </View>
      </View>

      {/* Contenu défilable */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Rouge (Forme Gélule) */}
        <View style={styles.headerRed}>
          <TouchableOpacity onPress={() => console.log('Menu')}>
            <Feather name="menu" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/settings')}>
            <Ionicons name="sliders-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Barre de Recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput 
            placeholder="Que cherchez vous aujourd'hui ?" 
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={() => router.push('/screens/chat-aube')}>
            <MaterialCommunityIcons name="robot" size={22} color="#3169e6" style={styles.botIcon} />
          </TouchableOpacity>
        </View>

        {/* Sélecteur de Blocs */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
              <TouchableOpacity key={block} style={styles.blockButton}>
                <Text style={styles.blockButtonText}>Bloc {block}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Carte Principale et Bouton Chevauchant */}
        <View style={styles.mainCardContainer}>
          <View style={styles.blueCard}>
            <Text style={styles.cardTitle}>Université</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.overlapButton}
            onPress={() => router.push('/screens/add-room')}
          >
            <Text style={styles.overlapButtonText}>UNIVERSITE AUBE NOUVELLE</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Barre de Navigation Flottante au bas */}
      <View style={styles.bottomNav}>
        <TouchableOpacity><Feather name="bell" size={22} color="white" /></TouchableOpacity>
        <TouchableOpacity><Feather name="home" size={22} color="white" /></TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/screens/guide-viewer')}>
          <Feather name="file-text" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusBarMock: { height: 24, backgroundColor: 'black', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 8 },
  statusTime: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  statusBattery: { color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  flexRowCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  batteryIcon: { width: 18, height: 9, borderWidth: 1, borderColor: 'white', borderRadius: 2, padding: 1, marginLeft: 4, justifyContent: 'center' },
  batteryLevel: { backgroundColor: 'white', height: '100%', width: '38%' },
  
  headerRed: { mx: 12, marginTop: 12, marginHorizontal: 12, height: 48, backgroundColor: '#c0262b', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', px: 20, paddingHorizontal: 20, elevation: 2 },
  
  searchContainer: { marginHorizontal: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  searchInput: { flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22, paddingLeft: 44, paddingRight: 48, fontSize: 13, fontWeight: '500', elevation: 1 },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botIcon: { position: 'absolute', right: 12, bottom: -11 }, // Ajusté pour le centrage vertical

  blockSelector: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#263d7e', borderRadius: 10, padding: 6 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  blockButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  mainCardContainer: { marginHorizontal: 12, marginTop: 16, alignItems: 'center', paddingBottom: 24 },
  blueCard: { width: '100%', backgroundColor: '#4184f4', height: 330, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 3 },
  cardTitle: { color: 'white', fontSize: 52, fontWeight: 'bold', letterSpacing: -1 },
  
  overlapButton: { position: 'absolute', bottom: 0, backgroundColor: '#263d7e', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, elevation: 5 },
  overlapButtonText: { color: 'white', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },

  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 56, elevation: 10 }
});
