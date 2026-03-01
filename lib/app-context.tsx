import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [appData, setAppData] = useState({
    materiels: [], // Stockage central de tout le matériel (Salles + Bureaux)
    notes: [],
    settings: {
      assistantName: "Aube",
      assistantAvatar: "https://api.dicebear.com/7.x/bottts/png?seed=Aube&backgroundColor=f472b6",
      aubePrompt: "Tu es Aube, assistant expert de l'Université AUBEN.",
      univImage: null, 
      bgImage: null,
      menuBg: null,
      menuLogo: null
    },
    // Structure renforcée pour la navigation par Blocs
    blocs: {
      "A": {
        mainImage: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000",
        sallesImage: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80",
        bureauxImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80",
        subdivisions: {
          salles: ["Amphi A", "Salle 101", "Salle 102"],
          bureaux: ["Secrétariat", "Comptabilité"]
        }
      },
      "B": {
        mainImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=1000",
        sallesImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80",
        bureauxImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80",
        subdivisions: {
          salles: ["Salle B1", "Salle B2", "Labo Info"],
          bureaux: ["Direction", "Scolarité"]
        }
      },
      // Ajoute C, D, E, F sur le même modèle...
    }
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@auben_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setAppData(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) { console.error("Erreur chargement", e); }
    };
    loadData();
  }, []);

  const saveToStorage = async (newData: any) => {
    try { await AsyncStorage.setItem('@auben_data', JSON.stringify(newData)); } 
    catch (e) { console.error("Erreur sauvegarde", e); }
  };

  // --- ACTIONS ---
  const updateSettings = (newSettings: any) => {
    const newData = { ...appData, settings: { ...appData.settings, ...newSettings } };
    setAppData(newData);
    saveToStorage(newData);
  };

  // Gestion du Matériel (Ajout/Suppression)
  const addMateriel = (item: any) => {
    const newItem = { ...item, id: `mat-${Date.now()}`, createdAt: new Date().toISOString() };
    const newData = { ...appData, materiels: [...appData.materiels, newItem] };
    setAppData(newData);
    saveToStorage(newData);
  };

  const deleteMateriel = (id: string) => {
    const newData = { ...appData, materiels: appData.materiels.filter((m: any) => m.id !== id) };
    setAppData(newData);
    saveToStorage(newData);
  };

  // Gestion des Notes
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
      deleteNote,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
