import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Définition de la structure de toutes nos données personnalisables
interface AppSettings {
  // Images Générales
  univImage?: string;
  bgImage?: string;
  menuBg?: string;   // Fond du Sidebar
  menuLogo?: string; // Logo du Sidebar

  // Documents PDF
  guidePdf?: string;
  aboutPdf?: string;

  // Images des Blocs (A à F)
  // Chaque bloc a une vue aérienne, une image Salles (sub1) et une image Bureaux (sub2)
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appData, setAppData] = useState<AppData>({
    settings: {},
    notes: []
  });

  // Charger les données au démarrage
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

  // Fonction pour mettre à jour les paramètres (Images, PDF, etc.)
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

  return (
    <AppContext.Provider value={{ appData, updateSettings, addNote }}>
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
