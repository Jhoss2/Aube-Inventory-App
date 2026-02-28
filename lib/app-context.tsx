import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Structure mise à jour pour inclure les Affiches (Posters) à la place des PDF
interface AppSettings {
  // Images Générales
  univImage?: string;
  bgImage?: string;
  menuBg?: string;   
  menuLogo?: string; 

  // Affiches (Remplacent les PDF)
  guidePoster?: string; // Image du guide
  aboutPoster?: string; // Image à propos

  // Images des Blocs (A à F)
  blocA_aerial?: string; blocA_sub1?: string; blocA_sub2?: string;
  blocB_aerial?: string; blocB_sub1?: string; blocB_sub2?: string;
  blocC_aerial?: string; blocC_sub1?: string; blocC_sub2?: string;
  blocD_aerial?: string; blocD_sub1?: string; blocD_sub2?: string;
  blocE_aerial?: string; blocE_sub1?: string; blocE_sub2?: string;
  blocF_aerial?: string; blocF_sub1?: string; blocF_sub2?: string;
}

interface AppData {
  settings: AppSettings;
  notes: any[];
}

interface AppContextType {
  appData: AppData;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addNote: (note: any) => Promise<void>;
  updateNote: (id: string, updatedNote: any) => Promise<void>; // Ajouté pour fixer ton bug de mise à jour
  deleteNote: (id: string) => Promise<void>; // Ajouté pour fixer ton bug de suppression
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>({
    settings: {},
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

  // --- NOUVELLE FONCTION : Mise à jour d'une note ---
  const updateNote = async (id: string, updatedFields: any) => {
    const updatedNotes = appData.notes.map(note => 
      note.id === id ? { ...note, ...updatedFields } : note
    );
    const updatedData = { ...appData, notes: updatedNotes };
    setAppData(updatedData);
    await saveData(updatedData);
  };

  // --- NOUVELLE FONCTION : Suppression d'une note ---
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
