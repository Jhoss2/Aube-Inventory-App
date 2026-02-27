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
        {/* Barre d'état système simulée */}
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
            <TouchableOpacity>
              <Feather name="menu" size={24} color="white" />
            </TouchableOpacity>
            
            {/* ICÔNE PARAMÈTRES RÉTABLIE (Sliders) */}
            <TouchableOpacity onPress={() => router.push('/settings')}>
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
              onPress={() => router.push('/chat-aube')}
            >
              <MaterialCommunityIcons name="robot" size={24} color="#3169e6" />
            </TouchableOpacity>
          </View>

          {/* Boutons Blocs */}
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.blockSelector}>
              {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
                <TouchableOpacity 
                  key={block} 
                  style={styles.blockButton}
                  onPress={() => router.push({ pathname: '/room-contents', params: { blockId: block } })}
                >
                  <Text style={styles.blockButtonText}>Bloc {block}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* SECTION UNIVERSITÉ RESPONSIVE */}
          <View style={styles.univSection}>
            <View style={styles.imageContainer}>
              {univImage ? (
                <Image source={{ uri: univImage }} style={styles.univImage} resizeMode="cover" />
              ) : (
                <View style={styles.placeholderBlue}>
                  <Text style={styles.placeholderText}>Université</Text>
                </View>
              )}
            </View>
            
            {/* TITRE JUSTE EN DESSOUS (Badge) */}
            <View style={styles.titleBadge}>
              <Text style={styles.titleText}>UNIVERSITE AUBE NOUVELLE</Text>
            </View>
          </View>
        </ScrollView>

        {/* Barre de Navigation du bas */}
        <View style={styles.bottomNav}>
          <TouchableOpacity><Feather name="bell" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/')}><Feather name="home" size={22} color="white" /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/guide-viewer')}><Feather name="file-text" size={22} color="white" /></TouchableOpacity>
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

  univSection: { marginHorizontal: 12, marginTop: 20, alignItems: 'center' },
  imageContainer: { width: '100%', height: 320, borderRadius: 25, overflow: 'hidden', backgroundColor: '#4184f4' },
  univImage: { width: '100%', height: '100%' },
  placeholderBlue: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: 'white', fontSize: 52, fontWeight: 'bold' },
  
  titleBadge: { backgroundColor: '#263d7e', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12, marginTop: -20, elevation: 5 },
  titleText: { color: 'white', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },

  bottomNav: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: '#263d7e', height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 56 }
});
