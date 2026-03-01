import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [appData, setAppData] = useState({
    salles: [],
    materiels: [], // Liste plate de tout le matériel
    notes: [],
    settings: {
      assistantName: "Aube",
      assistantAvatar: "https://api.dicebear.com/7.x/bottts/png?seed=Aube&backgroundColor=f472b6",
      aubePrompt: "Tu es Aube, assistant expert de l'Université AUBEN.",
      // Ajout des clés attendues par ton HomeScreen
      univImage: null, 
      bgImage: null,
      menuBg: null,
      menuLogo: null
    },
    blocs: {
      "A": {
        mainImage: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000",
        subBlocs: [
          { id: "A1", title: "Bloc A - Niveau 1", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000", imageTitle: "Couloir A1" }
        ]
      }
      // Les autres blocs se rajoutent ici...
    }
  });

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@auben_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          // Fusionner avec l'état initial pour ne pas perdre les nouvelles clés (settings)
          setAppData(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Erreur de chargement", e);
      }
    };
    loadData();
  }, []);

  // Sauvegarder automatiquement
  const saveToStorage = async (newData: any) => {
    try {
      await AsyncStorage.setItem('@auben_data', JSON.stringify(newData));
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
    }
  };

  // --- ACTIONS PARAMÈTRES (Pour index.tsx) ---
  const updateSettings = (newSettings: any) => {
    const newData = { ...appData, settings: { ...appData.settings, ...newSettings } };
    setAppData(newData);
    saveToStorage(newData);
  };

  // --- ACTIONS MATÉRIEL (Interconnecté avec add-material.tsx) ---
  const addMateriel = (item: any) => {
    const newItem = { 
      ...item, 
      id: `mat-${Date.now()}`,
      createdAt: new Date().toISOString() 
    };
    const newData = { ...appData, materiels: [...appData.materiels, newItem] };
    setAppData(newData);
    saveToStorage(newData);
  };

  const deleteMateriel = (id: string) => {
    const newData = { ...appData, materiels: appData.materiels.filter((m: any) => m.id !== id) };
    setAppData(newData);
    saveToStorage(newData);
  };

  // --- ACTIONS NOTES ---
  const addNote = (note: any) => {
    const newData = { ...appData, notes: [{ ...note, id: `note-${Date.now()}` }, ...appData.notes] };
    setAppData(newData);
    saveToStorage(newData);
  };

  const updateNote = (id: string, updatedNote: any) => {
    const newData = {
      ...appData,
      notes: appData.notes.map((n: any) => (n.id === id ? { ...n, ...updatedNote } : n))
    };
    setAppData(newData);
    saveToStorage(newData);
  };

  const deleteNote = (id: string) => {
    const newData = { ...appData, notes: appData.notes.filter((n: any) => n.id !== id) };
    setAppData(newData);
    saveToStorage(newData);
  };

  return (
    <AppContext.Provider value={{ 
      appData, 
      updateSettings,
      addMateriel, 
      deleteMateriel, 
      addNote, 
      updateNote, 
      deleteNote 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
