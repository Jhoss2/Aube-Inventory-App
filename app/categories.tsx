import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, X, Search, Check } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string, roomName: string }>();
  const { appData, updateAppData } = useAppContext() as any;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fusion des catégories par défaut et personnalisées
  const allCategories = useMemo(() => {
    const defaults = appData?.defaultCategories || ['AMPOULES', 'PROJECTEURS', 'CHAISES', 'TABLES', 'CLIMATISATION'];
    const customs = appData?.customCategories || [];
    const combined = [...defaults, ...customs] as string[];
    return Array.from(new Set(combined.map(c => c.toUpperCase()))).sort();
  }, [appData?.defaultCategories, appData?.customCategories]);

  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAddInput = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAddInput(!showAddInput);
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim().toUpperCase();
    if (!name) {
      toggleAddInput();
      return;
    }
    
    if (allCategories.includes(name)) {
      Alert.alert("Erreur", "Cette catégorie existe déjà.");
      return;
    }

    try {
      const updatedCustom = [...(appData?.customCategories || []), name];
      await updateAppData({ ...appData, customCategories: updatedCustom });
      setNewCategoryName('');
      setShowAddInput(false);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de sauvegarder la catégorie.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER ROUGE PILL SHAPE : SANS WRAPPER BLANC */}
          <View style={styles.redHeaderPill}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitleText}>CATÉGORIES</Text>
            
            <TouchableOpacity onPress={toggleAddInput} style={styles.addIconBtn}>
              {showAddInput ? <X size={26} color="white" /> : <Plus size={26} color="white" />}
            </TouchableOpacity>
          </View>

          {/* INPUT D'AJOUT DYNAMIQUE */}
          {showAddInput && (
            <View style={styles.addContainer}>
              <TextInput
                autoFocus
                placeholder="NOUVELLE CATÉGORIE..."
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                style={styles.addInput}
                placeholderTextColor="#94A3B8"
              />
              <TouchableOpacity onPress={handleAddCategory} style={styles.checkBtn}>
                <Check size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {/* BARRE DE RECHERCHE */}
          <View style={styles.searchSection}>
            <Search size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder="RECHERCHER UNE CATÉGORIE..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* LISTE DES BOUTONS (PILL SHAPE) */}
          <View style={styles.listContainer}>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.catBtn}
                  onPress={() => router.push({
                    pathname: '/add-material',
                    params: { roomId, category, roomName }
                  })}
                >
                  <Text style={styles.catBtnText}>{category}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>AUCUNE CATÉGORIE TROUVÉE</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFE4E8' },
  container: { flex: 1 },
  scrollContent: { padding: 25, paddingTop: 30 },
  
  // Header Rouge unifié (Pill)
  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    paddingVertical: 12, 
    paddingHorizontal: 15, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8
  },
  backBtn: { padding: 5 },
  addIconBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 14, 
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  
  // Ajout dynamique
  addContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  addInput: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 50, 
    paddingHorizontal: 20, 
    height: 55, 
    elevation: 2,
    fontWeight: 'bold',
    color: '#1A237E'
  },
  checkBtn: { 
    backgroundColor: '#059669', 
    width: 55, 
    height: 55, 
    borderRadius: 27.5, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 2 
  },

  // Barre de recherche
  searchSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    borderRadius: 50, 
    paddingHorizontal: 15, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'white'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontWeight: 'bold', color: '#1A237E' },

  // Liste
  listContainer: { paddingBottom: 40 },
  catBtn: { 
    backgroundColor: '#1A237E', 
    paddingVertical: 18, 
    borderRadius: 50, 
    marginBottom: 15, 
    alignItems: 'center',
    elevation: 3
  },
  catBtnText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 13, 
    letterSpacing: 1.5 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#94A3B8', 
    marginTop: 50, 
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
});
