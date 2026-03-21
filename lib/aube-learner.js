// lib/aube-learner.js
// Systeme d'apprentissage autonome — Gemini enseigne a Aube sans intervention humaine
// Architecture : Aube detecte ses lacunes → contacte Gemini comme eleve → memorise a vie

import * as SQLite from 'expo-sqlite';
import Constants from 'expo-constants';
import { sauvegarderReponseGemini, apprendrePattern, initCache } from './aube-semantic-cache';

// ── Cle API ───────────────────────────────────────────────────────────────────

function getApiKey() {
  try {
    if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.geminiApiKey) return Constants.expoConfig.extra.geminiApiKey;
    if (Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.geminiApiKey) return Constants.manifest.extra.geminiApiKey;
  } catch(e) {}
  return '';
}

var GEMINI_URL_BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=';

// ── Base de donnees d'apprentissage ───────────────────────────────────────────

var _db = null;

async function initLearnerDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aube_learner.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS lacunes (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  contexte TEXT,' +
    '  apprise INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS sessions_apprentissage (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  nb_questions INTEGER DEFAULT 0,' +
    '  nb_apprises INTEGER DEFAULT 0,' +
    '  duree_secondes INTEGER DEFAULT 0,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS connaissances (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  question TEXT NOT NULL,' +
    '  variantes TEXT NOT NULL,' +
    '  reponse TEXT NOT NULL,' +
    '  mots_cles TEXT NOT NULL,' +
    '  explication TEXT,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  return _db;
}

// ── Lacunes (questions sans reponse) ──────────────────────────────────────────

export async function enregistrerLacune(question, contexte) {
  await initLearnerDb();
  if (!_db || !question || question.length < 3) return;
  try {
    var existing = await _db.getFirstAsync('SELECT id FROM lacunes WHERE question = ?', [question]);
    if (!existing) {
      await _db.runAsync(
        'INSERT INTO lacunes (question, contexte, timestamp) VALUES (?, ?, ?)',
        [question, contexte || '', new Date().toISOString()]
      );
    }
  } catch(e) {}
}

async function getLacunes(limit) {
  if (!_db) return [];
  try {
    return await _db.getAllAsync(
      'SELECT * FROM lacunes WHERE apprise = 0 ORDER BY timestamp ASC LIMIT ?',
      [limit || 15]
    );
  } catch(e) { return []; }
}

async function marquerApprise(id) {
  if (!_db) return;
  try { await _db.runAsync('UPDATE lacunes SET apprise = 1 WHERE id = ?', [id]); } catch(e) {}
}

// ── Questions initiales qu'Aube doit apprendre en premier ────────────────────

var QUESTIONS_INITIALES = [
  'Comment voir tous les materiels enregistres ?',
  'Quels materiels sont en mauvais etat ?',
  'Comment ajouter un materiel dans une salle ?',
  'Comment modifier letat dun materiel ?',
  'Comment generer un rapport PDF ?',
  'Comment programmer un rappel ?',
  'Quelles alertes sont actives en ce moment ?',
  'Comment comparer deux salles ?',
  'Quel bloc est le plus degrade ?',
  'Comment creer une note automatique ?',
  'Quels renouvellements sont urgents ?',
  'Comment fonctionne le score de sante ?',
  'Comment supprimer un materiel ?',
  'Comment chercher un materiel par description ?',
  'Comment personnaliser lapplication ?',
  'Que faire quand un materiel tombe en panne ?',
  'Comment savoir si une salle est bien equipee ?',
  'Comment acceder aux parametres ?',
  'Comment utiliser la barre de recherche ?',
  'Quels materiels necessitent une attention urgente ?',
];

// ── Prompt professeur envoye a Gemini ─────────────────────────────────────────

function buildPromptProfesseur(questions, appCtx) {
  var qStr = '';
  for (var i = 0; i < questions.length; i++) {
    qStr += (i + 1) + '. ' + questions[i] + '\n';
  }

  return (
    'Tu joues le role d\'un professeur expert, bienveillant et pedagogique.\n' +
    'Tu t\'adresses a une petite IA locale nommee Aube. Aube est comme une eleve de premiere annee : ' +
    'elle ne comprend pas encore grand chose, mais elle apprend vite quand on lui explique clairement.\n\n' +
    'Aube est integree dans l\'application U-Auben Inventory App de l\'Universite Aube Nouvelle. ' +
    'Elle gere les salles, les materiels, les alertes et les notes. ' +
    'Elle parle toujours en francais, vouvoie les utilisateurs, et est professionnelle et douce.\n\n' +
    'Contexte actuel de l\'inventaire :\n' + (appCtx || 'Base de donnees disponible.') + '\n\n' +
    'Aube n\'a pas su repondre a ces questions. Apprends-lui comment repondre :\n\n' +
    qStr + '\n' +
    'Reponds UNIQUEMENT avec un tableau JSON valide. Pour chaque question :\n' +
    '[\n' +
    '  {\n' +
    '    "question": "la question telle quelle",\n' +
    '    "reponse": "la meilleure reponse en vouvoiement, naturelle, utile, 2-4 phrases max",\n' +
    '    "variantes": ["5 autres facons de poser la meme question"],\n' +
    '    "mots_cles": ["4 mots cles importants"],\n' +
    '    "explication": "pourquoi cette reponse (pour qu\'Aube comprenne le raisonnement)"\n' +
    '  }\n' +
    ']\n\n' +
    'Sois simple, clair et pedagogique. Reponds UNIQUEMENT avec le JSON.'
  );
}

// ── Appel Gemini en mode non-streaming (pour l'apprentissage) ─────────────────

async function appelGeminiProfesseur(prompt) {
  var key = getApiKey();
  if (!key) return null;

  try {
    var response = await fetch(GEMINI_URL_BASE + key, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',        threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',  threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT',  threshold: 'BLOCK_ONLY_HIGH' },
        ],
      }),
    });

    if (!response.ok) return null;
    var data = await response.json();
    var txt = data && data.candidates && data.candidates[0] &&
              data.candidates[0].content && data.candidates[0].content.parts &&
              data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
    return txt || null;
  } catch(e) { return null; }
}

// ── Parse la reponse JSON de Gemini ──────────────────────────────────────────

function parseJSON(texte) {
  if (!texte) return [];
  try {
    var clean = texte.replace(/```json/g, '').replace(/```/g, '').trim();
    var parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch(e) {
    try {
      var d = texte.indexOf('[');
      var f = texte.lastIndexOf(']');
      if (d !== -1 && f !== -1) return JSON.parse(texte.slice(d, f + 1));
    } catch(e2) {}
    return [];
  }
}

// ── Sauvegarde d'une connaissance acquise ─────────────────────────────────────

async function sauvegarderConnaissance(c) {
  if (!_db || !c || !c.question || !c.reponse) return;
  try {
    var vars = Array.isArray(c.variantes) ? c.variantes.join('|||') : '';
    var mots = Array.isArray(c.mots_cles) ? c.mots_cles.join(',') : '';

    await _db.runAsync(
      'INSERT INTO connaissances (question, variantes, reponse, mots_cles, explication, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [c.question, vars, c.reponse, mots, c.explication || '', new Date().toISOString()]
    );

    // Propager dans le cache semantique
    await sauvegarderReponseGemini(c.question, c.reponse);

    // Propager les variantes
    var varsList = Array.isArray(c.variantes) ? c.variantes : [];
    for (var i = 0; i < varsList.length; i++) {
      if (varsList[i] && varsList[i].length > 3) {
        await apprendrePattern(varsList[i], c.reponse, c.question);
        await sauvegarderReponseGemini(varsList[i], c.reponse);
      }
    }
  } catch(e) {}
}

// ── SESSION D'APPRENTISSAGE PRINCIPALE ───────────────────────────────────────

export async function lancerSessionApprentissage(appData, onProgres) {
  await initLearnerDb();
  await initCache();

  if (!getApiKey()) {
    if (onProgres) onProgres({ statut: 'erreur', message: 'Connexion requise pour apprendre.' });
    return { succes: false };
  }

  var debut = Date.now();
  var nbApprises = 0;

  if (onProgres) onProgres({ statut: 'debut', message: 'Aube commence sa session d\'apprentissage avec Gemini...' });

  // Recuperer lacunes + questions initiales non encore apprises
  var lacunes = await getLacunes(10);
  var questionsLacunes = lacunes.map(function(l) { return l.question; });

  var dejaConnues = [];
  try {
    var rows = await _db.getAllAsync('SELECT question FROM connaissances');
    dejaConnues = rows.map(function(r) { return r.question.toLowerCase().trim(); });
  } catch(e) {}

  var initiales = QUESTIONS_INITIALES.filter(function(q) {
    return dejaConnues.indexOf(q.toLowerCase().trim()) === -1;
  }).slice(0, 10);

  var toutesQuestions = questionsLacunes.concat(initiales);

  if (toutesQuestions.length === 0) {
    if (onProgres) onProgres({ statut: 'complet', message: 'Aube a déjà tout appris de disponible !' });
    return { succes: true, nbApprises: 0 };
  }

  // Contexte appData
  var appCtx = 'Inventaire non disponible.';
  if (appData) {
    var salles = appData.salles || [];
    var mats = appData.materiels || [];
    appCtx = salles.length + ' salles, ' + mats.length + ' materiels enregistres.';
    if (salles.length > 0) {
      appCtx += ' Exemples : ' + salles.slice(0, 3).map(function(s) { return s.name; }).join(', ') + '.';
    }
  }

  // Traitement par lots de 5
  var TAILLE_LOT = 5;
  var i = 0;

  while (i < toutesQuestions.length) {
    var lot = toutesQuestions.slice(i, i + TAILLE_LOT);

    if (onProgres) onProgres({
      statut: 'apprentissage',
      message: 'Gemini enseigne ' + lot.length + ' lecon(s) a Aube... (' + (i + lot.length) + '/' + toutesQuestions.length + ')',
      progression: Math.round(((i + lot.length) / toutesQuestions.length) * 100),
    });

    var prompt = buildPromptProfesseur(lot, appCtx);
    var repGemini = await appelGeminiProfesseur(prompt);

    if (repGemini) {
      var connaissances = parseJSON(repGemini);
      for (var j = 0; j < connaissances.length; j++) {
        var c = connaissances[j];
        if (c && c.question && c.reponse) {
          await sauvegarderConnaissance(c);
          nbApprises++;
          // Marquer lacune comme apprise
          for (var k = 0; k < lacunes.length; k++) {
            if (lacunes[k].question === c.question) await marquerApprise(lacunes[k].id);
          }
        }
      }
    }

    i += TAILLE_LOT;
    if (i < toutesQuestions.length) {
      await new Promise(function(res) { setTimeout(res, 1500); });
    }
  }

  var duree = Math.round((Date.now() - debut) / 1000);

  try {
    await _db.runAsync(
      'INSERT INTO sessions_apprentissage (nb_questions, nb_apprises, duree_secondes, timestamp) VALUES (?, ?, ?, ?)',
      [toutesQuestions.length, nbApprises, duree, new Date().toISOString()]
    );
  } catch(e) {}

  if (onProgres) onProgres({
    statut: 'termine',
    message: 'Session terminee ! Aube a appris ' + nbApprises + ' nouvelle(s) lecon(s) en ' + duree + 's.',
    nbApprises: nbApprises,
    duree: duree,
  });

  return { succes: true, nbApprises: nbApprises, duree: duree };
}

// ── AUTO-APPRENTISSAGE (declenche en arriere-plan) ────────────────────────────

var _enCours = false;

export async function apprendreAutomatiquement(appData) {
  if (_enCours || !getApiKey()) return;
  await initLearnerDb();

  try {
    var lacunes = await getLacunes(1);
    var derniere = await _db.getFirstAsync(
      'SELECT timestamp FROM sessions_apprentissage ORDER BY timestamp DESC LIMIT 1'
    );

    var now = Date.now();
    var sixH = 6 * 60 * 60 * 1000;
    var doit = lacunes.length >= 3 || !derniere;

    if (derniere) {
      try {
        if (now - new Date(derniere.timestamp).getTime() > sixH) doit = true;
      } catch(e) {}
    }

    if (doit) {
      _enCours = true;
      await lancerSessionApprentissage(appData, null);
      _enCours = false;
    }
  } catch(e) { _enCours = false; }
}

// ── STATS ─────────────────────────────────────────────────────────────────────

export async function statsApprentissage() {
  await initLearnerDb();
  if (!_db) return null;
  try {
    var conn = await _db.getFirstAsync('SELECT COUNT(*) as n FROM connaissances');
    var lac  = await _db.getFirstAsync('SELECT COUNT(*) as n FROM lacunes WHERE apprise = 0');
    var sess = await _db.getFirstAsync('SELECT COUNT(*) as n, SUM(nb_apprises) as tot FROM sessions_apprentissage');
    var last = await _db.getFirstAsync('SELECT timestamp, nb_apprises FROM sessions_apprentissage ORDER BY timestamp DESC LIMIT 1');
    return {
      connaissances: (conn && conn.n) || 0,
      lacunes: (lac && lac.n) || 0,
      sessions: (sess && sess.n) || 0,
      totalApprises: (sess && sess.tot) || 0,
      derniereSession: last || null,
    };
  } catch(e) { return null; }
}

// ── RECHERCHE DANS LES CONNAISSANCES APPRISES ─────────────────────────────────

function normL(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function chercherDansConnaissances(question) {
  await initLearnerDb();
  if (!_db) return null;
  try {
    var rows = await _db.getAllAsync('SELECT question, variantes, reponse, mots_cles FROM connaissances LIMIT 500');
    var qn = normL(question);
    var best = 0;
    var bestRep = null;

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var score = 0;
      var qr = normL(r.question);

      if (qr === qn) return r.reponse;
      if (qn.indexOf(qr) !== -1 || qr.indexOf(qn) !== -1) score = 0.9;

      var vars = (r.variantes || '').split('|||');
      for (var j = 0; j < vars.length; j++) {
        var vn = normL(vars[j]);
        if (vn === qn) return r.reponse;
        if (qn.indexOf(vn) !== -1 || vn.indexOf(qn) !== -1) score = Math.max(score, 0.8);
      }

      var mots = (r.mots_cles || '').split(',');
      var motsQ = qn.split(' ').filter(function(w) { return w.length > 3; });
      var hits = 0;
      for (var m = 0; m < mots.length; m++) {
        var mn = normL(mots[m]);
        for (var mq = 0; mq < motsQ.length; mq++) {
          if (mn === motsQ[mq] && mn.length > 3) hits++;
        }
      }
      if (hits > 0) score = Math.max(score, (hits / Math.max(mots.length, 1)) * 0.7);

      if (score > best) { best = score; bestRep = r.reponse; }
    }

    if (best >= 0.5 && bestRep) return bestRep;
  } catch(e) {}
  return null;
      }
      
