import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ImageViewerScreen() {
  const router = useRouter();
  const { imageUrl } = useLocalSearchParams(); // Récupère l'image envoyée

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Image 
        source={{ uri: imageUrl as string }} 
        style={styles.fullImage} 
        resizeMode="contain" 
      />
      {/* Bouton retour transparent */}
      <TouchableOpacity style={styles.floatingBack} onPress={() => router.back()}>
        <Ionicons name="close-circle" size={45} color="rgba(255,255,255,0.5)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  fullImage: { width: width, height: height },
  floatingBack: { position: 'absolute', top: 40, left: 20, zIndex: 10 }
});
