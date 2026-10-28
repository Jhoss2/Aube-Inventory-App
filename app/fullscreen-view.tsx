import React, { useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, StatusBar, Platform, useWindowDimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';

let ScreenOrientation: any = null;
try {
  ScreenOrientation = require('expo-screen-orientation');
} catch (e) {
  console.log("Orientation non supportée sur ce support");
}

export default function FullscreenViewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  // Gestion du responsive desktop
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  useEffect(() => {
    // Le verrouillage paysage ne concerne que les mobiles/tablettes
    if (Platform.OS !== 'web' && ScreenOrientation && ScreenOrientation.lockAsync) {
      try {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      } catch (err) {}
    }
    
    return () => {
      if (Platform.OS !== 'web' && ScreenOrientation && ScreenOrientation.unlockAsync) {
        try {
          ScreenOrientation.unlockAsync();
        } catch (err) {}
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity style={[styles.closeBtn, isDesktop && styles.closeBtnDesktop]} onPress={() => router.back()}>
        <Feather name="x" size={32} color="white" />
      </TouchableOpacity>
      
      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={[styles.img, isDesktop && styles.imgDesktop]} 
          resizeMode="contain" 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  img: { width: '100%', height: '100%' },
  imgDesktop: { width: '90%', height: '90%' },
  closeBtn: { 
    position: 'absolute', 
    top: 40, 
    right: 40, 
    zIndex: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    padding: 12, 
    borderRadius: 35 
  },
  closeBtnDesktop: {
    top: 25,
    right: 25,
  }
});
