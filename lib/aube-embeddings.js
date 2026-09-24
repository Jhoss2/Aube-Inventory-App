// lib/aube-embeddings.js
// Embeddings semantiques via Gemini — comprend les synonymes et paraphrases
// Chaque phrase devient un vecteur de 768 dimensions
// Deux phrases similaires = vecteurs proches meme avec des mots differents

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

var EMBED_URL_BASE = 'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=';

var _db = null;
var _apiKey = '';

// ── Init ──────────────────────────────────────────────────────────────────────

export async function initEmbeddings() {
  if (_db) return _db;
  try {
    _apiKey = await AsyncStorage.getItem('@gemini_api_key') || '';
  } catch(e) {}

  _db = await SQLite.openDatabaseAsync('aube_embeddings.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS embeddings (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  reponse TEXT NOT NULL,' +
    '  vecteur TEXT NOT NULL,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  return _db;
}

function getDb() { return _db; }

// ── Calcul d'embedding via Gemini API ─────────────────────────────────────────
// Envoie une phrase → reçoit un tableau de 768 nombres

export async function calculerEmbedding(texte) {
  if (!_apiKey || !texte) return null;
  try {
    var response = await fetch(EMBED_URL_BASE + _apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: texte }] },
        taskType: 'SEMANTIC_SIMILARITY',
      }),
    });
    if (!response.ok) return null;
    var data = await response.json();
    var values = data && data.embedding && data.embedding.values;
    return Array.isArray(values) ? values : null;
  } catch(e) { return null; }
}

// ── Distance cosinus entre deux vecteurs ──────────────────────────────────────
// 1.0 = identiques, 0.0 = completement differents
// On utilise la similarite cosinus car elle est independante de la longueur

function similariteCosinus(v1, v2) {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  var dot = 0;
  var norm1 = 0;
  var norm2 = 0;
  for (var i = 0; i < v1.length; i++) {
    dot   += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }
  var denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denom > 0 ? dot / denom : 0;
}

// ── Sauvegarder question + reponse + embedding ────────────────────────────────

export async function sauvegarderAvecEmbedding(question, reponse) {
  if (!getDb() || !question || !reponse) return false;
  try {
    // Calculer l'embedding de la question
    var vecteur = await calculerEmbedding(question);
    if (!vecteur) return false;

    // Verifier si la question existe deja
    var existing = await getDb().getFirstAsync(
      'SELECT id FROM embeddings WHERE question = ?', [question]
    );

    if (existing) {
      await getDb().runAsync(
        'UPDATE embeddings SET reponse = ?, vecteur = ?, timestamp = ? WHERE question = ?',
        [reponse, JSON.stringify(vecteur), new Date().toISOString(), question]
      );
    } else {
      await getDb().runAsync(
        'INSERT INTO embeddings (question, reponse, vecteur, timestamp) VALUES (?, ?, ?, ?)',
        [question, reponse, JSON.stringify(vecteur), new Date().toISOString()]
      );
    }
    return true;
  } catch(e) { return false; }
}

// ── Recherche semantique dans le cache ───────────────────────────────────────
// Compare l'embedding de la question avec tous les embeddings en base
// Retourne la reponse la plus proche si le score depasse le seuil

export async function chercherParEmbedding(question, seuil) {
  if (!getDb() || !question || !_apiKey) return null;
  var seuilMin = seuil || 0.80; // 80% de similarite minimum

  try {
    // Calculer l'embedding de la nouvelle question
    var vecteurQuestion = await calculerEmbedding(question);
    if (!vecteurQuestion) return null;

    // Charger tous les embeddings en base
    var rows = await getDb().getAllAsync(
      'SELECT question, reponse, vecteur FROM embeddings LIMIT 500'
    );

    var meilleurScore = 0;
    var meilleurReponse = null;
    var meilleurQuestion = null;

    for (var i = 0; i < rows.length; i++) {
      try {
        var vecteurCache = JSON.parse(rows[i].vecteur);
        var score = similariteCosinus(vecteurQuestion, vecteurCache);

        if (score > meilleurScore) {
          meilleurScore = score;
          meilleurReponse = rows[i].reponse;
          meilleurQuestion = rows[i].question;
        }
      } catch(e) {}
    }

    if (meilleurScore >= seuilMin && meilleurReponse) {
      // Indicateur de confiance
      var pct = Math.round(meilleurScore * 100);
      var note = pct >= 95 ? '' : ' *(similaire à ' + pct + '%)*';
      return { reponse: meilleurReponse + note, score: meilleurScore, questionOriginale: meilleurQuestion };
    }
  } catch(e) {}

  return null;
}

// ── Mise a jour de la cle API ─────────────────────────────────────────────────

export function setEmbeddingApiKey(key) {
  _apiKey = key;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function statsEmbeddings() {
  if (!getDb()) return { total: 0 };
  try {
    var row = await getDb().getFirstAsync('SELECT COUNT(*) as n FROM embeddings');
    return { total: (row && row.n) || 0 };
  } catch(e) { return { total: 0 }; }
}

// ── Vider la base ─────────────────────────────────────────────────────────────

export async function viderEmbeddings() {
  if (!getDb()) return;
  try { await getDb().runAsync('DELETE FROM embeddings'); } catch(e) {}
}
