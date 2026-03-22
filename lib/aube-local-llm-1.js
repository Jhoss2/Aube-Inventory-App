// lib/aube-local-llm.js
// LLM local désactivé — llama.rn incompatible avec Expo prebuild
// L'architecture Aube reste complète : RAG, mémoire, Gemini, patterns offline
// Réintégration prévue quand llama.rn sera compatible Expo SDK 52

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

var MODELES = [
  {
    id: 'qwen2.5-1.5b',
    nom: 'Qwen 2.5 — 1.5B',
    description: 'En attente de compatibilité Expo SDK 52',
    taille: '~1.1 Go',
    ramMin: '2 Go',
    vitesse: '12-18 tok/s',
    url: '',
    fichier: 'qwen2.5-1.5b-q4.gguf',
    stop: [],
    prompt: function(system, msgs) { return ''; },
  },
  {
    id: 'tinyllama-1.1b',
    nom: 'TinyLlama — 1.1B',
    description: 'En attente de compatibilité Expo SDK 52',
    taille: '~0.7 Go',
    ramMin: '1.5 Go',
    vitesse: '20-30 tok/s',
    url: '',
    fichier: 'tinyllama-1.1b-q4.gguf',
    stop: [],
    prompt: function(system, msgs) { return ''; },
  },
];

export function llmLocalPret()      { return false; }
export function getModele()         { return null; }
export function getListeModeles()   { return MODELES; }

export async function getModeleActifId()         { return null; }
export async function modeleEstDisponible(id)    { return false; }
export async function tailleModelesSurDisque()   { return 0; }

export async function telechargerModele(id, onProgres) {
  return { succes: false, message: 'LLM local non disponible dans cette version. Utilisez Gemini via les paramètres.' };
}

export async function initialiserLLM(id, onStatut) {
  if (onStatut) onStatut('LLM local non disponible dans cette version.');
  return false;
}

export async function genererReponseLocale(system, msgs, onToken) {
  return null;
}

export async function libererLLM() {}
export async function supprimerModele(id) {}

export async function sessionApprentissageMutuel(question, appData, sauvegarderFn) {
  return null;
}
