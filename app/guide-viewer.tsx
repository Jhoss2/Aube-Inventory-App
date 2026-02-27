import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function GuideViewerScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const guideUri = appData.settings?.guidePdf;

  const openGuide = async () => {
    if (guideUri) {
      const supported = await Linking.canOpenURL(guideUri);
      if (supported) {
        await Linking.openURL(guideUri);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir ce fichier PDF.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1D3583" /></TouchableOpacity>
        <Text style={styles.headerTitle}>GUIDE D'UTILISATION</Text>
      </View>

      <View style={styles.emptyState}>
        <Feather name="file-text" size={80} color={guideUri ? "#16A34A" : "#ccc"} />
        <Text style={styles.emptyTitle}>
          {guideUri ? "Le guide est prêt !" : "Aucun guide chargé"}
        </Text>
        <Text style={styles.emptyDescription}>
          {guideUri 
            ? "Cliquez sur le bouton ci-dessous pour ouvrir le manuel d'utilisation." 
            : "Veuillez charger un fichier PDF dans les paramètres."}
        </Text>

        {guideUri && (
          <TouchableOpacity style={styles.actionButton} onPress={openGuide}>
            <Text style={styles.actionButtonText}>OUVRIR LE PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 20, color: '#1D3583' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptyDescription: { textAlign: 'center', color: '#666', marginTop: 10, marginBottom: 30 },
  actionButton: { backgroundColor: '#8B1A1A', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 10 },
  actionButtonText: { color: 'white', fontWeight: 'bold' }
});
