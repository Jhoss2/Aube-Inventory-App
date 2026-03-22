// lib/aube-memory.js
// Mémoire longue durée d'Aube — Profil utilisateur, apprentissage web, personnalité persistante

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

var _db = null;
var _apiKey = '';

// ── Init ──────────────────────────────────────────────────────────────────────

export async function initMemoire() {
  if (_db) return _db;
  try { _apiKey = await AsyncStorage.getItem('@gemini_api_key') || ''; } catch(e) {}

  _db = await SQLite.openDatabaseAsync('aube_memory.db');

  // Profil utilisateur — préférences apprises
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS profil_utilisateur (' +
    '  cle TEXT PRIMARY KEY,' +
    '  valeur TEXT NOT NULL,' +
    '  confiance INTEGER DEFAULT 1,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  // Faits appris sur le monde (web, documents)
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS faits_monde (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  sujet TEXT NOT NULL,' +
    '  fait TEXT NOT NULL,' +
    '  source TEXT,' +
    '  vecteur TEXT,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  // Historique résumé des conversations passées
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS resumes_conversations (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  resume TEXT NOT NULL,' +
    '  themes TEXT,' +
    '  session TEXT,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  // Corrections faites par l'utilisateur
  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS corrections (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  mauvaise_reponse TEXT,' +
    '  bonne_reponse TEXT NOT NULL,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  return _db;
}

// ── Profil utilisateur ────────────────────────────────────────────────────────

export async function apprendrePreference(cle, valeur) {
  if (!_db) return;
  try {
    await _db.runAsync(
      'INSERT OR REPLACE INTO profil_utilisateur (cle, valeur, confiance, timestamp) VALUES (?, ?, ?, ?)',
      [cle, valeur, 1, new Date().toISOString()]
    );
  } catch(e) {}
}

export async function getProfilUtilisateur() {
  if (!_db) return {};
  try {
    var rows = await _db.getAllAsync('SELECT cle, valeur FROM profil_utilisateur ORDER BY confiance DESC');
    var profil = {};
    for (var i = 0; i < rows.length; i++) profil[rows[i].cle] = rows[i].valeur;
    return profil;
  } catch(e) { return {}; }
}

// Détection automatique des préférences dans le texte
export async function detecterEtMeoriserPreference(texte) {
  if (!_db) return;
  var t = texte.toLowerCase();

  // Préférence de langue/registre
  if (t.indexOf('sois plus') !== -1 || t.indexOf('parle plus') !== -1) {
    if (t.indexOf('formel') !== -1 || t.indexOf('professionnel') !== -1) await apprendrePreference('registre', 'formel');
    if (t.indexOf('simple') !== -1 || t.indexOf('simple') !== -1)      await apprendrePreference('registre', 'simple');
    if (t.indexOf('court') !== -1 || t.indexOf('concis') !== -1)       await apprendrePreference('longueur', 'court');
    if (t.indexOf('detail') !== -1 || t.indexOf('complet') !== -1)     await apprendrePreference('longueur', 'detaille');
  }

  // Prénom/titre de l'utilisateur
  var mPrenom = texte.match(/(?:je m'appelle|mon nom est|appelez-moi)\s+([A-ZÀ-Ü][a-zà-ü]+)/i);
  if (mPrenom) await apprendrePreference('prenom_utilisateur', mPrenom[1]);
}

// ── Résumé de conversation ────────────────────────────────────────────────────

export async function sauvegarderResumeConversation(messages, session) {
  if (!_db || !messages || messages.length < 3) return;
  try {
    // Créer un résumé simple des thèmes abordés
    var themes = new Set();
    var keywords = ['inventaire', 'salle', 'materiel', 'alerte', 'rapport', 'pdf', 'note', 'belem', 'aube', 'bloc'];
    for (var i = 0; i < messages.length; i++) {
      var t = (messages[i].text || '').toLowerCase();
      for (var k = 0; k < keywords.length; k++) {
        if (t.indexOf(keywords[k]) !== -1) themes.add(keywords[k]);
      }
    }

    var resume = 'Conversation du ' + new Date().toLocaleDateString('fr-FR') +
      ' — ' + messages.length + ' échanges. ' +
      'Sujets : ' + Array.from(themes).join(', ') + '.';

    await _db.runAsync(
      'INSERT INTO resumes_conversations (resume, themes, session, timestamp) VALUES (?, ?, ?, ?)',
      [resume, Array.from(themes).join(','), session || '', new Date().toISOString()]
    );

    // Garder seulement les 50 derniers résumés
    await _db.runAsync(
      'DELETE FROM resumes_conversations WHERE id NOT IN ' +
      '(SELECT id FROM resumes_conversations ORDER BY timestamp DESC LIMIT 50)'
    );
  } catch(e) {}
}

export async function getResumesRecents(n) {
  if (!_db) return [];
  try {
    return await _db.getAllAsync(
      'SELECT resume, themes FROM resumes_conversations ORDER BY timestamp DESC LIMIT ?',
      [n || 5]
    );
  } catch(e) { return []; }
}

// ── Corrections utilisateur ───────────────────────────────────────────────────

export async function enregistrerCorrection(question, mauvaiseRep, bonneRep) {
  if (!_db) return;
  try {
    await _db.runAsync(
      'INSERT INTO corrections (question, mauvaise_reponse, bonne_reponse, timestamp) VALUES (?, ?, ?, ?)',
      [question, mauvaiseRep || '', bonneRep, new Date().toISOString()]
    );
  } catch(e) {}
}

export async function chercherCorrection(question) {
  if (!_db) return null;
  try {
    var qNorm = question.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    var rows = await _db.getAllAsync('SELECT question, bonne_reponse FROM corrections LIMIT 200');
    for (var i = 0; i < rows.length; i++) {
      var rNorm = rows[i].question.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
      if (qNorm === rNorm || qNorm.indexOf(rNorm) !== -1 || rNorm.indexOf(qNorm) !== -1) {
        return rows[i].bonne_reponse;
      }
    }
  } catch(e) {}
  return null;
}

// ── Apprentissage web ─────────────────────────────────────────────────────────

var EMBED_URL = 'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=';

async function calculerEmbedding(texte) {
  if (!_apiKey) return null;
  try {
    var response = await fetch(EMBED_URL + _apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: texte.slice(0, 1500) }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      }),
    });
    if (!response.ok) return null;
    var data = await response.json();
    var v = data && data.embedding && data.embedding.values;
    return Array.isArray(v) ? v : null;
  } catch(e) { return null; }
}

// Télécharger et apprendre depuis une URL
export async function apprendreDepuisUrl(url) {
  if (!_db) return { succes: false, message: 'Base non initialisée.' };
  try {
    var response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) return { succes: false, message: 'URL inaccessible.' };

    var html = await response.text();

    // Extraction texte brut depuis HTML
    var texte = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    if (texte.length < 100) return { succes: false, message: 'Contenu insuffisant.' };

    // Découper en chunks de 600 caractères
    var chunks = [];
    for (var i = 0; i < texte.length && chunks.length < 20; i += 550) {
      var chunk = texte.slice(i, i + 600).trim();
      if (chunk.length > 50) chunks.push(chunk);
    }

    // Stocker avec embeddings
    var domaine = url.replace(/https?:\/\//, '').split('/')[0];
    var stockes = 0;

    for (var j = 0; j < chunks.length; j++) {
      var vecteur = await calculerEmbedding(chunks[j]);
      await _db.runAsync(
        'INSERT INTO faits_monde (sujet, fait, source, vecteur, timestamp) VALUES (?, ?, ?, ?, ?)',
        [domaine, chunks[j], url, vecteur ? JSON.stringify(vecteur) : null, new Date().toISOString()]
      );
      stockes++;
      if (j % 3 === 2) await new Promise(function(r) { setTimeout(r, 300); });
    }

    return { succes: true, stockes: stockes, source: domaine };
  } catch(e) {
    return { succes: false, message: 'Erreur : ' + (e.message || e) };
  }
}

// Auto-apprentissage web sur sujets prédéfinis
var SUJETS_AUTO = [
  'https://fr.wikipedia.org/wiki/Grammaire_fran%C3%A7aise',
  'https://fr.wikipedia.org/wiki/Gestion_de_projet',
  'https://fr.wikipedia.org/wiki/Intelligence_artificielle',
  'https://fr.wikipedia.org/wiki/Universit%C3%A9',
];

export async function apprendreAutomatiquementWeb(sujetsSupplementaires) {
  if (!_db) return;
  var sujets = sujetsSupplementaires || SUJETS_AUTO;
  var resultats = [];

  for (var i = 0; i < sujets.length; i++) {
    var r = await apprendreDepuisUrl(sujets[i]);
    resultats.push(r);
    await new Promise(function(res) { setTimeout(res, 1000); });
  }

  return resultats;
}

// ── Recherche dans faits monde ────────────────────────────────────────────────

function similarite(v1, v2) {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  var dot = 0; var n1 = 0; var n2 = 0;
  for (var i = 0; i < v1.length; i++) { dot += v1[i]*v2[i]; n1 += v1[i]*v1[i]; n2 += v2[i]*v2[i]; }
  var d = Math.sqrt(n1) * Math.sqrt(n2);
  return d > 0 ? dot / d : 0;
}

export async function rechercherFaitsMonde(question, n) {
  if (!_db || !_apiKey) return [];
  try {
    var vQ = await calculerEmbedding(question);
    if (!vQ) return [];
    var rows = await _db.getAllAsync(
      'SELECT fait, source, vecteur FROM faits_monde WHERE vecteur IS NOT NULL ORDER BY id DESC LIMIT 500'
    );
    var scores = [];
    for (var i = 0; i < rows.length; i++) {
      try {
        var v = JSON.parse(rows[i].vecteur);
        var score = similarite(vQ, v);
        scores.push({ texte: rows[i].fait, source: rows[i].source, score: score });
      } catch(e) {}
    }
    scores.sort(function(a, b) { return b.score - a.score; });
    return scores.slice(0, n || 3).filter(function(s) { return s.score > 0.55; });
  } catch(e) { return []; }
}

// ── Contexte mémoire pour le prompt ──────────────────────────────────────────

export async function construireContexteMemoire() {
  if (!_db) return '';
  var ctx = '';

  // Profil utilisateur
  var profil = await getProfilUtilisateur();
  var clés = Object.keys(profil);
  if (clés.length > 0) {
    ctx += '\n=== PROFIL MÉMORISÉ DE L\'UTILISATEUR ===\n';
    for (var i = 0; i < clés.length; i++) ctx += clés[i] + ' : ' + profil[clés[i]] + '\n';
  }

  // Résumés conversations récentes
  var resumes = await getResumesRecents(3);
  if (resumes.length > 0) {
    ctx += '\n=== CONVERSATIONS RÉCENTES ===\n';
    for (var j = 0; j < resumes.length; j++) ctx += resumes[j].resume + '\n';
  }

  return ctx;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function statsMemoire() {
  if (!_db) return {};
  try {
    var profil   = await _db.getFirstAsync('SELECT COUNT(*) as n FROM profil_utilisateur');
    var faits    = await _db.getFirstAsync('SELECT COUNT(*) as n FROM faits_monde');
    var resumes  = await _db.getFirstAsync('SELECT COUNT(*) as n FROM resumes_conversations');
    var correct  = await _db.getFirstAsync('SELECT COUNT(*) as n FROM corrections');
    return {
      profil:      (profil  && profil.n)  || 0,
      faits:       (faits   && faits.n)   || 0,
      resumes:     (resumes && resumes.n) || 0,
      corrections: (correct && correct.n) || 0,
    };
  } catch(e) { return {}; }
}
