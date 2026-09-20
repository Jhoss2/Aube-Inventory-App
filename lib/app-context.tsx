import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { invaliderCacheDonnees, invaliderCacheEntite } from '@/lib/aube-semantic-cache';

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
    invaliderCacheDonnees().catch(function() {});
  };

  const updateSalle = (id: string, updates: any) => {
    const newData = {
      ...appData,
      salles: (appData.salles || []).map((s: any) =>
        String(s.id) === String(id) ? { ...s, ...updates } : s
      ),
    };
    setAppData(newData);
    saveToStorage(newData);
    invaliderCacheDonnees().catch(function() {});
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
      id: item.id || ('mat-' + Date.now()),
      createdAt: new Date().toISOString(),
    };
    const newData = { ...appData, materiels: [...(appData.materiels || []), newItem] };
    setAppData(newData);
    saveToStorage(newData);
    invaliderCacheDonnees().catch(function() {});
  };

  const updateMateriel = (id: string, updates: any) => {
    const mat = (appData.materiels || []).find((m: any) => m.id === id);
    const newData = {
      ...appData,
      materiels: (appData.materiels || []).map((m: any) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    };
    setAppData(newData);
    saveToStorage(newData);
    invaliderCacheDonnees().catch(function() {});
    if (mat && mat.nom) invaliderCacheEntite(mat.nom).catch(function() {});
  };

  const deleteMateriel = (id: string) => {
    const mat = (appData.materiels || []).find((m: any) => m.id === id);
    const newData = {
      ...appData,
      materiels: (appData.materiels || []).filter((m: any) => m.id !== id),
    };
    setAppData(newData);
    saveToStorage(newData);
    invaliderCacheDonnees().catch(function() {});
    if (mat && mat.nom) invaliderCacheEntite(mat.nom).catch(function() {});
  };

  // ── SAUVEGARDE / TRANSFERT (sans cloud) ─────────────────────────────────────
  // Exporte toutes les données ET toutes les images (converties en base64) dans
  // un seul fichier JSON portable. Ce fichier peut être envoyé par n'importe
  // quel moyen déjà présent sur le téléphone (Bluetooth, câble, messagerie...)
  // puis réimporté sur un autre appareil pour tout restaurer à l'identique,
  // sans passer par un quelconque service cloud.

  const isLocalImageUri = (v: any): boolean => {
    return typeof v === 'string' && (
      v.indexOf('file://') === 0 || v.indexOf('content://') === 0 || v.indexOf('ph://') === 0
    );
  };

  const fileToDataUri = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const ext = (uri.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
      return 'data:' + mime + ';base64,' + base64;
    } catch (e) { return ''; }
  };

  /** Parcourt récursivement les données, remplace chaque image locale par une
   *  clé de référence, et remplit `images` avec son contenu réel en base64.
   *  Générique : capture automatiquement toute image, où qu'elle se trouve
   *  dans la structure (settings, blocs, salles, matériels...), sans avoir à
   *  lister chaque champ un par un. */
  const collectImages = async (node: any, images: Record<string, string>, counter: { n: number }): Promise<any> => {
    if (Array.isArray(node)) {
      const out = [];
      for (let i = 0; i < node.length; i++) out.push(await collectImages(node[i], images, counter));
      return out;
    }
    if (node && typeof node === 'object') {
      const out: any = {};
      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i++) out[keys[i]] = await collectImages(node[keys[i]], images, counter);
      return out;
    }
    if (isLocalImageUri(node)) {
      const data = await fileToDataUri(node);
      if (!data) return node;
      const key = '__img_' + (counter.n++) + '__';
      images[key] = data;
      return key;
    }
    return node;
  };

  /** Opération inverse : réécrit chaque image en un vrai fichier local sur CET
   *  appareil, et remplace la clé de référence par sa nouvelle URI. */
  const restoreImages = async (node: any, images: Record<string, string>): Promise<any> => {
    if (Array.isArray(node)) {
      const out = [];
      for (let i = 0; i < node.length; i++) out.push(await restoreImages(node[i], images));
      return out;
    }
    if (node && typeof node === 'object') {
      const out: any = {};
      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i++) out[keys[i]] = await restoreImages(node[keys[i]], images);
      return out;
    }
    if (typeof node === 'string' && images[node]) {
      const match = /^data:([^;]+);base64,([\s\S]*)$/.exec(images[node]);
      if (!match) return node;
      const mime = match[1]; const b64 = match[2];
      const ext = mime.indexOf('png') !== -1 ? 'png' : mime.indexOf('webp') !== -1 ? 'webp' : mime.indexOf('gif') !== -1 ? 'gif' : 'jpg';
      const dest = FileSystem.documentDirectory + 'auben_img_' + Date.now() + '_' + Math.floor(Math.random() * 100000) + '.' + ext;
      try {
        await FileSystem.writeAsStringAsync(dest, b64, { encoding: FileSystem.EncodingType.Base64 });
        return dest;
      } catch (e) { return node; }
    }
    return node;
  };

  /** Exporte tout (données + images) dans un seul fichier JSON portable et
   *  retourne son URI locale, prête à être partagée. */
  const exportBackup = async (): Promise<string> => {
    const images: Record<string, string> = {};
    const portableData = await collectImages(appData, images, { n: 0 });
    const payload = {
      app: 'U-Auben Inventory',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: portableData,
      images,
    };
    const dest = FileSystem.cacheDirectory + 'auben_export_' + Date.now() + '.json';
    await FileSystem.writeAsStringAsync(dest, JSON.stringify(payload));
    return dest;
  };

  /** Restaure une sauvegarde à partir de son URI locale (fichier déjà
   *  sélectionné par l'utilisateur) : réécrit les images sur CET appareil et
   *  remplace entièrement les données actuelles. */
  const importBackup = async (fileUri: string): Promise<void> => {
    const raw = await FileSystem.readAsStringAsync(fileUri);
    const payload = JSON.parse(raw);
    if (!payload || !payload.data) throw new Error('Fichier de sauvegarde invalide.');
    const restored = await restoreImages(payload.data, payload.images || {});
    setAppData(restored);
    await saveToStorage(restored);
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
      addSalle, updateSalle, deleteRoom,
      addMateriel, updateMateriel, deleteMateriel,
      addNote, updateNote, deleteNote,
      exportBackup, importBackup,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
    
