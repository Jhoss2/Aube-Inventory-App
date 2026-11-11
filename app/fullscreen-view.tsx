import React, { useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Tentative d'importation sécurisée
let ScreenOrientation: any = null;
try {
  ScreenOrientation = require('expo-screen-orientation');
} catch (e) {
  console.log("Orientation non supportée sur ce support");
}

export default function FullscreenViewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  useEffect(() => {
    // Force le paysage uniquement si le module est présent
    if (ScreenOrientation && ScreenOrientation.lockAsync) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    
    return () => {
      if (ScreenOrientation && ScreenOrientation.unlockAsync) {
        ScreenOrientation.unlockAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
        <Feather name="x" size={32} color="white" />
      </TouchableOpacity>
      
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.img} 
          resizeMode="contain" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  img: { width: '100%', height: '100%' },
  closeBtn: { 
    position: 'absolute', 
    top: 40, 
    right: 40, 
    zIndex: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 12, 
    borderRadius: 35 
  }
});
