import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

// Activation de l'animation pour Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const context = useAppContext();
  const { appData, updateAppData } = context as any;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const data = appData as any;

  // Fusionner et trier les catégories
  const allCategories = useMemo(() => {
    const defaults = data?.defaultCategories || ['Mobilier', 'Informatique', 'Climatisation', 'Éclairage'];
    const customs = data?.customCategories || [];
    const combined = [...defaults, ...customs] as string[];
    return Array.from(new Set(combined)).sort((a, b) => a.localeCompare(b));
  }, [data?.defaultCategories, data?.customCategories]);

  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAddInput = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAddInput(!showAddInput);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toggleAddInput();
      return;
    }
    
    if (allCategories.some(c => c.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert("Erreur", "Cette catégorie existe déjà.");
      return;
    }

    try {
      const updatedCustom = [...(data?.customCategories || []), newCategoryName.trim()];
      await updateAppData({ ...data, customCategories: updatedCustom });
      setNewCategoryName('');
      setShowAddInput(false);
      Alert.alert("Succès", "Catégorie ajoutée");
    } catch (err) {
      Alert.alert("Erreur", "Impossible de sauvegarder la catégorie");
    }
  };

  const handleDeleteCategory = (catName: string) => {
    Alert.alert(
      "Supprimer",
      `Voulez-vous supprimer la catégorie "${catName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            const updatedCustom = (data?.customCategories || []).filter((c: string) => c !== catName);
            const updatedDefault = (data?.defaultCategories || []).filter((c: string) => c !== catName);
            await updateAppData({ 
              ...data, 
              customCategories: updatedCustom,
              defaultCategories: updatedDefault 
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', fontWeight: '900', color: '#1D3583', fontSize: 18, letterSpacing: 1 }}>
          CATÉGORIES
        </Text>
        <TouchableOpacity onPress={toggleAddInput} style={{ padding: 8 }}>
          <Ionicons name={showAddInput ? "close-circle" : "add-circle"} size={32} color={showAddInput ? "#B21F18" : "#1D3583"} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 20 }}>
        
        {/* Champ d'ajout dynamique (masqué par défaut) */}
        {showAddInput && (
          <View style={{ marginBottom: 20, flexDirection: 'row', gap: 10 }}>
            <TextInput
              autoFocus
              placeholder="Nom de la nouvelle catégorie..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={{ flex: 1, backgroundColor: 'white', borderRadius: 15, paddingHorizontal: 20, height: 55, borderWidth: 1, borderColor: '#1D3583' }}
            />
            <TouchableOpacity 
              onPress={handleAddCategory}
              style={{ backgroundColor: '#1D3583', width: 55, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="checkmark" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Barre de Recherche */}
        <View style={{ position: 'relative', marginBottom: 20 }}>
          <View style={{ position: 'absolute', insetY: 0, left: 15, zIndex: 10, justifyContent: 'center' }}>
            <Ionicons name="search" size={20} color="#9ca3af" />
          </View>
          <TextInput
            placeholder="Rechercher une catégorie..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ w: '100%', backgroundColor: '#EDF0F5', borderRadius: 20, py: 15, paddingVertical: 14, paddingLeft: 50, paddingRight: 20, color: '#374151' }}
          />
        </View>

        {/* Liste des Catégories */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: 'white', borderRadius: 30, borderWeight: 1, borderColor: '#f3f4f6', marginBottom: 20 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <View 
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, paddingVertical: 20, borderBottomWidth: index !== filteredCategories.length - 1 ? 1 : 0, borderBottomColor: '#f3f4f6' }}
              >
                <TouchableOpacity 
                  style={{ flex: 1 }}
                  onPress={() => router.push({
                    pathname: '/add-item',
                    params: { salleId, category }
                  })}
                >
                  <Text style={{ color: '#374151', fontWeight: '700', fontSize: 16 }}>{category}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => handleDeleteCategory(category)} style={{ padding: 5, marginRight: 10 }}>
                    <Ionicons name="trash-outline" size={20} color="#d1d5db" />
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={20} color="#1D3583" />
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Aucune catégorie trouvée</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
                           }
