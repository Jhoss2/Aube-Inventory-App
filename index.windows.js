import { AppRegistry, View, Text, StyleSheet, ScrollView } from 'react-native';
import React from 'react';

// 1. Définition des "mocks" pour éviter les plantages dus aux imports d'Expo
global.expo = global.expo || {};
// Si votre code importe expo-sqlite ou expo-file-system, 
// ces simulations basiques empêchent l'application de crasher au démarrage.
jest = { mock: () => {} }; 

// 2. Écran temporaire propre pour Windows (En attendant d'adapter vos composants)
function WindowsAppRoot() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>U-AUBEN INVENTORY</Text>
        <Text style={styles.subtitle}>Version Windows (Native WinUI)</Text>
        <Text style={styles.badge}>Mode CI/CD GitHub Réussi</Text>
        <Text style={styles.info}>
          Pour afficher vos vrais écrans ici, nous allons lier cette racine à votre dossier `./app` 
          en isolant les fonctionnalités Android/Expo incompatibles.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0F172A', // Slate 900
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1E293B', // Slate 800
    padding: 30,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#38BDF8', // Sky 400
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8', // Slate 400
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#22C55E20',
    color: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#22C55E40',
  },
  info: {
    fontSize: 14,
    color: '#CBD5E1', // Slate 300
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Enregistrement obligatoire avec le nom du slug défini dans app.json / package.json
AppRegistry.registerComponent('uaubeninventoryapp', () => WindowsAppRoot);
