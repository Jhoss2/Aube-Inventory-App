import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  Platform,
  Dimensions,
  FlatList,
  Modal,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';

const db = SQLite.openDatabase('logistics.db');
const { width, height } = Dimensions.get('window');

const defaultData = {
  general: {
    mainBuildingImage: 'https://placehold.co/400x220/3b82f6/ffffff?text=Universit%C3%A9',
    mainBgUrl: null,
    appIconUrl: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚚</text></svg>',
    menuBgUrl: 'https://placehold.co/420x900/1e3a8a/ffffff?text=Arri%C3%A8re-plan',
    menuLogoUrl: 'https://placehold.co/80x80/ffffff/7f1d1d?text=Logo'
  },
  blocs: {
    A: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+A',
      subBlocs: [
        { id: 'A1', title: 'A1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/3b82f6/ffffff?text=Salles+A1' },
        { id: 'A2', title: 'A2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/3b82f6/ffffff?text=Bureaux+A2' }
      ]
    },
    B: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+B',
      subBlocs: [
        { id: 'B1', title: 'B1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/16a34a/ffffff?text=Salles+B1' },
        { id: 'B2', title: 'B2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/16a34a/ffffff?text=Bureaux+B2' }
      ]
    },
    C: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+C',
      subBlocs: [
        { id: 'C1', title: 'C1', imageTitle: '· Salles de classe ·', image: 'https://placehold.co/400x220/f59e0b/ffffff?text=Salles+C1' },
        { id: 'C2', title: 'C2', imageTitle: '· Bureaux ·', image: 'https://placehold.co/400x220/f59e0b/ffffff?text=Bureaux+C2' }
      ]
    },
    D: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+D',
      subBlocs: [
        { id: 'D1', title: 'Box Sécurité', imageTitle: '· Box Sécurité ·', image: 'https://placehold.co/400x220/c026d3/ffffff?text=Box+D1' },
        { id: 'D2', title: 'Parking', imageTitle: '· Parking ·', image: 'https://placehold.co/400x220/64748b/ffffff?text=Parking+D2' }
      ]
    },
    E: {
      mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+E',
      subBlocs: [
        { id: 'E1', title: 'Toilettes', imageTitle: '· Toilettes ·', image: 'https://placehold.co/400x220/ea580c/ffffff?text=Toilettes+E1' },
        { id: 'E2', title: 'Jardins', imageTitle: '· Jardins ·', image: 'https://placehold.co/400x220/22c55e/ffffff?text=Jardins+E2' }
      ]
    },
    F: { mainImage: 'https://placehold.co/400x220/6b7280/ffffff?text=Vue+A%C3%A9rienne+F', subBlocs: [] }
  },
  salles: [],
  defaultCategories: [
    "Ampoules", "Armoires", "Balais", "Baies de brassage", "Bouilloires", "Bureaux", "Câbles", "Cafetières", "Canapés", "Chaises", "Claviers", "Climatiseurs", "Coussins", "Disques durs", "Extincteurs", "Fauteuils", "Horloges", "Imprimantes", "Lampes", "Micro-ondes", "Multiprises", "Ordinateurs", "Papier", "Photocopieurs", "Plantes", "Post-it", "Poubelles", "Prises", "Produits", "Rallonges", "Rideaux", "Routeurs", "Réfrigérateurs", "Scanners", "Serpillères", "Savon", "Souris", "Tables", "Tableaux", "Tapis", "Téléphones", "Vaisselle", "Ventilateurs", "Vidéoprojecteurs", "Écrans", "Étagères"
  ],
  customCategories: [],
  materiel: [],
  notes: [],
  alerts: [],
  aube: { kb: "Je suis Aube, l'assistant logistique.", hasNewNotification: false }
};

// --- SQLite Helpers ---
const initDB = () => {
  db.transaction(tx => {
    tx.executeSql('CREATE TABLE IF NOT EXISTS GeneralSettings (key TEXT PRIMARY KEY NOT NULL, value TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Blocs (id TEXT PRIMARY KEY NOT NULL, mainImage TEXT, subBlocs TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Salles (id TEXT PRIMARY KEY NOT NULL, nom TEXT, emplacement TEXT, niveau TEXT, capacity INTEGER, area INTEGER, photoId TEXT, plan3dId TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Categories (name TEXT PRIMARY KEY NOT NULL, type TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Materiel (id TEXT PRIMARY KEY NOT NULL, nom TEXT, categorie TEXT, salleId TEXT, dateAchat TEXT, dateRen TEXT, photoId TEXT, description TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Notes (id TEXT PRIMARY KEY NOT NULL, title TEXT, content TEXT, date TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Alerts (id TEXT PRIMARY KEY NOT NULL, materielId TEXT, type TEXT, message TEXT, date TEXT, read INTEGER);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Aube (key TEXT PRIMARY KEY NOT NULL, value TEXT);');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Files (id TEXT PRIMARY KEY NOT NULL, data TEXT);');
  });
};

const insertDefaultData = () => {
  db.transaction(tx => {
    Object.entries(defaultData.general).forEach(([key, value]) => {
      tx.executeSql('INSERT OR IGNORE INTO GeneralSettings (key, value) VALUES (?, ?);', [key, JSON.stringify(value)]);
    });
    Object.entries(defaultData.blocs).forEach(([id, bloc]) => {
      tx.executeSql('INSERT OR IGNORE INTO Blocs (id, mainImage, subBlocs) VALUES (?, ?, ?);', [id, bloc.mainImage, JSON.stringify(bloc.subBlocs)]);
    });
    defaultData.defaultCategories.forEach(category => {
      tx.executeSql('INSERT OR IGNORE INTO Categories (name, type) VALUES (?, ?);', [category, 'default']);
    });
    Object.entries(defaultData.aube).forEach(([key, value]) => {
      tx.executeSql('INSERT OR IGNORE INTO Aube (key, value) VALUES (?, ?);', [key, JSON.stringify(value)]);
    });
  });
};

const saveToDB = (table, data) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      let columns = Object.keys(data).join(', ');
      let placeholders = Object.keys(data).map(() => '?').join(', ');
      let values = Object.values(data).map(value => typeof value === 'object' ? JSON.stringify(value) : value);
      tx.executeSql(`INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders});`, values, (_, result) => resolve(result), (_, error) => reject(error));
    });
  });
};

const getFromDB = (table, id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM ${table} WHERE id = ?;`, [id], (_, { rows }) => resolve(rows._array[0]), (_, error) => reject(error));
    });
  });
};

const getAllFromDB = (table) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`SELECT * FROM ${table};`, [], (_, { rows }) => resolve(rows._array), (_, error) => reject(error));
    });
  });
};

const deleteFromDB = (table, id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(`DELETE FROM ${table} WHERE id = ?;`, [id], (_, result) => resolve(result), (_, error) => reject(error));
    });
  });
};

const updateAubeKb = (kb) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('INSERT OR REPLACE INTO Aube (key, value) VALUES (?, ?);', ['kb', kb], (_, result) => resolve(result), (_, error) => reject(error));
    });
  });
};

const getAubeKb = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('SELECT value FROM Aube WHERE key = ?;', ['kb'], (_, { rows }) => resolve(rows._array[0] ? rows._array[0].value : defaultData.aube.kb), (_, error) => reject(error));
    });
  });
};

const saveFileToDB = async (id, dataUrl) => {
  try {
    await saveToDB('Files', { id, data: dataUrl });
  } catch (e) {
    console.error('Error saving file to DB:', e);
  }
};

const loadFileFromDB = async (id) => {
  try {
    const file = await getFromDB('Files', id);
    return file ? file.data : null;
  } catch (e) {
    console.error('Error loading file from DB:', e);
    return null;
  }
};

const deleteFileFromDB = async (id) => {
  try {
    await deleteFromDB('Files', id);
  } catch (e) {
    console.error('Error deleting file from DB:', e);
  }
};

// --- Main App Component ---
export default function App() {
  const [dbState, setDbState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [appData, setAppData] = useState(defaultData);
  const [currentScreen, setCurrentScreen] = useState('screen-blocA');
  const navigationHistory = useRef(['screen-blocA']);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentBlocId, setCurrentBlocId] = useState(null);
  const [currentSubBlocId, setCurrentSubBlocId] = useState(null);
  const [currentNiveau, setCurrentNiveau] = useState(null);
  const [currentSalleId, setCurrentSalleId] = useState(null);
  const [currentMaterielPhoto, setCurrentMaterielPhoto] = useState(null);
  const [currentRoomPhoto, setCurrentRoomPhoto] = useState(null);
  const [currentRoomPlan, setCurrentRoomPlan] = useState(null);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [currentEditingMaterielId, setCurrentEditingMaterielId] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [aubeKb, setAubeKb] = useState(defaultData.aube.kb);
  const [aubeResponse, setAubeResponse] = useState('');
  const [aubeInput, setAubeInput] = useState('');
  const [aubeLoading, setAubeLoading] = useState(false);
  const [roomPhotoPreview, setRoomPhotoPreview] = useState(null);
  const [roomPlanReady, setRoomPlanReady] = useState(false);
  const [roomProfiles, setRoomProfiles] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [alertsList, setAlertsList] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [noteSearchInput, setNoteSearchInput] = useState('');
  const [newRoomNom, setNewRoomNom] = useState('');
  const [newRoomEmplacement, setNewRoomEmplacement] = useState('');
  const [newRoomNiveau, setNewRoomNiveau] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [newRoomArea, setNewRoomArea] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    async function setup() {
      try {
        // Initialisation séquentielle de la base de données
        initDB();
        insertDefaultData();
        await loadAppData();
      } catch (error) {
        console.error("Erreur d'initialisation:", error);
      } finally {
        setIsLoading(false);
      }
    }

    setup();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadAppData = async () => {
    try {
      const generalSettings = await getAllFromDB('GeneralSettings');
      const blocs = await getAllFromDB('Blocs');
      const salles = await getAllFromDB('Salles');
      const categories = await getAllFromDB('Categories');
      const materiel = await getAllFromDB('Materiel');
      const notes = await getAllFromDB('Notes');
      const alerts = await getAllFromDB('Alerts');
      const aubeSettings = await getAllFromDB('Aube');

      let loadedData = { ...defaultData };

      generalSettings.forEach(setting => {
        loadedData.general[setting.key] = JSON.parse(setting.value);
      });
      setAubeKb(loadedData.aube.kb);

      setAppData(loadedData);
      checkMaterielExpiration();
    } catch (e) {
      console.error('Error loading app data:', e);
      setAppData(defaultData);
      insertDefaultData();
    }
  };

  const saveData = async () => {
    try {
      for (const [key, value] of Object.entries(appData.general)) {
        await saveToDB('GeneralSettings', { key, value: JSON.stringify(value) });
      }
      for (const [id, bloc] of Object.entries(appData.blocs)) {
        await saveToDB('Blocs', { id, mainImage: bloc.mainImage, subBlocs: JSON.stringify(bloc.subBlocs) });
      }
      for (const salle of appData.salles) {
        await saveToDB('Salles', salle);
      }
      await new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql('DELETE FROM Categories;', [], resolve, (_, error) => reject(error));
        });
      });
      for (const category of appData.defaultCategories) {
        await saveToDB('Categories', { name: category, type: 'default' });
      }
      for (const category of appData.customCategories) {
        await saveToDB('Categories', { name: category, type: 'custom' });
      }
      for (const item of appData.materiel) {
        await saveToDB('Materiel', item);
      }
      for (const note of appData.notes) {
        await saveToDB('Notes', note);
      }
      for (const alert of appData.alerts) {
        await saveToDB('Alerts', { ...alert, read: alert.read ? 1 : 0 });
      }
      for (const [key, value] of Object.entries(appData.aube)) {
        await saveToDB('Aube', { key, value: JSON.stringify(value) });
      }
    } catch (e) {
      console.error('Error saving app data:', e);
    }
  };

  const checkMaterielExpiration = () => {
    const today = new Date();
    const upcoming = new Date();
    upcoming.setDate(today.getDate() + 30);
    let newAlerts = [];

    appData.materiel.forEach(item => {
      if (item.dateRen) {
        const renDate = new Date(item.dateRen);
        if (renDate <= upcoming) {
          const exists = appData.alerts.find(a => a.materielId === item.id && a.type === 'expiration');
          if (!exists) {
            newAlerts.push({
              id: `alert-${new Date().getTime()}-${item.id}`,
              materielId: item.id,
              type: 'expiration',
              message: `Renouvellement: "${item.nom}"`,
              date: new Date().toISOString(),
              read: false
            });
          }
        }
      }
    });
    if (newAlerts.length > 0) {
      setAppData(prev => ({ ...prev, alerts: [...newAlerts, ...prev.alerts] }));
      saveData();
    }
  };

  const deleteAlert = async (alertId) => {
    setAppData(prev => ({ ...prev, alerts: prev.alerts.filter(a => a.id !== alertId) }));
    await deleteFromDB('Alerts', alertId);
    saveData();
  };

  const navigateTo = (screenId) => {
    if (screenId === currentScreen) return;
    navigationHistory.current.push(screenId);
    setCurrentScreen(screenId);
    setIsMenuOpen(false);
  };

  const goBack = () => {
    if (navigationHistory.current.length <= 1) return;
    navigationHistory.current.pop();
    const newScreen = navigationHistory.current[navigationHistory.current.length - 1];
    setCurrentScreen(newScreen);
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const showBlocDetails = (blocId) => {
    setCurrentBlocId(blocId);
    navigateTo('screen-blocA-details');
  };

  const showSubBlocDetails = (subBlocId) => {
    setCurrentSubBlocId(subBlocId);
    if (['D1', 'D2', 'E2'].includes(subBlocId)) {
      showRoomProfiles(subBlocId, 'Profil');
    } else {
      navigateTo('screen-blocA1-levels');
    }
  };

  const showRoomProfiles = (niveau, title = 'Profils des salles') => {
    setCurrentNiveau(niveau);
    const filtered = appData.salles.filter((s) =>
      (s.emplacement || "").toUpperCase().trim() === (currentSubBlocId || "").toUpperCase().trim() &&
      (s.niveau || "").trim() === (niveau || "").trim()
    );
    setRoomProfiles(filtered);
    navigateTo('screen-sous-sol');
  };

  const showRoomDetails = (salleId) => {
    setCurrentSalleId(salleId);
    navigateTo('screen-room-details');
  };

  const showRoomContents = (salleId) => {
    setCurrentSalleId(salleId);
    navigateTo('screen-room-contents');
  };

  const showCategoryList = (salleId) => {
    setCurrentSalleId(salleId);
    navigateTo('screen-categories');
  };

  const loadNotesList = () => {
    const query = noteSearchInput.toLowerCase();
    const filtered = (appData.notes || []).filter((n) => (n.title + n.content).toLowerCase().includes(query));
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setNotesList(filtered);
  };

  const createNewNote = () => {
    setCurrentNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    navigateTo('screen-note-editor');
  };

  const openNoteEditor = (noteId) => {
    const note = appData.notes.find((n) => n.id === noteId);
    if (note) {
      setCurrentNoteId(noteId);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      navigateTo('screen-note-editor');
    }
  };

  const saveCurrentNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      goBack();
      return;
    }
    const now = new Date().toISOString();
    if (currentNoteId) {
      setAppData(prev => ({
        ...prev,
        notes: prev.notes.map(n => n.id === currentNoteId ? { ...n, title: noteTitle, content: noteContent, date: now } : n)
      }));
      await saveToDB('Notes', { id: currentNoteId, title: noteTitle, content: noteContent, date: now });
    } else {
      const newNote = { id: `note-${new Date().getTime()}`, title: noteTitle, content: noteContent, date: now };
      setAppData(prev => ({ ...prev, notes: [...prev.notes, newNote] }));
      await saveToDB('Notes', newNote);
    }
    saveData();
    goBack();
  };

  const deleteCurrentNote = async () => {
    if (currentNoteId) {
      Alert.alert('Confirmation', 'Supprimer cette note ?', [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', onPress: async () => {
            setAppData(prev => ({ ...prev, notes: prev.notes.filter(n => n.id !== currentNoteId) }));
            await deleteFromDB('Notes', currentNoteId);
            saveData();
            goBack();
          }
        }
      ]);
    }
  };

  const loadAlerts = () => {
    let sorted = [...appData.alerts];
    sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAlertsList(sorted);
    const hasUnread = sorted.some((a) => !a.read);
    if (hasUnread) {
      setAppData(prev => ({
        ...prev,
        alerts: prev.alerts.map(a => ({ ...a, read: true }))
      }));
      saveData();
    }
  };

  const saveRoom = async () => {
    if (!newRoomNom.trim() || !newRoomEmplacement.trim() || !newRoomNiveau.trim()) {
      Alert.alert('Erreur', 'Nom, Emplacement et Niveau sont obligatoires.');
      return;
    }

    const newSalle = {
      id: `salle-${new Date().getTime()}`,
      nom: newRoomNom,
      emplacement: newRoomEmplacement.toUpperCase(),
      niveau: newRoomNiveau,
      capacity: newRoomCapacity ? parseInt(newRoomCapacity) : null,
      area: newRoomArea ? parseInt(newRoomArea) : null,
      photoId: null,
      plan3dId: null
    };

    if (currentRoomPhoto) {
      newSalle.photoId = `img-salle-${new Date().getTime()}`;
      await saveFileToDB(newSalle.photoId, currentRoomPhoto);
    }
    if (currentRoomPlan) {
      newSalle.plan3dId = `file-plan-${new Date().getTime()}`;
      await saveFileToDB(newSalle.plan3dId, currentRoomPlan);
    }

    setAppData(prev => ({ ...prev, salles: [...prev.salles, newSalle] }));
    await saveToDB('Salles', newSalle);
    saveData();

    setNewRoomNom('');
    setNewRoomEmplacement('');
    setNewRoomNiveau('');
    setNewRoomCapacity('');
    setNewRoomArea('');
    setRoomPhotoPreview(null);
    setRoomPlanReady(false);
    setCurrentRoomPhoto(null);
    setCurrentRoomPlan(null);

    setCurrentSubBlocId(newSalle.emplacement);
    setCurrentNiveau(newSalle.niveau);
    goBack();
  };

  const saveAubeKb = async () => {
    setAppData(prev => ({ ...prev, aube: { ...prev.aube, kb: aubeKb } }));
    await updateAubeKb(aubeKb);
    saveData();
    Alert.alert('Succès', 'Base de connaissances Aube mise à jour.');
  };

  const sendAubeMessage = async (message) => {
    if (!message.trim()) return;
    setAubeInput('');
    setAubeLoading(true);
    setAubeResponse('Aube est en train de réfléchir...');

    if (isOnline) {
      try {
        // Placeholder for API call (would use GoogleGenerativeAI or similar)
        // For now, fallback to local response
        handleAubeOfflineResponse(message);
      } catch (error) {
        console.error('Erreur API Aube:', error);
        handleAubeOfflineResponse(message);
      }
    } else {
      handleAubeOfflineResponse(message);
    }
    setAubeLoading(false);
  };

      // 1. La fonction de logique (celle que tu m'as montrée)
  const handleAubeOfflineResponse = (message) => {
    let response = "";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut')) {
      response = 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?';
    } else if (lowerMessage.includes('salles')) {
      response = appData.salles.length > 0 
        ? `Il y a ${appData.salles.length} salles enregistrées : ${appData.salles.map(s => s.nom).join(', ')}.`
        : 'Il n\'y a aucune salle enregistrée localement.';
    } else if (lowerMessage.includes('matériel') || lowerMessage.includes('inventaire')) {
      response = appData.materiel.length > 0
        ? `Il y a ${appData.materiel.length} éléments. Exemple : ${appData.materiel.slice(0, 3).map(m => m.nom).join(', ')}.`
        : 'L\'inventaire est vide.';
    } else if (lowerMessage.includes('qui es-tu') || lowerMessage.includes('ton rôle')) {
      response = aubeKb;
    } else {
      response = 'Je n\'ai pas d\'infos précises. Essayez de me demander le nombre de salles ou l\'inventaire.';
    }

    // On ajoute la réponse à l'historique et on arrête le chargement
    setAubeResponse(prev => prev + `\n\n[Aube]: ${response}`);
    setAubeLoading(false);
  };

  // 2. La fonction d'envoi (Celle qui est liée à ton bouton "Envoyer")
  const handleAubeChat = () => {
    if (!aubeInput.trim()) return;

    setAubeLoading(true);
    const userMsg = aubeInput;
    
    // On affiche immédiatement le message de l'utilisateur
    setAubeResponse(prev => prev + `\n\nVous: ${userMsg}`);
    setAubeInput(''); // On vide le champ

    // On déclenche la réponse après un court délai pour faire "humain"
    setTimeout(() => {
      handleAubeOfflineResponse(userMsg);
    }, 600);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'screen-blocA':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={toggleMenu}>
                <Ionicons name="menu" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}></Text>
              <TouchableOpacity onPress={() => navigateTo('screen-settings')}>
                <Ionicons name="settings" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput style={styles.searchInput} placeholder="Rechercher..." />
                <TouchableOpacity onPress={() => navigateTo('screen-settings')}>
                  <Ionicons name="chatbubble" size={20} color="#2563eb" />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal style={styles.blocButtons}>
                {['A', 'B', 'C', 'D', 'E', 'F'].map(bloc => (
                  <TouchableOpacity key={bloc} style={styles.blocButton} onPress={() => showBlocDetails(bloc)}>
                    <Text style={styles.blocButtonText}>Bloc {bloc}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Image source={{ uri: appData.general.mainBuildingImage }} style={styles.mainImage} />
              <Text style={styles.universityName}>UNIVERSITE AUBE NOUVELLE</Text>
            </ScrollView>
          </View>
        );

      case 'screen-settings':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>PARAMÈTRES</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Base de Connaissances Aube</Text>
                <Text style={styles.sectionSubtitle}>Informations pour le bot</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={4}
                  value={aubeKb}
                  onChangeText={setAubeKb}
                />
                <TouchableOpacity style={styles.button} onPress={saveAubeKb}>
                  <Text style={styles.buttonText}>Sauvegarder</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Autres paramètres</Text>
                <Text style={styles.sectionSubtitle}>À venir...</Text>
              </View>
            </ScrollView>
          </View>
        );

      case 'screen-aube-chat':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Aube Chat</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              {aubeLoading ? (
                <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
              ) : (
                <Text style={styles.aubeResponse}>{aubeResponse}</Text>
              )}
            </ScrollView>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={aubeInput}
                onChangeText={setAubeInput}
                placeholder="Parlez à Aube..."
              />
              <TouchableOpacity style={styles.sendButton} onPress={() => sendAubeMessage(aubeInput)}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'screen-notes':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>NOTES</Text>
              <TouchableOpacity onPress={createNewNote}>
                <Ionicons name="add-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={noteSearchInput}
                onChangeText={(text) => {
                  setNoteSearchInput(text);
                  loadNotesList();
                }}
              />
            </View>
            <FlatList
              data={notesList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.noteItem} onPress={() => openNoteEditor(item.id)}>
                  <Text style={styles.noteTitle}>{item.title || 'Sans titre'}</Text>
                  <Text style={styles.noteDate}>{new Date(item.date).toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Aucune note.</Text>}
              style={styles.content}
            />
          </View>
        );

      case 'screen-note-editor':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>ÉDITEUR DE NOTES</Text>
              <TouchableOpacity onPress={deleteCurrentNote}>
                <Ionicons name="trash" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <TextInput
                style={styles.noteEditorTitle}
                placeholder="Titre..."
                value={noteTitle}
                onChangeText={setNoteTitle}
              />
              <TextInput
                style={styles.noteEditorContent}
                placeholder="Contenu..."
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={saveCurrentNote}>
                <Text style={styles.buttonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'screen-alerts':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>ALERTES</Text>
              <View style={{ width: 24 }} />
            </View>
            <FlatList
              data={alertsList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.alertItem, { borderLeftColor: item.read ? '#ccc' : '#ef4444' }]}>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>{item.type === 'expiration' ? '⚠️ Attention' : 'Info'}</Text>
                    <Text style={styles.alertMessage}>{item.message}</Text>
                    <Text style={styles.alertDate}>{new Date(item.date).toLocaleDateString()}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteAlert(item.id)}>
                    <Ionicons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Aucune alerte.</Text>}
              style={styles.content}
            />
          </View>
        );

      case 'screen-blocA-details':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Bloc {currentBlocId}</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              {currentBlocId && appData.blocs[currentBlocId] && (
                <>
                  <Image source={{ uri: appData.blocs[currentBlocId].mainImage }} style={styles.blocImage} />
                  <Text style={styles.blocImageTitle}>· Bloc {currentBlocId} vu de dessus ·</Text>
                  {appData.blocs[currentBlocId].subBlocs.map((sub, idx) => (
                    <View key={sub.id}>
                      <Text style={styles.subBlocTitle}>{sub.title}</Text>
                      <TouchableOpacity onPress={() => showSubBlocDetails(sub.id)}>
                        <Image source={{ uri: sub.image }} style={styles.blocImage} />
                        <Text style={styles.blocImageTitle}>{sub.imageTitle}</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        );

      case 'screen-blocA1-levels':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Niveaux</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              <Text style={styles.levelsTitle}>· NIVEAUX DE SUBDIVISION ·</Text>
              {['Sous-sol', 'Rez-de-chaussée', 'Premier Niveau', 'Deuxième Niveau', 'Troisième Niveau', 'Quatrième Niveau'].map(lvl => (
                <TouchableOpacity key={lvl} style={styles.levelButton} onPress={() => showRoomProfiles(lvl)}>
                  <Text style={styles.levelButtonText}>· {lvl} ·</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'screen-sous-sol':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{currentNiveau}</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              <Text style={styles.profilesHeader}>Profils des salles</Text>
              <View style={styles.roomProfilesContainer}>
                {roomProfiles.length === 0 ? (
                  <Text style={styles.emptyText}>Aucune salle.</Text>
                ) : (
                  roomProfiles.map(salle => (
                    <TouchableOpacity key={salle.id} style={styles.roomProfile} onPress={() => showRoomDetails(salle.id)}>
                      <Image source={{ uri: `https://placehold.co/96x96/b91c1c/ffffff?text=${salle.nom.charAt(0)}` }} style={styles.roomProfileImage} />
                      <Text style={styles.roomProfileName}>{salle.nom}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.addButton} onPress={() => navigateTo('screen-addRoom')}>
              <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
          </View>
        );

      case 'screen-addRoom':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>AJOUTER UNE SALLE</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              <View style={styles.photoUploadBox}>
                {roomPhotoPreview ? (
                  <Image source={{ uri: roomPhotoPreview }} style={styles.photoPreview} />
                ) : (
                  <>
                    <Ionicons name="camera" size={40} color="white" />
                    <Text style={styles.photoUploadText}>Photo de la salle</Text>
                  </>
                )}
              </View>
              <TextInput style={styles.input} placeholder="Nom" value={newRoomNom} onChangeText={setNewRoomNom} />
              <TextInput style={styles.input} placeholder="Emplacement (ex: Bloc A)" value={newRoomEmplacement} onChangeText={setNewRoomEmplacement} />
              <TextInput style={styles.input} placeholder="Niveau" value={newRoomNiveau} onChangeText={setNewRoomNiveau} />
              <View style={styles.rowInputs}>
                <TextInput style={[styles.input, { flex: 1 }]} placeholder="Capacité" value={newRoomCapacity} onChangeText={setNewRoomCapacity} keyboardType="numeric" />
                <TextInput style={[styles.input, { flex: 1, marginLeft: 10 }]} placeholder="Superficie (m²)" value={newRoomArea} onChangeText={setNewRoomArea} keyboardType="numeric" />
              </View>
              <View style={styles.planUploadBox}>
                <Ionicons name="cube" size={30} color={roomPlanReady ? '#22c55e' : '#999'} />
                <Text style={styles.planUploadText}>{roomPlanReady ? 'Fichier prêt' : 'Ajouter Plan 3D'}</Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={saveRoom}>
                <Text style={styles.buttonText}>Enregistrer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );

      case 'screen-room-details':
        const salle = appData.salles.find(s => s.id === currentSalleId);
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{salle ? salle.nom : 'Détails'}</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              {salle && (
                <>
                  <View style={styles.roomDetailsInfo}>
                    {salle.capacity && <Text style={styles.roomDetailRow}>Capacité: {salle.capacity}</Text>}
                    {salle.area && <Text style={styles.roomDetailRow}>Superficie: {salle.area} m²</Text>}
                  </View>
                  <TouchableOpacity style={styles.button} onPress={() => showRoomContents(salle.id)}>
                    <Text style={styles.buttonText}>Afficher le matériel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => showCategoryList(salle.id)}>
                    <Text style={styles.buttonText}>Ajouter du matériel</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        );

      case 'screen-room-contents':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Matériel</Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
              <Text style={styles.emptyText}>Matériel à venir...</Text>
            </ScrollView>
          </View>
        );

      case 'screen-categories':
        return (
          <View style={styles.screenContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={goBack}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>CATÉGORIES</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                value={categorySearch}
                onChangeText={setCategorySearch}
              />
            </View>
            <ScrollView style={styles.content}>
              <Text style={styles.emptyText}>Catégories à venir...</Text>
            </ScrollView>
          </View>
        );

      default:
        return (
          <View style={styles.screenContainer}>
            <Text>Écran inconnu: {currentScreen}</Text>
            <TouchableOpacity onPress={goBack}>
              <Text>Retour</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderScreen()}
      {isMenuOpen && (
        <Modal transparent animationType="fade" onRequestClose={toggleMenu}>
          <View style={styles.menuOverlay}>
            <TouchableOpacity style={styles.menuOverlayClose} onPress={toggleMenu} />
            <View style={styles.menu}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>U-AUBEN TRACKER</Text>
                <TouchableOpacity onPress={toggleMenu}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.menuNav}>
                <Text style={styles.menuItem}>· Guide d'utilisation ·</Text>
                <Text style={styles.menuItem}>· A propos du développeur ·</Text>
                <Text style={styles.menuItem}>· Données ·</Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fde7f3',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#fde7f3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#b91c1c',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  blocButtons: {
    marginBottom: 15,
    paddingVertical: 5,
  },
  blocButton: {
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
  },
  blocButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
  },
  universityName: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sendButton: {
    backgroundColor: '#1e3a8a',
    padding: 10,
    borderRadius: 20,
    marginLeft: 10,
  },
  aubeResponse: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 15,
  },
  noteItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  noteEditorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  noteEditorContent: {
    fontSize: 16,
    flex: 1,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  alertItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  alertMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  alertDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  blocImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  blocImageTitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  subBlocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
    textAlign: 'center',
  },
  levelsTitle: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
  },
  levelButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  levelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  profilesHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  roomProfilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  roomProfile: {
    alignItems: 'center',
    marginBottom: 15,
    width: '30%',
  },
  roomProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginBottom: 8,
  },
  roomProfileName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  photoUploadBox: {
    backgroundColor: '#1e3a8a',
    borderRadius: 15,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  photoUploadText: {
    color: 'white',
    marginTop: 10,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  planUploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  planUploadText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  roomDetailsInfo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  roomDetailRow: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  menuOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuOverlayClose: {
    flex: 1,
  },
  menu: {
    width: '70%',
    backgroundColor: '#7f1d1d',
    paddingTop: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuNav: {
    paddingVertical: 20,
  },
  menuItem: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
