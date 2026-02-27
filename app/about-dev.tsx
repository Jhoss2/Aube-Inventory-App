import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview'; // Assure-toi d'avoir installé react-native-webview
import { useAppContext } from '@/lib/app-context';

export default function AboutDevScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  
  // Récupération du lien PDF chargé dans les paramètres (si présent)
  const aboutPdfUri = appData.settings?.aboutPdf;

  return (
    <View style={styles.container}>
      {/* HEADER PROFESSIONNEL */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#8B1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À PROPOS DU DÉVELOPPEUR</Text>
      </View>

      {/* AFFICHAGE DU CONTENU */}
      {aboutPdfUri ? (
        // Si un PDF est chargé dans les paramètres, on l'affiche
        <WebView 
          source={{ uri: aboutPdfUri }} 
          style={{ flex: 1 }} 
          startInLoadingState={true}
        />
      ) : (
        // Sinon, on affiche une page de présentation stylisée par défaut
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-code" size={60} color="white" />
            </View>
            <Text style={styles.devName}>Développeur Principal</Text>
            <Text style={styles.devRole}>Full-Stack Developer & UI/UX Designer</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>MISSION</Text>
            <Text style={styles.description}>
              Concevoir des solutions numériques innovantes pour l'Université Aube Nouvelle, 
              visant à simplifier la gestion des inventaires et à optimiser le suivi des ressources.
            </Text>
          </View>

          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>CONTACT & RÉSEAUX</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:contact@u-auben.bf')}>
              <Feather name="mail" size={20} color="#1D3583" />
              <Text style={styles.contactText}>contact@u-auben.bf</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem}>
              <Feather name="globe" size={20} color="#1D3583" />
              <Text style={styles.contactText}>www.u-auben.bf</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>U-AUBEN SUPPLIES TRACKER</Text>
            <Text style={styles.versionText}>Version 1.1.1 - 2026</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 50, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 15, fontWeight: '900', color: '#8B1A1A', letterSpacing: 1 },
  
  scrollContent: { padding: 25, alignItems: 'center' },
  
  profileSection: { alignItems: 'center', marginBottom: 35 },
  avatarContainer: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#1D3583', 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 10,
    marginBottom: 20
  },
  devName: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  devRole: { fontSize: 14, color: '#666', marginTop: 5 },

  infoCard: { 
    width: '100%', 
    backgroundColor: '#f8f9fa', 
    padding: 20, 
    borderRadius: 15, 
    borderLeftWidth: 5, 
    borderLeftColor: '#8B1A1A',
    marginBottom: 25
  },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#1D3583', letterSpacing: 2, marginBottom: 15 },
  description: { fontSize: 15, color: '#444', lineHeight: 22 },

  contactSection: { width: '100%', marginBottom: 40 },
  contactItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  contactText: { marginLeft: 15, fontSize: 14, color: '#333', fontWeight: '500' },

  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 10, fontWeight: 'bold', color: '#ccc', letterSpacing: 1 },
  versionText: { fontSize: 10, color: '#ddd', marginTop: 5 }
});
