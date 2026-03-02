import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [appData, setAppData] = useState({
    materiels: [],
    salles: [], 
    settings: {
      assistantName: "Aube",
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('@auben_data');
        if (savedData) {
          setAppData(JSON.parse(savedData));
        }
      } catch (e) { console.error("Erreur chargement", e); }
    };
    loadData();
  }, []);

  const saveToStorage = async (newData: any) => {
    try { 
      await AsyncStorage.setItem('@auben_data', JSON.stringify(newData)); 
    } catch (e) { console.error("Erreur sauvegarde", e); }
  };

  const addSalle = (salle: any) => {
    const newData = { ...appData, salles: [...(appData.salles || []), salle] };
    setAppData(newData);
    saveToStorage(newData);
  };

  const addMateriel = (item: any) => {
    const newData = { ...appData, materiels: [...(appData.materiels || []), item] };
    setAppData(newData);
    saveToStorage(newData);
  };

  return (
    <AppContext.Provider value={{ appData, setAppData, addSalle, addMateriel }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
