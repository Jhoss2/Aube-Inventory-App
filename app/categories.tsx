import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  StyleSheet, 
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, X, Search, Check } from 'lucide-react-native';
import { useAppContext } from '@/lib/app-context';

export default function CategoriesScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string, roomName: string }>();
  
  const { appData, setAppData } = useAppContext() as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Catégories par défaut
  const defaultCategories = ['FOURNITURES BUREAUTIQUES', 'FOURNITURES PÉDAGOGIQUES', 'RESSOURCES LOGISTIQUES', 'VERDURE', 'NETTOYAGE'];

  const allCategories = useMemo(() => {
    const userCats = appData.customCategories || [];
    const combined = [...defaultCategories, ...userCats];
    return Array.from(new Set(combined.map(c => c.toUpperCase()))).sort();
  }, [appData.customCategories]);

  const filteredCategories = allCategories.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    const name = newCategoryName.trim().toUpperCase();
    if (!name) {
      setShowAddInput(false);
      return;
    }
    
    if (allCategories.includes(name)) {
      Alert.alert("Erreur", "Cette catégorie existe déjà.");
      return;
    }

    const currentCustom = appData.customCategories || [];
    setAppData({
      ...appData,
      customCategories: [...currentCustom, name]
    });

    setNewCategoryName('');
    setShowAddInput(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER ROUGE PILL (Style Sidebar) */}
        <View style={[styles.redHeaderPill, styles.glowBlack]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={28} color="white" />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitleText, styles.boldSerifItalic]}>CATÉGORIES</Text>
          
          <TouchableOpacity onPress={() => setShowAddInput(!showAddInput)} style={styles.backBtn}>
            {showAddInput ? <X size={26} color="white" /> : <Plus size={26} color="white" />}
          </TouchableOpacity>
        </View>

        {/* INPUT D'AJOUT DYNAMIQUE (TOUT EN GRAS) */}
        {showAddInput && (
          <View style={styles.addContainer}>
            <TextInput
              autoFocus
              placeholder="NOUVELLE CATÉGORIE..."
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholderTextColor="#94A3B8"
              style={[styles.addInput, styles.glowBlack, styles.boldSerifItalic]}
            />
            <TouchableOpacity 
              onPress={handleAddCategory}
              style={[styles.checkBtn, styles.glowBlack]}
            >
              <Check size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* BARRE DE RECHERCHE */}
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="RECHERCHER..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, styles.boldSerifItalic]}
          />
        </View>

        {/* LISTE DES BOUTONS (GRAS MAXIMUM) */}
        <View style={styles.listContainer}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.catBtn, styles.glowBlack]}
                onPress={() => router.push({
                  pathname: '/add-material',
                  params: { roomId, roomName, category }
                })}
              >
                <Text style={[styles.catBtnText, styles.boldSerifItalic]}>{category}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, styles.boldSerifItalic]}>AUCUNE CATÉGORIE TROUVÉE</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE4E8' },
  scrollContent: { padding: 25, paddingTop: 55, paddingBottom: 40 },
  
  // STYLE CENTRALISÉ : SERIF + GRAS MAXIMUM
  boldSerifItalic: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontWeight: '900',
    fontStyle: 'italic',
  },

  redHeaderPill: { 
    backgroundColor: '#8B0000', 
    height: 55, 
    borderRadius: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15,
    marginBottom: 35
  },
  backBtn: { padding: 5 },
  headerTitleText: { 
    color: 'white', 
    fontSize: 20, 
    letterSpacing: 3,
    textTransform: 'uppercase'
  },

  addContainer: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  addInput: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 50, 
    paddingHorizontal: 20, 
    height: 55, 
    fontSize: 16,
    color: '#1A237E' 
  },
  checkBtn: { 
    backgroundColor: '#059669', 
    width: 55, 
    height: 55, 
    borderRadius: 27.5, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 50, 
    paddingHorizontal: 20, 
    height: 50, 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'white'
  },
  searchInput: { flex: 1, color: '#1A237E', fontSize: 16 },

  listContainer: { gap: 18 },
  catBtn: { 
    backgroundColor: 'white', 
    paddingVertical: 20, 
    borderRadius: 50, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#FCE7F3' 
  },
  catBtnText: { 
    color: '#1A237E', 
    fontSize: 16, 
    letterSpacing: 2.5,
    textTransform: 'uppercase'
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#94A3B8', 
    marginTop: 40, 
    fontSize: 16, 
    letterSpacing: 1.5,
    textTransform: 'uppercase'
  },

  glowBlack: {
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  }
});
    
