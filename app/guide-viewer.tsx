import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview'; // Nécessite l'installation de react-native-webview
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function GuideViewerScreen() {
  const router = useRouter();
  const { appData } = useAppContext();
  const guideUri = appData.settings?.guidePdf;

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="#1D3583" /></TouchableOpacity>
        <Text style={styles.headerTitle}>GUIDE D'UTILISATION</Text>
      </View>

      {guideUri ? (
        <WebView source={{ uri: guideUri }} style={{ flex: 1 }} />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Aucun guide n'a été chargé dans les paramètres.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 20, color: '#1D3583' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20 }
});
