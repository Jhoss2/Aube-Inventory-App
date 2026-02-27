import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview'; // Indispensable pour lire le PDF
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function GuideViewerScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  
  // Récupération du chemin du PDF défini dans les paramètres
  const guideUri = appData.settings?.guidePdf;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* HEADER FIXE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1D3583" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>GUIDE D'UTILISATION</Text>
          <Text style={styles.headerSubtitle}>U-AUBEN Supplies Tracker</Text>
        </View>
        <Feather name="book-open" size={22} color="#8B1A1A" />
      </View>

      {/* ZONE D'AFFICHAGE DU CONTENU */}
      <View style={styles.content}>
        {guideUri ? (
          <WebView 
            source={{ uri: guideUri }} 
            style={{ flex: 1 }}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        ) : (
          /* DESIGN SI PAS DE PDF CHARGÉ */
          <View style={styles.emptyState}>
            <View style={styles.iconCircle}>
              <Feather name="file-text" size={50} color="#8B1A1A" />
            </View>
            <Text style={styles.emptyTitle}>Aucun guide disponible</Text>
            <Text style={styles.emptyDescription}>
              Le guide d'utilisation (format PDF) n'a pas encore été chargé dans les paramètres de l'application.
            </Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.actionButtonText}>Aller aux paramètres</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  titleContainer: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#1D3583', letterSpacing: 1 },
  headerSubtitle: { fontSize: 10, color: '#666', marginTop: 2 },

  content: { flex: 1 },

  // Styles de l'état vide
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  iconCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(139, 26, 26, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20 
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  emptyDescription: { textAlign: 'center', color: '#777', lineHeight: 20, marginBottom: 30 },
  
  actionButton: { 
    backgroundColor: '#1D3583', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 12,
    elevation: 2 
  },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
