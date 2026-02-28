import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ImageViewerScreen() {
  const router = useRouter();
  const { imageUrl } = useLocalSearchParams(); // On récupère l'image passée en paramètre

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Image 
        source={{ uri: imageUrl as string }} 
        style={styles.fullImage} 
        resizeMode="contain" // "contain" pour voir l'intégralité du plan sans rognage
      />

      {/* Bouton retour flottant et translucide */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fullImage: { width: width, height: height },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Translucide
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10
  }
});
