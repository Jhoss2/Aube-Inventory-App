import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function GuideViewerScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { appData } = useAppContext();

  // Récupération des images depuis les paramètres SQLite
  const displayImage = type === 'dev' 
    ? appData.settings?.devImage 
    : appData.settings?.guideImage;

  const title = type === 'dev' ? "DÉVELOPPEUR" : "GUIDE D'UTILISATION";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header Bleu Marine */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {displayImage ? (
          <Image 
            source={{ uri: displayImage }} 
            style={styles.fullImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="image-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>Aucune image configurée dans les paramètres.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1D3583',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  fullImage: {
    width: '100%',
    height: 800, // Important pour Tablette
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontWeight: 'bold'
  }
});

