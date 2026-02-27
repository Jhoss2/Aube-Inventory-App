import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, TextInput, Image, 
  ScrollView, Alert, StyleSheet, KeyboardAvoidingView, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AddRoomScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("");

  // Fonction pour ouvrir la galerie
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Accès refusé", "Désolé, nous avons besoin des permissions pour accéder à vos photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      
      {/* 1. HEADER STABILISÉ (Ne scrolle pas) */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity 
          onPress={() => router.replace('/')} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AJOUTER UNE SALLE</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 2. CONTENU SCROLLABLE */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Zone de l'image */}
          <Text style={styles.label}>PHOTO DE LA SALLE</Text>
          <TouchableOpacity 
            onPress={pickImage}
            style={styles.imagePickerContainer}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="camera" size={50} color="#1D3583" />
                <Text style={styles.placeholderText}>Appuyez pour choisir une photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Formulaire */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>NOM DE LA SALLE</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ex: Laboratoire d'Informatique"
              value={roomName}
              onChangeText={setRoomName}
            />
          </View>

          {/* Ajoute ici tes autres champs (Bloc, Étage, etc.) */}

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>ENREGISTRER LA SALLE</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    backgroundColor: '#1D3583',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    elevation: 5, // Ombre Android
    shadowColor: '#000', // Ombre iOS
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1D3583',
    marginBottom: 8,
    marginTop: 15,
  },
  imagePickerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: 'bold',
  },
  formGroup: {
    marginTop: 20,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#B21F18',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 14,
  }
});

