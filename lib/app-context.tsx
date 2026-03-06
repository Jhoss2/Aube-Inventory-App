import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [appData, setAppData] = useState({
    materiels: [],
    salles: [],
    notes: [],
    customCategories: [],
    settings: {
      assistantName: "Aube",
      assistantAvatar: "https://api.dicebear.com/7.x/bottts/png?seed=Aube&backgroundColor=f472b6",
      aubePrompt: "Tu es Aube, assistant expert de l'Université AUBEN.",
      univImage: null,
      bgImage: null,
      menuBg: null,
      menuLogo: null
    },
    blocs: {
      "A": { mainImage: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000" },
      "B": { mainImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=1000" },
      "C": { mainImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000" },
      "D": { mainImage: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?q=80&w=1000" },
      "E": { mainImage: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?q=80&w=1000" },
      "F": { mainImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000" },
    }
  });

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

  // ── SETTINGS ──────────────────────────────────────────────────────────────
  const updateSettings = (newSettings: any) => {
    const newData = { ...appData, settings: { ...appData.settings, ...newSettings } };
    setAppData(newData);
    saveToStorage(newData);
  };

  // ── SALLES ────────────────────────────────────────────────────────────────
  const addSalle = (salle: any) => {
    const newData = { ...appData, salles: [...(appData.salles || []), salle] };
    setAppData(newData);
    saveToStorage(newData);
  };

  /** Supprime une salle ET tous ses matériels associés */
  const deleteRoom = (roomId: string) => {
    const newData = {
      ...appData,
      salles: (appData.salles || []).filter((s: any) => String(s.id) !== String(roomId)),
      materiels: (appData.materiels || []).filter((m: any) => String(m.roomId) !== String(roomId)),
    };
    setAppData(newData);
    saveToStorage(newData);
  };

  // ── MATÉRIELS ─────────────────────────────────────────────────────────────
  /**
   * Champs attendus dans `item` :
   *  id, roomId, nom, category, quantite, etat,
   *  marque, couleur, image, infos,
   *  dateAcquisition, dateVerification, dateRenouvellement
   */
  const addMateriel = (item: any) => {
    const newItem = {
      ...item,
      id: item.id ?? `mat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const newData = { ...appData, materiels: [...(appData.materiels || []), newItem] };
    setAppData(newData);
    saveToStorage(newData);
  };

  const updateMateriel = (id: string, updates: any) => {
    const newData = {
      ...appData,
      materiels: (appData.materiels || []).map((m: any) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    };
    setAppData(newData);
    saveToStorage(newData);
  };

  const deleteMateriel = (id: string) => {
    const newData = {
      ...appData,
      materiels: (appData.materiels || []).filter((m: any) => m.id !== id),
    };
    setAppData(newData);
    saveToStorage(newData);
  };

  // ── NOTES ─────────────────────────────────────────────────────────────────
  const addNote = (note: any) => {
    const newData = { ...appData, notes: [...(appData.notes || []), note] };
    setAppData(newData);
    saveToStorage(newData);
  };

  const updateNote = (id: string, updatedNote: any) => {
    const newData = {
      ...appData,
      notes: (appData.notes || []).map((n: any) =>
        n.id === id ? { ...n, ...updatedNote } : n
      ),
    };
    setAppData(newData);
    saveToStorage(newData);
  };

  const deleteNote = (id: string) => {
    const newData = {
      ...appData,
      notes: (appData.notes || []).filter((n: any) => n.id !== id),
    };
    setAppData(newData);
    saveToStorage(newData);
  };

  return (
    <AppContext.Provider value={{
      appData, setAppData,
      updateSettings,
      addSalle, deleteRoom,
      addMateriel, updateMateriel, deleteMateriel,
      addNote, updateNote, deleteNote,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
