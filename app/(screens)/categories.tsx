import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/lib/app-context';

export default function CategoriesScreen() {
  const router = useRouter();
  const { salleId } = useLocalSearchParams<{ salleId: string }>();
  const { appData, updateAppData } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fusionner les catégories par défaut et les catégories personnalisées de SQLite
  const allCategories = useMemo(() => {
    const combined = [...appData.defaultCategories, ...(appData.customCategories || [])];
    return combined.sort((a, b) => a.localeCompare(b));
  }, [appData.defaultCategories, appData.customCategories]);

  // Filtrage pour la recherche
  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter une catégorie
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    if (allCategories.includes(newCategoryName.trim())) {
      Alert.alert("Erreur", "Cette catégorie existe déjà.");
      return;
    }

    const updatedCustom = [...(appData.customCategories || []), newCategoryName.trim()];
    await updateAppData({ ...appData, customCategories: updatedCustom });
    setNewCategoryName('');
    setIsAddModalVisible(false);
  };

  // Supprimer une catégorie (uniquement les personnalisées pour éviter de casser le système)
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
            const updatedCustom = (appData.customCategories || []).filter(c => c !== catName);
            const updatedDefault = appData.defaultCategories.filter(c => c !== catName);
            await updateAppData({ 
              ...appData, 
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
      <View className="px-4 pt-2 flex-row items-center bg-white border-b border-gray-100 pb-4 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#4b5563" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-black text-[#1D3583] text-xl uppercase tracking-wider">
          CATÉGORIES
        </Text>
        {/* Bouton pour ouvrir le modal d'ajout */}
        <TouchableOpacity onPress={() => setIsAddModalVisible(true)} className="p-2">
          <Ionicons name="add-circle" size={30} color="#1D3583" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pt-6">
        
        {/* Barre de Recherche */}
        <View className="relative mb-6">
          <View className="absolute inset-y-0 left-5 z-10 justify-center">
            <Ionicons name="search" size={20} color="#9ca3af" />
          </View>
          <TextInput
            placeholder="Rechercher..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="w-full bg-[#EDF0F5] rounded-2xl py-4 pl-14 pr-6 text-gray-700"
          />
        </View>

        {/* Liste des Catégories */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          className="bg-white rounded-[30px] shadow-sm border border-gray-50 mb-10"
        >
          {filteredCategories.map((category, index) => (
            <View 
              key={index}
              className={`flex-row items-center justify-between px-8 py-5 ${
                index !== filteredCategories.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <TouchableOpacity 
                className="flex-1"
                onPress={() => router.push({
                  pathname: '/screens/add-materiel',
                  params: { salleId, category }
                })}
              >
                <Text className="text-gray-700 font-bold text-base">{category}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDeleteCategory(category)} className="ml-4">
                <Ionicons name="trash-outline" size={18} color="#d1d5db" />
              </TouchableOpacity>
              
              <Ionicons name="chevron-forward" size={20} color="#d1d5db" className="ml-2" />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Modal d'ajout de catégorie */}
      <Modal visible={isAddModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-[30px] p-6 shadow-2xl">
            <Text className="text-[#1D3583] font-bold text-lg mb-4 text-center">Nouvelle Catégorie</Text>
            <TextInput
              autoFocus
              placeholder="Nom de la catégorie..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              className="bg-gray-100 rounded-xl p-4 mb-6"
            />
            <View className="flex-row gap-x-4">
              <TouchableOpacity 
                onPress={() => setIsAddModalVisible(false)}
                className="flex-1 py-4 rounded-full border border-gray-200"
              >
                <Text className="text-center font-bold text-gray-500">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddCategory}
                className="flex-1 py-4 rounded-full bg-[#1D3583]"
              >
                <Text className="text-center font-bold text-white">Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
}
