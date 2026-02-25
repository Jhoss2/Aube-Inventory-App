import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db, initializeDatabase, getAubeKb, saveAubeKb } from './database';

export interface Bloc {
  mainImage: string;
  subBlocs: Array<{
    id: string;
    title: string;
    imageTitle: string;
    image: string;
  }>;
}

export interface Salle {
  id: string;
  nom: string;
  emplacement: string;
  niveau: string;
  capacity?: string;
  area?: string;
  photoId?: string;
  plan3dId?: string;
}

export interface Materiel {
  id: string;
  salleId: string;
  nom: string;
  categorie?: string;
  dateRen?: string;
  photoId?: string;
  status?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Alert {
  id: string;
  materielId?: string;
  type: string;
  message: string;
  date: string;
  read: boolean;
}

export interface AppData {
  general: {
    mainBuildingImage: string;
    mainBgUrl: string | null;
    appIconUrl: string;
    menuBgUrl: string;
    menuLogoUrl: string;
  };
  blocs: Record<string, Bloc>;
  salles: Salle[];
  defaultCategories: string[];
  customCategories: string[];
  materiel: Materiel[];
  notes: Note[];
  alerts: Alert[];
  aube: {
    kb: string;
    hasNewNotification: boolean;
  };
}

interface AppContextType {
  appData: AppData;
  updateAppData: (updates: Partial<AppData>) => Promise<void>;
  addSalle: (salle: Salle) => Promise<void>;
  updateSalle: (id: string, updates: Partial<Salle>) => Promise<void>;
  deleteSalle: (id: string) => Promise<void>;
  addMateriel: (materiel: Materiel) => Promise<void>;
  updateMateriel: (id: string, updates: Partial<Materiel>) => Promise<void>;
  deleteMateriel: (id: string) => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addAlert: (alert: Alert) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  updateAubeKb: (kb: string) => Promise<void>;
  loadData: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultData: AppData = {
  general: {
    mainBuildingImage: 'https://placehold.co/400x220/3b82f6/ffffff?text=Université',
    mainBgUrl: null,
    appIconUrl: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚚</text></svg>',
    menuBgUrl: 'https://placehold.co/420x900/1e3a8a/ffffff?text=Arrière-plan',
    menuLogoUrl: 'https://placehold.co/80x80/ffffff/7f1d1d?text=Logo',
  },
  blocs: {
    A: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+Aérienne+A',
      subBlocs: [
        { id: 'A1', title: 'A1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/3b82f6/ffffff?text=Salles+A1' },
        { id: 'A2', title: 'A2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/3b82f6/ffffff?text=Bureaux+A2' },
      ],
    },
    B: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+Aérienne+B',
      subBlocs: [
        { id: 'B1', title: 'B1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/16a34a/ffffff?text=Salles+B1' },
        { id: 'B2', title: 'B2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/16a34a/ffffff?text=Bureaux+B2' },
      ],
    },
    C: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+Aérienne+C',
      subBlocs: [
        { id: 'C1', title: 'C1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/f59e0b/ffffff?text=Salles+C1' },
        { id: 'C2', title: 'C2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/f59e0b/ffffff?text=Bureaux+C2' },
      ],
    },
    D: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+Aérienne+D',
      subBlocs: [
        { id: 'D1', title: 'Box Sécurité', imageTitle: '· Box Sécurité ·', image: 'https://placehold.co/400x220/c026d3/ffffff?text=Box+D1' },
        { id: 'D2', title: 'Parking', imageTitle: '· Parking ·', image: 'https://placehold.co/400x220/64748b/ffffff?text=Parking+D2' },
      ],
    },
    E: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+Aérienne+E',
      subBlocs: [
        { id: 'E1', title: 'Toilettes', imageTitle: '· Toilettes ·', image: 'https://placehold.co/400x220/ea580c/ffffff?text=Toilettes+E1' },
        { id: 'E2', title: 'Jardins', imageTitle: '· Jardins ·', image: 'https://placehold.co/400x220/22c55e/ffffff?text=Jardins+E2' },
      ],
    },
    F: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+Aérienne+F',
      subBlocs: [],
    },
  },
  salles: [],
  defaultCategories: [
    'Ampoules', 'Armoires', 'Balais', 'Baies de brassage', 'Bouilloires', 'Bureaux', 'Câbles', 'Cafetières',
    'Canapés', 'Chaises', 'Claviers', 'Climatiseurs', 'Coussins', 'Disques durs', 'Extincteurs', 'Fauteuils',
    'Horloges', 'Imprimantes', 'Lampes', 'Micro-ondes', 'Multiprises', 'Ordinateurs', 'Papier', 'Photocopieurs',
    'Plantes', 'Post-it', 'Poubelles', 'Prises', 'Produits', 'Rallonges', 'Rideaux', 'Routeurs', 'Réfrigérateurs',
    'Scanners', 'Serpillères', 'Savon', 'Souris', 'Tables', 'Tableaux', 'Tapis', 'Téléphones', 'Vaisselle',
    'Ventilateurs', 'Vidéoprojecteurs', 'Écrans', 'Étagères',
  ],
  customCategories: [],
  materiel: [],
  notes: [],
  alerts: [],
  aube: {
    kb: 'Je suis Aube, l\'assistant logistique.',
    hasNewNotification: false,
  },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<AppData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await initializeDatabase();

      const savedData = await AsyncStorage.getItem('logisticsAppData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setAppData({
          ...defaultData,
          ...parsed,
          general: { ...defaultData.general, ...parsed.general },
          blocs: { ...defaultData.blocs, ...parsed.blocs },
          salles: Array.isArray(parsed.salles) ? parsed.salles : [],
          materiel: Array.isArray(parsed.materiel) ? parsed.materiel : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
          aube: { ...defaultData.aube, ...parsed.aube },
        });
      } else {
        setAppData(defaultData);
      }

      // Load Aube KB from database
      const aubeKb = await getAubeKb();
      setAppData((prev) => ({
        ...prev,
        aube: { ...prev.aube, kb: aubeKb },
      }));
    } catch (error) {
      console.error('Error loading data:', error);
      setAppData(defaultData);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToStorage = async (data: AppData) => {
    try {
      await AsyncStorage.setItem('logisticsAppData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  };

  const updateAppData = async (updates: Partial<AppData>) => {
    const newData = { ...appData, ...updates };
    setAppData(newData);
    await saveToStorage(newData);
  };

  const addSalle = async (salle: Salle) => {
    const newData = { ...appData, salles: [...appData.salles, salle] };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync(
        `INSERT INTO salles (id, nom, emplacement, niveau, capacity, area, photoId, plan3dId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [salle.id, salle.nom, salle.emplacement, salle.niveau, salle.capacity || '', salle.area || '', salle.photoId || '', salle.plan3dId || '']
      );
    } catch (error) {
      console.error('Error adding salle to DB:', error);
    }
  };

  const updateSalle = async (id: string, updates: Partial<Salle>) => {
    const newSalles = appData.salles.map((s) => (s.id === id ? { ...s, ...updates } : s));
    const newData = { ...appData, salles: newSalles };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      const updateFields = Object.entries(updates)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(updates), id];
      await db.runAsync(`UPDATE salles SET ${updateFields} WHERE id = ?`, values);
    } catch (error) {
      console.error('Error updating salle in DB:', error);
    }
  };

  const deleteSalle = async (id: string) => {
    const newSalles = appData.salles.filter((s) => s.id !== id);
    const newMateriel = appData.materiel.filter((m) => m.salleId !== id);
    const newData = { ...appData, salles: newSalles, materiel: newMateriel };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync('DELETE FROM salles WHERE id = ?', [id]);
      await db.runAsync('DELETE FROM materiel WHERE salleId = ?', [id]);
    } catch (error) {
      console.error('Error deleting salle from DB:', error);
    }
  };

  const addMateriel = async (materiel: Materiel) => {
    const newData = { ...appData, materiel: [...appData.materiel, materiel] };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync(
        `INSERT INTO materiel (id, salleId, nom, categorie, dateRen, photoId, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [materiel.id, materiel.salleId, materiel.nom, materiel.categorie || '', materiel.dateRen || '', materiel.photoId || '', materiel.status || 'active']
      );
    } catch (error) {
      console.error('Error adding materiel to DB:', error);
    }
  };

  const updateMateriel = async (id: string, updates: Partial<Materiel>) => {
    const newMateriel = appData.materiel.map((m) => (m.id === id ? { ...m, ...updates } : m));
    const newData = { ...appData, materiel: newMateriel };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      const updateFields = Object.entries(updates)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(updates), id];
      await db.runAsync(`UPDATE materiel SET ${updateFields} WHERE id = ?`, values);
    } catch (error) {
      console.error('Error updating materiel in DB:', error);
    }
  };

  const deleteMateriel = async (id: string) => {
    const newMateriel = appData.materiel.filter((m) => m.id !== id);
    const newData = { ...appData, materiel: newMateriel };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync('DELETE FROM materiel WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting materiel from DB:', error);
    }
  };

  const addNote = async (note: Note) => {
    const newData = { ...appData, notes: [...appData.notes, note] };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync(
        `INSERT INTO notes (id, title, content, date) VALUES (?, ?, ?, ?)`,
        [note.id, note.title, note.content, note.date]
      );
    } catch (error) {
      console.error('Error adding note to DB:', error);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const newNotes = appData.notes.map((n) => (n.id === id ? { ...n, ...updates } : n));
    const newData = { ...appData, notes: newNotes };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      const updateFields = Object.entries(updates)
        .map(([key]) => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(updates), id];
      await db.runAsync(`UPDATE notes SET ${updateFields} WHERE id = ?`, values);
    } catch (error) {
      console.error('Error updating note in DB:', error);
    }
  };

  const deleteNote = async (id: string) => {
    const newNotes = appData.notes.filter((n) => n.id !== id);
    const newData = { ...appData, notes: newNotes };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting note from DB:', error);
    }
  };

  const addAlert = async (alert: Alert) => {
    const newData = { ...appData, alerts: [alert, ...appData.alerts] };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync(
        `INSERT INTO alerts (id, materielId, type, message, date, read) VALUES (?, ?, ?, ?, ?, ?)`,
        [alert.id, alert.materielId || '', alert.type, alert.message, alert.date, alert.read ? 1 : 0]
      );
    } catch (error) {
      console.error('Error adding alert to DB:', error);
    }
  };

  const deleteAlert = async (id: string) => {
    const newAlerts = appData.alerts.filter((a) => a.id !== id);
    const newData = { ...appData, alerts: newAlerts };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await db.runAsync('DELETE FROM alerts WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting alert from DB:', error);
    }
  };

  const updateAubeKb = async (kb: string) => {
    const newData = { ...appData, aube: { ...appData.aube, kb } };
    setAppData(newData);
    await saveToStorage(newData);

    try {
      await saveAubeKb(kb);
    } catch (error) {
      console.error('Error saving Aube KB:', error);
    }
  };

  const value: AppContextType = {
    appData,
    updateAppData,
    addSalle,
    updateSalle,
    deleteSalle,
    addMateriel,
    updateMateriel,
    deleteMateriel,
    addNote,
    updateNote,
    deleteNote,
    addAlert,
    deleteAlert,
    updateAubeKb,
    loadData,
    isLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
