import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, StatusBar, Image, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function HomeScreen() {
  const router = useRouter();
  const { appData } = useAppContext();

  const univImage = appData.settings?.univImage;
  const backgroundImage = appData.settings?.bgImage;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <ImageBackground 
        source={backgroundImage ? { uri: backgroundImage } : null}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#fceef5' }]}
        resizeMode="cover"
      >
        {/* Barre d'état système */}
        <View style={styles.statusBarMock}>
          <View style={styles.flexRowCenter}>
            <Text style={styles.statusTime}>12:13</Text>
            <Ionicons name="chatbubble" size={10} color="white" style={{marginLeft: 4}} />
            <Ionicons name="chatbubble" size={10} color="white" />
            <Ionicons name="musical-notes" size={10} color="white" />
          </View>
          <View style={styles.flexRowCenter}>
            <Ionicons name="volume-mute" size={12} color="white" />
            <Ionicons name="wifi" size={12} color="white" />
            <Text style={styles.statusBattery}>38 %</Text>
            <View style={styles.batteryIcon}><View style={styles.batteryLevel} /></View>
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Rouge */}
          <View style={styles.headerRed}>
            <TouchableOpacity onPress={() => console.log('Sidebar')}>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            
            {/* CORRECTION ICÔNE PARAMÈTRES : 'tune' est l'équivalent de sliders-horizontal */}
            <TouchableOpacity onPress={() => router.push('/screens/settings')}>
              <MaterialCommunityIcons name="tune" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Barre de Recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
            <TextInput 
              placeholder="Que cherchez vous aujourd'hui ?" 
              placeholderTextColor="#9ca3af"
              style={styles.searchInput}
            />
            <TouchableOpacity 
              style={styles.botButton}
              onPress={() => router.push('/screens/chat-aube')}
            >
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Boutons Blocs A à F */}
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
              {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
                <TouchableOpacity 
                  key={block} 
                  style={styles.blockButton}
                  onPress={() => router.push({ pathname: '/screens/room-contents', params: { blockId: block } })}
                >
                  <Text style={styles.blockButtonText}>Bloc {block}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Section Université Responsive */}
          <View style={styles.universitySectionContainer}>
            <View style={styles.universityCard}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={styles.universityImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderCard}>
                   <Text style={{color: 'white', fontSize: 40, fontWeight: 'bold'}}>Université</Text>
                </View>
              )}
            </View>
            
            <View style={styles.titleBadge}>
              <Text style={styles.titleText}>UNIVERSITE AUBE NOUVELLE</Text>
            </View>
          </View>
        </ScrollView>

        {/* Barre de Navigation du bas */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => console.log('Alertes')}>
            <Feather name="bell" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Feather name="home" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/screens/guide-viewer')}>
            <Feather name="file-text" size={22} color="white" />
          </TouchableOpacity>
        </View>

      </ImageBackground>
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
  headerRed: { marginHorizontal: 12, marginTop: 12, height: 48, backgroundColor: '#c0262b', borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  searchContainer: { marginHorizontal: 12, marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, height: 44, backgroundColor: 'white', borderRadius: 22, paddingLeft: 44, paddingRight: 48, fontSize: 13, fontWeight: '500', color: '#6b7280' },
  searchIcon: { position: 'absolute', left: 16, zIndex: 1 },
  botButton: { position: 'absolute', right: 12, zIndex: 1 },
  blockSelector: { marginHorizontal: 12, marginTop: 12, backgroundColor: '#263d7e', borderRadius: 10, padding: 6 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 6, marginRight: 6 },
  blockButtonText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  universitySectionContainer: { marginHorizontal: 12, marginTop: 16, alignItems: 'center' },
  universityCard: { width: '100%', backgroundColor: '#4184f4', borderRadius: 24, overflow: 'hidden', marginBottom: -25 },
  universityImage: { width: '100%', height: 330 },
  placeholderCard: { width: '100%', height: 330, backgroundColor: '#4184f4', alignItems: 'center', justifyContent: 'center' },
  titleBadge: { backgroundColor: '#263d7e', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, elevation: 5 },
  titleText: { color: 'white', fontSize: 11, fontWeight: '700', letterSpacing: 1, textAlign: 'center' },
  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 56 }
});
