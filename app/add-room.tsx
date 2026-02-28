import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function AddRoomScreen() {
  const router = useRouter();
  
  // Cast du contexte en "any" pour éviter l'erreur TS sur addSalle
  const context = useAppContext();
  const { addSalle } = context as any;
  
  // États du formulaire
  const [nom, setNom] = useState('');
  const [emplacement, setEmplacement] = useState('');
  const [niveau, setNiveau] = useState('');
  const [capacity, setCapacity] = useState('');
  const [area, setArea] = useState('');

  const handleSaveRoom = async () => {
    if (!nom.trim()) {
      Alert.alert("Erreur", "Le nom de la salle est obligatoire");
      return;
    }

    const newRoom = {
      nom: nom.trim(),
      emplacement: emplacement.trim(),
      niveau: niveau.trim(),
      capacity: capacity.trim(),
      area: area.trim(),
      image: null,
    };

    try {
      if (addSalle) {
        await addSalle(new
