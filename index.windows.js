import React, { useState } from 'react';
import { AppRegistry, View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Keyboard, Alert } from 'react-native';
import { useAppContext } from './lib/app-context'; 

// Mocks globaux pour neutraliser l'écosystème Expo absent sous Windows
global.expo = global.expo || {};

// Système de navigation alternatif pour Windows (Mocks d'Expo Router)
const useWindowsRouter = () => {
  return {
    push: (target) => {
      const destination = typeof target === 'string' ? target : target.pathname;
      const params = target.params ? JSON.stringify(target.params) : '';
      Alert.alert("Navigation Desktop", `Redirection vers : ${destination} ${params}`);
    },
    replace: (target) => {
      Alert.alert("Navigation Desktop", `Remplacement par : ${target}`);
    }
  };
};

function WindowsHomeScreen() {
  const router = useWindowsRouter();
  
  // Utilisation de votre véritable AppContext partagé (Salles et Matériels)
  const context = useAppContext();
  const appData = context?.appData || { settings: {}, salles: [], materiels: [] };

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // --- ALGORITHME DE RECHERCHE PARTAGÉ ---
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    
    const q = query.trim().replace(/\s+/g, ' ').toLowerCase();
    const salles = appData.salles || [];
    const materiels = appData.materiels || [];
    const results = [];

    // Filtrage des salles
    for (let i = 0; i < salles.length; i++) {
      if ((salles[i].name || '').toLowerCase().indexOf(q) !== -1) {
        results.push({ 
          type: 'salle', 
          label: salles[i].name, 
          sub: 'Bloc ' + (salles[i].blockId || '?'), 
          id: salles[i].id 
        });
      }
    }

    // Filtrage des matériels et équipements
    for (let j = 0; j < materiels.length; j++) {
      const m = materiels[j];
      if ((m.nom || '').toLowerCase().indexOf(q) !== -1 || (m.category || '').toLowerCase().indexOf(q) !== -1) {
        const sal = salles.find((s) => String(s.id) === String(m.roomId));
        results.push({ 
          type: 'materiel', 
          label: m.nom, 
          sub: (m.category || '') + (sal ? ' — ' + sal.name : ''), 
          roomId: m.roomId, 
          roomName: sal ? sal.name : '' 
        });
      }
    }

    setSearchResults(results.slice(0, 8));
  };

  return (
    <View style={styles.container}>
      {/* SIDEBAR ADAPTÉE AU FORMAT BUREAU */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>U-AUBEN</Text>
        <Text style={styles.sidebarSubtitle}>INVENTORY</Text>
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.replace('/')}>
          <Text style={styles.sidebarItemText}>📊 Tableau de bord</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/note-editor')}>
          <Text style={styles.sidebarItemText}>📝 Éditeur de Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/alerts')}>
          <Text style={styles.sidebarItemText}>🔔 Notifications / Alertes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={() => router.push('/settings')}>
          <Text style={styles.sidebarItemText}>⚙️ Paramètres système</Text>
        </TouchableOpacity>
      </View>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.header}>
          <Text style={styles.titleText}>UNIVERSITÉ AUBE NOUVELLE</Text>
          <Text style={styles.subtitleText}>Outil d'inventaire nativement compilé pour Windows Desktop</Text>
        </View>

        {/* BARRE DE RECHERCHE FONCTIONNELLE */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Que cherchez-vous ? (Salles, Équipements, Catégories...)"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.botButton} onPress={() => router.push('/chat-aube')}>
            <Text style={styles.botButtonText}>🤖 IA Aube</Text>
          </TouchableOpacity>
        </View>

        {/* PANNEAU DES RÉSULTATS DE RECHERCHE DIRECTE */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsBox}>
            {searchResults.map((r, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.searchResultItem}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  Keyboard.dismiss();
                  if (r.type === 'materiel') {
                    router.push({ pathname: '/room-contents', params: { roomId: r.roomId, roomName: r.roomName } });
                  } else if (r.type === 'salle') {
                    router.push({ pathname: '/room-details', params: { roomId: r.id } });
                  }
                }}
              >
                <Text style={styles.resultIcon}>{r.type === 'salle' ? '🚪' : '📦'}</Text>
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultLabel}>{r.label}</Text>
                  <Text style={styles.resultSub}>{r.sub}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SÉLECTEUR DE BLOCS ACCESSIBLE */}
        <Text style={styles.sectionTitle}>Sélecteur Rapide de Blocs</Text>
        <View style={styles.blockContainer}>
          {['A', 'B', 'C', 'D', 'E', 'F'].map((block) => (
            <TouchableOpacity
              key={block}
              style={styles.blockButton}
              onPress={() => router.push({ pathname: '/bloc-details', params: { blockId: block } })}
            >
              <Text style={styles.blockButtonText}>BLOC {block}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#fceef5' },
  
  // Sidebar Desktop
  sidebar: { width: 260, backgroundColor: '#263d7e', padding: 24, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sidebarTitle: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  sidebarSubtitle: { color: '#fbcfe8', fontSize: 13, fontWeight: '600', marginBottom: 25 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  sidebarItem: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, marginVertical: 4 },
  sidebarItemText: { color: '#fff', fontSize: 15, fontWeight: '500' },
  
  // Contenu Principal
  mainContent: { flex: 1, padding: 40 },
  header: { marginBottom: 35 },
  titleText: { color: '#263d7e', fontSize: 32, fontWeight: 'bold' },
  subtitleText: { color: '#64748b', fontSize: 15, marginTop: 6 },
  
  // Champ de Recherche
  searchContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 30, paddingHorizontal: 20, height: 60, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  botButton: { backgroundColor: '#e0e7ff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  botButtonText: { color: '#3169e6', fontWeight: 'bold', fontSize: 13 },

  // Résultats de Recherche
  searchResultsBox: { backgroundColor: 'white', borderRadius: 20, marginTop: 5, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, marginBottom: 25 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  resultIcon: { fontSize: 18, marginRight: 15 },
  resultTextContainer: { flex: 1 },
  resultLabel: { fontSize: 15, fontWeight: '600', color: '#1A237E' },
  resultSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  
  // Éléments de blocs
  sectionTitle: { color: '#1e293b', fontSize: 20, fontWeight: 'bold', marginTop: 25, marginBottom: 15 },
  blockContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, minWidth: 110, alignItems: 'center' },
  blockButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});

AppRegistry.registerComponent('uaubeninventoryapp', () => WindowsHomeScreen);
