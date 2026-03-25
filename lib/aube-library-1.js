// lib/aube-library.js
// Bibliothèque de Aube — RAG (Retrieval-Augmented Generation)
// Importe des PDFs/documents → extrait le texte → crée des embeddings → stocke en SQLite
// Aube peut ensuite répondre aux questions en s'appuyant sur ces documents

import * as SQLite from 'expo-sqlite';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

var EMBED_URL = 'https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=';
var CHUNK_SIZE = 800;    // caractères par chunk
var CHUNK_OVERLAP = 100; // chevauchement entre chunks

var _db = null;
var _apiKey = '';

// ── Init ──────────────────────────────────────────────────────────────────────

export async function initLibrary() {
  if (_db) return _db;
  try {
    _apiKey = await AsyncStorage.getItem('@gemini_api_key') || '';
  } catch(e) {}

  _db = await SQLite.openDatabaseAsync('aube_library.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS documents (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  nom TEXT NOT NULL,' +
    '  type TEXT NOT NULL,' +
    '  taille INTEGER DEFAULT 0,' +
    '  nb_chunks INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS chunks (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  doc_id INTEGER NOT NULL,' +
    '  texte TEXT NOT NULL,' +
    '  vecteur TEXT,' +
    '  position INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL,' +
    '  FOREIGN KEY(doc_id) REFERENCES documents(id)' +
    ');'
  );

  return _db;
}

// ── Découpe du texte en chunks ────────────────────────────────────────────────

function decouperEnChunks(texte) {
  var chunks = [];
  var debut = 0;
  var longueur = texte.length;

  while (debut < longueur) {
    var fin = Math.min(debut + CHUNK_SIZE, longueur);

    // Couper à la fin d'une phrase si possible
    if (fin < longueur) {
      var dernierPoint = texte.lastIndexOf('.', fin);
      var dernierNL    = texte.lastIndexOf('\n', fin);
      var coupe = Math.max(dernierPoint, dernierNL);
      if (coupe > debut + CHUNK_SIZE / 2) fin = coupe + 1;
    }

    var chunk = texte.slice(debut, fin).trim();
    if (chunk.length > 20) chunks.push(chunk);
    debut = fin - CHUNK_OVERLAP;
    if (debut < 0) debut = 0;
    if (debut === fin) break;
  }

  return chunks;
}

// ── Extraction texte depuis PDF (via base64 → texte brut) ────────────────────

async function extraireTextePdf(uri) {
  try {
    // Lire le fichier en base64
    var base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Extraire le texte lisible du PDF (chercher les streams de texte)
    // Decode base64 → chercher les séquences BT...ET (Begin Text / End Text)
    var binary = atob(base64);
    var texte = '';

    // Extraction des chaînes entre parenthèses dans les flux PDF
    var regex = /\(([^)]{2,})\)/g;
    var match;
    var buffer = '';

    while ((match = regex.exec(binary)) !== null) {
      var str = match[1];
      // Filtrer les chaînes non imprimables
      var propre = '';
      for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        if (code >= 32 && code <= 126) {
          propre += str[i];
        } else if (code === 10 || code === 13) {
          propre += ' ';
        }
      }
      if (propre.trim().length > 2) {
        buffer += propre + ' ';
        if (buffer.length > 50) { texte += buffer; buffer = ''; }
      }
    }
    texte += buffer;

    // Nettoyer
    texte = texte
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\xC0-\xFF\u00C0-\u024F]/g, '')
      .trim();

    return texte.length > 50 ? texte : null;
  } catch(e) {
    return null;
  }
}

// Extraction texte depuis fichier texte (.txt, .md, .csv)
async function extraireTexteSimple(uri) {
  try {
    var texte = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return texte.trim() || null;
  } catch(e) {
    return null;
  }
}

// ── Calcul embedding via Gemini ───────────────────────────────────────────────

async function calculerEmbedding(texte) {
  if (!_apiKey || !texte) return null;
  try {
    var response = await fetch(EMBED_URL + _apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text: texte.slice(0, 2000) }] },
        taskType: 'RETRIEVAL_DOCUMENT',
      }),
    });
    if (!response.ok) return null;
    var data = await response.json();
    var values = data && data.embedding && data.embedding.values;
    return Array.isArray(values) ? values : null;
  } catch(e) { return null; }
}

// ── Similarité cosinus ────────────────────────────────────────────────────────

function similarite(v1, v2) {
  if (!v1 || !v2 || v1.length !== v2.length) return 0;
  var dot = 0; var n1 = 0; var n2 = 0;
  for (var i = 0; i < v1.length; i++) {
    dot += v1[i] * v2[i];
    n1  += v1[i] * v1[i];
    n2  += v2[i] * v2[i];
  }
  var denom = Math.sqrt(n1) * Math.sqrt(n2);
  return denom > 0 ? dot / denom : 0;
}

// ── Ingestion d'un document ───────────────────────────────────────────────────

export async function ingererDocument(uri, nom, type, onProgres) {
  await initLibrary();
  if (!_db) return { succes: false, message: 'Base de données non disponible.' };

  if (onProgres) onProgres({ etape: 'lecture', message: 'Lecture du document...' });

  // Extraction du texte
  var texte = null;
  var ext = (nom || '').toLowerCase().split('.').pop();

  if (ext === 'pdf') {
    texte = await extraireTextePdf(uri);
    if (!texte) {
      // Fallback : essayer comme texte brut
      texte = await extraireTexteSimple(uri);
    }
  } else {
    texte = await extraireTexteSimple(uri);
  }

  if (!texte || texte.length < 20) {
    return { succes: false, message: 'Impossible d\'extraire le texte de ce document. Essayez un fichier .txt ou .md.' };
  }

  if (onProgres) onProgres({ etape: 'decoupage', message: 'Découpage en ' + Math.ceil(texte.length / CHUNK_SIZE) + ' sections...' });

  // Découper en chunks
  var chunks = decouperEnChunks(texte);
  if (chunks.length === 0) return { succes: false, message: 'Document vide ou illisible.' };

  // Enregistrer le document
  var taille = texte.length;
  var docResult = await _db.runAsync(
    'INSERT INTO documents (nom, type, taille, nb_chunks, timestamp) VALUES (?, ?, ?, ?, ?)',
    [nom, ext || 'txt', taille, chunks.length, new Date().toISOString()]
  );
  var docId = docResult.lastInsertRowId;

  // Créer les embeddings et stocker les chunks
  var reussites = 0;
  for (var i = 0; i < chunks.length; i++) {
    if (onProgres) onProgres({
      etape: 'embedding',
      message: 'Création des embeddings... ' + (i + 1) + '/' + chunks.length,
      progression: Math.round(((i + 1) / chunks.length) * 100),
    });

    var vecteur = null;
    if (_apiKey) {
      vecteur = await calculerEmbedding(chunks[i]);
      // Pause pour ne pas dépasser le quota
      if (i % 5 === 4) await new Promise(function(r) { setTimeout(r, 500); });
    }

    await _db.runAsync(
      'INSERT INTO chunks (doc_id, texte, vecteur, position, timestamp) VALUES (?, ?, ?, ?, ?)',
      [docId, chunks[i], vecteur ? JSON.stringify(vecteur) : null, i, new Date().toISOString()]
    );
    reussites++;
  }

  if (onProgres) onProgres({
    etape: 'triplets',
    message: '🧠 Extraction des relations pour le Knowledge Graph...',
    progression: 95,
  });

  // COUCHE G — Transformer le texte en triplets Knowledge Graph
  try {
    var { processerTexteVersGraphe } = await import('./aube-layer-g');
    var resultG = await processerTexteVersGraphe(texte, nom, null);
    if (onProgres && resultG.triplets > 0) onProgres({
      etape: 'graphe',
      message: '🔗 ' + resultG.triplets + ' relations extraites → Knowledge Graph',
      progression: 98,
    });
  } catch(errG) {}

  if (onProgres) onProgres({
    etape: 'termine',
    message: '✅ Document "' + nom + '" intégré ! ' + reussites + ' sections indexées.',
    progression: 100,
  });

  return {
    succes: true,
    docId: docId,
    nbChunks: reussites,
    message: 'Document intégré avec succès : ' + reussites + ' sections.',
  };
}

// ── Recherche dans la bibliothèque ────────────────────────────────────────────

export async function rechercherDansLibrairie(question, nbResultats) {
  await initLibrary();
  if (!_db || !_apiKey) return [];

  var n = nbResultats || 4;

  try {
    // Embedding de la question
    var vecteurQ = await calculerEmbedding(question);
    if (!vecteurQ) return [];

    // Charger tous les chunks avec vecteurs
    var rows = await _db.getAllAsync(
      'SELECT c.texte, c.vecteur, d.nom as doc_nom ' +
      'FROM chunks c JOIN documents d ON c.doc_id = d.id ' +
      'WHERE c.vecteur IS NOT NULL ' +
      'ORDER BY c.id DESC LIMIT 1000'
    );

    var scores = [];
    for (var i = 0; i < rows.length; i++) {
      try {
        var v = JSON.parse(rows[i].vecteur);
        var score = similarite(vecteurQ, v);
        scores.push({ texte: rows[i].texte, score: score, source: rows[i].doc_nom });
      } catch(e) {}
    }

    scores.sort(function(a, b) { return b.score - a.score; });
    return scores.slice(0, n).filter(function(s) { return s.score > 0.5; });
  } catch(e) { return []; }
}

// Recherche sans embeddings (mots-clés) — fallback si pas de clé API
export async function rechercherParMotsCles(question, nbResultats) {
  await initLibrary();
  if (!_db) return [];

  var n = nbResultats || 4;
  var mots = question.toLowerCase().split(' ').filter(function(m) { return m.length > 3; });
  if (mots.length === 0) return [];

  try {
    var rows = await _db.getAllAsync(
      'SELECT c.texte, d.nom as doc_nom FROM chunks c JOIN documents d ON c.doc_id = d.id LIMIT 2000'
    );

    var scores = rows.map(function(row) {
      var t = row.texte.toLowerCase();
      var hits = mots.reduce(function(acc, m) { return acc + (t.indexOf(m) !== -1 ? 1 : 0); }, 0);
      return { texte: row.texte, score: hits / mots.length, source: row.doc_nom };
    });

    scores.sort(function(a, b) { return b.score - a.score; });
    return scores.slice(0, n).filter(function(s) { return s.score > 0; });
  } catch(e) { return []; }
}

// ── Sélecteur de document (UI helper) ────────────────────────────────────────

export async function choisirDocument() {
  try {
    var result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'text/plain', 'text/markdown', 'text/csv', '*/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    return result.assets && result.assets[0] ? result.assets[0] : null;
  } catch(e) { return null; }
}

// ── Stats de la bibliothèque ──────────────────────────────────────────────────

export async function statsLibrairie() {
  await initLibrary();
  if (!_db) return { documents: 0, chunks: 0, avecEmbeddings: 0 };
  try {
    var docs    = await _db.getFirstAsync('SELECT COUNT(*) as n FROM documents');
    var chunks  = await _db.getFirstAsync('SELECT COUNT(*) as n FROM chunks');
    var embeds  = await _db.getFirstAsync('SELECT COUNT(*) as n FROM chunks WHERE vecteur IS NOT NULL');
    var listeD  = await _db.getAllAsync('SELECT nom, type, nb_chunks, timestamp FROM documents ORDER BY timestamp DESC LIMIT 20');
    return {
      documents:      (docs   && docs.n)   || 0,
      chunks:         (chunks && chunks.n) || 0,
      avecEmbeddings: (embeds && embeds.n) || 0,
      liste:          listeD || [],
    };
  } catch(e) { return { documents: 0, chunks: 0, avecEmbeddings: 0, liste: [] }; }
}

// ── Supprimer un document ─────────────────────────────────────────────────────

export async function supprimerDocument(docId) {
  await initLibrary();
  if (!_db) return;
  try {
    await _db.runAsync('DELETE FROM chunks WHERE doc_id = ?', [docId]);
    await _db.runAsync('DELETE FROM documents WHERE id = ?', [docId]);
  } catch(e) {}
}

export async function viderLibrairie() {
  await initLibrary();
  if (!_db) return;
  try {
    await _db.runAsync('DELETE FROM chunks');
    await _db.runAsync('DELETE FROM documents');
  } catch(e) {}
}
