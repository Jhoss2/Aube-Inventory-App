import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Structure complète et synchronisée
interface AppSettings {
  // Images Générales
  univImage?: string;
  bgImage?: string;
  menuBg?: string;   
  menuLogo?: string; 

  // Sécurité & Authentification (Nouveau)
  authBgImage?: string;
  authBlur?: number;

  // Affiches (Remplacent les PDF)
  guidePoster?: string;
  aboutPoster?: string;

  // Images des Blocs (A à F) - Utilisées par l'écran dynamique [id].tsx
  [key: string]: any; // Permet l'accès dynamique blocA_aerial, etc.
}

interface AppData {
  settings: AppSettings;
  notes: any[];
}

interface AppContextType {
  appData: AppData;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addNote: (note: any) => Promise<void>;
  updateNote: (id: string, updatedNote: any) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>({
    settings: {
      authBlur: 20, // Valeur par défaut
    },
    notes: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('aube_inventory_data');
      if (savedData) {
        setAppData(JSON.parse(savedData));
      }
    } catch (e) {
      console.error("Erreur de chargement", e);
    }
  };

  const saveData = async (newData: AppData) => {
    try {
      await AsyncStorage.setItem('aube_inventory_data', JSON.stringify(newData));
    } catch (e) {
      console.error("Erreur de sauvegarde", e);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedData = {
      ...appData,
      settings: { ...appData.settings, ...newSettings }
    };
    setAppData(updatedData);
    await saveData(updatedData);
  };

  const addNote = async (note: any) => {
    const updatedData = {
      ...appData,
      notes: [note, ...appData.notes]
    };
    setAppData(updatedData);
    await saveData(updatedData);
  };

  const updateNote = async (id: string, updatedFields: any) => {
    const updatedNotes = appData.notes.map(note => 
      note.id === id ? { ...note, ...updatedFields } : note
    );
    const updatedData = { ...appData, notes: updatedNotes };
    setAppData(updatedData);
    await saveData(updatedData);
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = appData.notes.filter(note => note.id !== id);
    const updatedData = { ...appData, notes: updatedNotes };
    setAppData(updatedData);
    await saveData(updatedData);
  };

  return (
    <AppContext.Provider value={{ 
      appData, 
      updateSettings, 
      addNote, 
      updateNote, 
      deleteNote 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
