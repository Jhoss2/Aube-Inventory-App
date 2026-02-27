import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function AboutDevScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const aboutPdfUri = appData.settings?.aboutPdf;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#8B1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DÉVELOPPEUR</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color="white" />
          </View>
          <Text style={styles.devName}>Équipe de Développement</Text>
          <Text style={styles.devRole}>Université Aube Nouvelle</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>PROJET</Text>
          <Text style={styles.description}>
            U-AUBEN Supplies Tracker est une application conçue pour digitaliser l'inventaire 
            et le suivi du matériel au sein des différents campus de l'université.
          </Text>
        </View>

        {aboutPdfUri && (
          <TouchableOpacity 
            style={styles.pdfButton} 
            onPress={() => Linking.openURL(aboutPdfUri)}
          >
            <Feather name="file-text" size={20} color="white" />
            <Text style={styles.pdfButtonText}>Consulter la fiche technique (PDF)</Text>
          </TouchableOpacity>
        )}

        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>CONTACT</Text>
          <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('mailto:support@u-auben.bf')}>
            <Feather name="mail" size={20} color="#1D3583" />
            <Text style={styles.contactText}>support@u-auben.bf</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { width: 40 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#8B1A1A' },
  scrollContent: { padding: 25, alignItems: 'center' },
  profileSection: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1D3583', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  devName: { fontSize: 20, fontWeight: 'bold' },
  devRole: { fontSize: 14, color: '#666' },
  infoCard: { width: '100%', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 15, marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#1D3583', marginBottom: 10, letterSpacing: 1 },
  description: { fontSize: 14, color: '#444', lineHeight: 20 },
  pdfButton: { flexDirection: 'row', width: '100%', backgroundColor: '#8B1A1A', padding: 18, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 20 },
  pdfButtonText: { color: 'white', fontWeight: 'bold' },
  contactSection: { width: '100%' },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#eee', borderRadius: 10 },
  contactText: { marginLeft: 15, fontWeight: '600' }
});
