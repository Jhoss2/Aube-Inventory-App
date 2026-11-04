import React, { useState } from 'react';
import { AppRegistry, View, Text, TextInput, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';

// "Mocks" globaux pour neutraliser les crashs si des fichiers partagés importent Expo
global.expo = global.expo || {};

function WindowsHomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // Simulation des données d'inventaire
  const mockSalles = [
    { name: "Salle de conférence 101", sub: "Bloc A" },
    { name: "Laboratoire Informatique", sub: "Bloc B" },
    { name: "Amphithéâtre Auben", sub: "Bloc C" },
  ];

  return (
    <View style={styles.container}>
      {/* BARRE LATÉRALE / HEADER SIMULÉ */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>U-AUBEN</Text>
        <Text style={styles.sidebarSubtitle}>INVENTORY</Text>
        <View style={styles.divider} />
        <Text style={styles.menuItem}>📊 Tableau de bord</Text>
        <Text style={styles.menuItem}>🚪 Gestion des Salles</Text>
        <Text style={styles.menuItem}>📦 Équipements</Text>
        <Text style={styles.menuItem}>⚙️ Paramètres</Text>
      </View>

      {/* ZONE PRINCIPALE DE L'APPLICATION */}
      <ScrollView style={styles.mainContent} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.header}>
          <Text style={styles.titleText}>UNIVERSITÉ AUBE NOUVELLE</Text>
          <Text style={styles.subtitleText}>Système de Gestion d'Inventaire — Version Windows Native</Text>
        </View>

        {/* BARRE DE RECHERCHE SIMILAIRE À VOTRE CODE MOBILE */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Que cherchez-vous dans l'inventaire ?"
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* SÉLECTEUR DE BLOCS */}
        <Text style={styles.sectionTitle}>Navigation par Blocs</Text>
        <View style={styles.blockContainer}>
          {['BLOC A', 'BLOC B', 'BLOC C', 'BLOC D', 'BLOC E', 'BLOC F'].map((block) => (
            <TouchableOpacity key={block} style={styles.blockButton}>
              <Text style={styles.blockButtonText}>{block}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AFFICHAGE DES SALLES (VERSION DESKTOP) */}
        <Text style={styles.sectionTitle}>Salles récentes</Text>
        <View style={styles.grid}>
          {mockSalles.map((salle, idx) => (
            <View key={idx} style={styles.salleCard}>
              <Text style={styles.salleName}>{salle.name}</Text>
              <Text style={styles.salleSub}>{salle.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#fceef5' },
  sidebar: { width: 250, backgroundColor: '#263d7e', padding: 20 },
  sidebarTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 2 },
  sidebarSubtitle: { color: '#fbcfe8', fontSize: 14, fontWeight: '600', marginBottom: 20 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  menuItem: { color: '#fff', fontSize: 15, marginVertical: 12, fontWeight: '500' },
  
  mainContent: { flex: 1, padding: 30 },
  header: { marginBottom: 30 },
  titleText: { color: '#263d7e', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
  subtitleText: { color: '#64748b', fontSize: 14, marginTop: 5 },
  
  searchContainer: { backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 15, height: 50, justifyContent: 'center', elevation: 2, marginBottom: 30 },
  searchInput: { fontSize: 15, color: '#333' },
  
  sectionTitle: { color: '#1e293b', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  blockContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 35 },
  blockButton: { backgroundColor: '#385598', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  blockButtonText: { color: '#fff', fontWeight: 'bold' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  salleCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '30%', minWidth: 200, elevation: 2 },
  salleName: { color: '#263d7e', fontSize: 16, fontWeight: 'bold' },
  salleSub: { color: '#94a3b8', fontSize: 12, marginTop: 5 }
});

AppRegistry.registerComponent('uaubeninventoryapp', () => WindowsHomeScreen);
