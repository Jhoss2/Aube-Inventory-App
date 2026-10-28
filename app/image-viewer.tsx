import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, StatusBar, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ImageViewerScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();

  // Gestion du responsive desktop
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image 
        source={{ uri: imageUri as string }} 
        style={[styles.fullImage, isDesktop && styles.fullImageDesktop]} 
        resizeMode="contain" 
      />
      {/* Bouton retour transparent */}
      <TouchableOpacity style={[styles.floatingBack, isDesktop && styles.floatingBackDesktop]} onPress={() => router.back()}>
        <Ionicons name="close-circle" size={45} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' },
  fullImageDesktop: { width: '85%', height: '85%' },
  floatingBack: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  floatingBackDesktop: { top: 25, left: 25 }
});
