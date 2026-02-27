import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function GuideViewerScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const guideUri = appData.settings?.guidePdf;

  const openPdf = async () => {
    if (guideUri) {
      try {
        await Linking.openURL(guideUri);
      } catch (error) {
        Alert.alert("Erreur", "Impossible d'ouvrir le lecteur PDF de la tablette.");
      }
    } else {
      Alert.alert("Info", "Aucun fichier PDF n'a été configuré.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1D3583" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GUIDE D'UTILISATION</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Feather name="book-open" size={50} color={guideUri ? "#8B1A1A" : "#ccc"} />
          </View>
          
          <Text style={styles.title}>
            {guideUri ? "Manuel d'utilisation prêt" : "Guide non configuré"}
          </Text>
          
          <Text style={styles.description}>
            {guideUri 
              ? "Le guide complet est disponible en version PDF. Cliquez ci-dessous pour le consulter avec le lecteur de votre tablette."
              : "Veuillez charger le fichier PDF du guide dans l'écran des Paramètres (section Documents)."}
          </Text>

          {guideUri && (
            <TouchableOpacity style={styles.mainBtn} onPress={openPdf}>
              <Feather name="external-link" size={18} color="white" />
              <Text style={styles.mainBtnText}>LIRE LE GUIDE PDF</Text>
            </TouchableOpacity>
          )}

          {!guideUri && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/settings')}>
              <Text style={styles.secondaryBtnText}>Aller aux Paramètres</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, backgroundColor: 'white', elevation: 2 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1D3583', marginLeft: 10 },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 4 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  description: { textAlign: 'center', color: '#666', lineHeight: 22, marginBottom: 30 },
  mainBtn: { flexDirection: 'row', backgroundColor: '#8B1A1A', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 12, alignItems: 'center', gap: 10 },
  mainBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: { padding: 10 },
  secondaryBtnText: { color: '#1D3583', fontWeight: '600' }
});
