// lib/aube-layer-g.js
// COUCHE G — Transformateur PDF → Triplets → Knowledge Graph
// Co-conçu Claude + Gemini
// "Chercheur de triplets" : ne stocke pas des phrases, mais des LIENS logiques

import * as FileSystem from 'expo-file-system';
import { ajouterConnaissance, initKnowledgeGraph } from './aube-knowledge-graph';

// ── Dictionnaire NER local (Gemini Point 2) ───────────────────────────────────

var NER_CODE = [
  'python', 'javascript', 'typescript', 'java', 'kotlin', 'swift', 'go', 'rust',
  'php', 'sql', 'bash', 'c++', 'ruby', 'scala', 'dart', 'lua', 'perl',
  'fonction', 'classe', 'variable', 'boucle', 'algorithme', 'tableau', 'liste',
  'dictionnaire', 'objet', 'interface', 'heritage', 'polymorphisme', 'encapsulation',
  'recursion', 'iteration', 'condition', 'exception', 'thread', 'api', 'rest',
  'graphql', 'json', 'xml', 'html', 'css', 'framework', 'library', 'module',
  'database', 'index', 'requete', 'transaction', 'cache', 'buffer', 'stack',
  'queue', 'arbre', 'graphe', 'tri', 'recherche', 'complexite', 'optimisation',
  'debug', 'test', 'deploiement', 'git', 'docker', 'kubernetes', 'ci/cd',
];

var NER_LOGISTIQUE = [
  'inventaire', 'stock', 'materiel', 'equipement', 'fourniture', 'seuil',
  'fifo', 'lifo', 'abc', 'renouvellement', 'maintenance', 'remplacement',
  'panne', 'usure', 'duree de vie', 'rotation', 'approvisionnement',
  'commande', 'fournisseur', 'cout', 'budget', 'dotation', 'affectation',
  'projecteur', 'climatiseur', 'ordinateur', 'imprimante', 'tableau', 'chaise',
  'bureau', 'tablette', 'telephone', 'ecran', 'batterie', 'lampe', 'filtre',
  'salle', 'bloc', 'batiment', 'campus', 'universite', 'laboratoire', 'amphi',
];

var NER_GENERAL = [
  'performance', 'securite', 'fiabilite', 'disponibilite', 'scalabilite',
  'confidentialite', 'integrite', 'authentification', 'autorisation',
  'protocole', 'standard', 'norme', 'certification', 'audit',
];

var TOUS_NER = NER_CODE.concat(NER_LOGISTIQUE).concat(NER_GENERAL);

// ── Parser de connecteurs logiques (Gemini Point 1) ──────────────────────────

var CONNECTEURS = [
  // Causalité / Implication
  { mots: ['donc', 'ainsi', 'par consequent', 'entrainement', 'entraine', 'implique',
           'provoque', 'cause', 'genere', 'resulte en', 'conduit a', 'aboutit a'],
    relation: 'implique', poids: 0.85 },

  // Hiérarchie / Classification
  { mots: ['est un', 'est une', 'type de', 'categorie de', 'exemple de',
           'appartient a', 'fait partie de', 'est classe comme', 'est considere'],
    relation: 'est_un', poids: 0.9 },

  // Nécessité / Prérequis
  { mots: ['necessite', 'requiert', 'demande', 'a besoin de', 'depend de',
           'prerequis', 'condition', 'obligatoire'],
    relation: 'nécessite', poids: 0.88 },

  // Association / Lien
  { mots: ['est lie a', 'est associe a', 'est relie a', 'est connecte a',
           'interagit avec', 'fonctionne avec', 'compatible avec'],
    relation: 'lié_à', poids: 0.75 },

  // Amélioration / Optimisation
  { mots: ['ameliore', 'optimise', 'accelere', 'renforce', 'augmente',
           'booste', 'amelioration de', 'plus efficace'],
    relation: 'optimise', poids: 0.8 },

  // Contradiction / Incompatibilité
  { mots: ['contredit', 'incompatible avec', 'ne fonctionne pas avec',
           'contraire de', 'oppose a', 'invalide'],
    relation: 'contredit', poids: 0.95 },

  // Durée / Cycle de vie
  { mots: ['dure', 'duree de vie', 'cycle de vie', 'expire', 'expire apres',
           'valable', 'valable pendant', 'a une vie de', 'remplacer apres'],
    relation: 'a_duree_vie', poids: 0.85 },

  // Syntaxe code
  { mots: ['syntaxe', 'se note', 's\'ecrit', 'en python', 'en javascript',
           'en java', 'en kotlin', 'exemple:', 'ex:', 'usage:'],
    relation: 'a_pour_syntaxe', poids: 0.9 },
];

// ── Normalisation ─────────────────────────────────────────────────────────────

function norm(t) {
  return (t || '').toLowerCase()
    .replace(/[àâä]/g, 'a').replace(/[éèêë]/g, 'e')
    .replace(/[îï]/g, 'i').replace(/[ôö]/g, 'o')
    .replace(/[ùûü]/g, 'u').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s\/\.\-]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// ── Extracteur de nœuds NER (Gemini Point 2) ─────────────────────────────────

function extraireNoeuds(chunk) {
  var t = norm(chunk);
  var noeuds = [];
  for (var i = 0; i < TOUS_NER.length; i++) {
    if (t.indexOf(TOUS_NER[i]) !== -1) {
      var label = TOUS_NER[i].charAt(0).toUpperCase() + TOUS_NER[i].slice(1);
      label = label.replace(/\s+/g, '_');
      if (noeuds.indexOf(label) === -1) noeuds.push(label);
    }
  }
  // Chercher aussi des entités capitalisées dans le texte original
  var majuscules = chunk.match(/[A-Z][a-zA-Z]{3,}(?:\s[A-Z][a-zA-Z]{3,})*/g) || [];
  for (var j = 0; j < majuscules.length; j++) {
    var m = majuscules[j].trim().replace(/\s+/g, '_');
    if (m.length > 3 && noeuds.indexOf(m) === -1) noeuds.push(m);
  }
  return noeuds.slice(0, 10); // max 10 nœuds par chunk
}

// ── Triplétiseur — 3 passes (Gemini Point 3) ─────────────────────────────────

function extraireTriplets(chunk, noeudsConnus) {
  var t = norm(chunk);
  var triplets = [];
  var frequences = {};

  // Passe 1 : Identifier sujets et objets (nœuds)
  var noeuds = noeudsConnus || extraireNoeuds(chunk);
  if (noeuds.length < 2) return [];

  // Passe 2 : Identifier les verbes de relation
  for (var ci = 0; ci < CONNECTEURS.length; ci++) {
    var conn = CONNECTEURS[ci];
    for (var mi = 0; mi < conn.mots.length; mi++) {
      var mot = conn.mots[mi];
      var idx = t.indexOf(mot);
      while (idx !== -1) {
        // Chercher source (avant le connecteur) et cible (après)
        var avant  = t.slice(Math.max(0, idx - 60), idx).trim();
        var apres  = t.slice(idx + mot.length, idx + mot.length + 60).trim();

        var source = _trouverNoeudProche(avant,  noeuds, 'fin');
        var cible  = _trouverNoeudProche(apres,  noeuds, 'debut');

        if (source && cible && source !== cible) {
          var cle = source + '|' + conn.relation + '|' + cible;
          frequences[cle] = (frequences[cle] || 0) + 1;

          if (!triplets.find(function(tr) { return tr.cle === cle; })) {
            triplets.push({
              cle:      cle,
              source:   source,
              relation: conn.relation,
              cible:    cible,
              poids:    conn.poids,
              contexte: apres.slice(0, 40),
            });
          }
        }
        idx = t.indexOf(mot, idx + 1);
      }
    }
  }

  // Passe 3 : Calculer poids selon fréquence (Gemini Point 3)
  // Si règle répétée 3x → poids +0.2
  for (var ti = 0; ti < triplets.length; ti++) {
    var freq = frequences[triplets[ti].cle] || 1;
    if (freq >= 3) triplets[ti].poids = Math.min(1.0, triplets[ti].poids + 0.2);
    else if (freq === 2) triplets[ti].poids = Math.min(1.0, triplets[ti].poids + 0.1);
  }

  // Détecter blocs de code (```...```) → relation syntaxe
  var blocs = chunk.match(/```[\s\S]{10,200}```/g) || [];
  for (var bi = 0; bi < blocs.length && bi < 3; bi++) {
    var code = blocs[bi].replace(/```/g, '').trim();
    // Chercher le concept le plus proche avant le bloc
    var avant2 = chunk.slice(0, chunk.indexOf(blocs[bi]));
    var sourceCode = _trouverNoeudProche(norm(avant2), noeuds, 'fin');
    if (sourceCode) {
      triplets.push({
        cle:      sourceCode + '|a_pour_syntaxe|' + code.slice(0, 30),
        source:   sourceCode,
        relation: 'a_pour_syntaxe',
        cible:    'Code_' + sourceCode,
        poids:    0.9,
        contexte: code.slice(0, 80),
      });
    }
  }

  return triplets.slice(0, 20); // max 20 triplets par chunk
}

function _trouverNoeudProche(texte, noeuds, sens) {
  var mots = texte.split(' ');
  if (sens === 'fin') mots = mots.reverse();
  for (var i = 0; i < mots.length && i < 10; i++) {
    var m = mots[i].replace(/[^a-z0-9]/g, '');
    for (var j = 0; j < noeuds.length; j++) {
      if (norm(noeuds[j]).indexOf(m) !== -1 && m.length > 3) {
        return noeuds[j];
      }
    }
  }
  // Fallback : premier/dernier mot significatif
  for (var k = 0; k < mots.length && k < 5; k++) {
    var w = (sens === 'fin' ? mots[k] : mots[mots.length - 1 - k]).trim();
    w = w.replace(/[^a-zA-Z0-9_]/g, '');
    if (w.length > 4) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }
  }
  return null;
}

// ── Processeur principal ──────────────────────────────────────────────────────

export async function processerTexteVersGraphe(texte, source, onProgres) {
  await initKnowledgeGraph();

  // Découper en chunks de 800 chars avec 100 de chevauchement
  var chunks = [];
  var CHUNK  = 800;
  var OVERLAP = 100;
  for (var i = 0; i < texte.length; i += CHUNK - OVERLAP) {
    var c = texte.slice(i, i + CHUNK).trim();
    if (c.length > 50) chunks.push(c);
  }

  var totalTriplets  = 0;
  var totalNoeuds    = 0;
  var domaineDetecte = 'GENERAL';

  // Détecter le domaine dominant
  var nCode  = 0; var nLog = 0;
  var textNorm = norm(texte);
  for (var ni = 0; ni < NER_CODE.length; ni++) {
    if (textNorm.indexOf(NER_CODE[ni]) !== -1) nCode++;
  }
  for (var nj = 0; nj < NER_LOGISTIQUE.length; nj++) {
    if (textNorm.indexOf(NER_LOGISTIQUE[nj]) !== -1) nLog++;
  }
  domaineDetecte = nCode > nLog ? 'CODE' : nLog > 0 ? 'LOGISTIQUE' : 'GENERAL';

  for (var ci = 0; ci < chunks.length; ci++) {
    if (onProgres) onProgres({
      etape: 'triplets',
      message: 'Extraction des relations... ' + (ci + 1) + '/' + chunks.length,
      progression: Math.round(((ci + 1) / chunks.length) * 100),
    });

    // Extraire nœuds du chunk
    var noeuds = extraireNoeuds(chunks[ci]);
    totalNoeuds += noeuds.length;

    // Extraire triplets
    var triplets = extraireTriplets(chunks[ci], noeuds);

    // Insérer dans le Knowledge Graph
    for (var ti = 0; ti < triplets.length; ti++) {
      var tr = triplets[ti];
      await ajouterConnaissance(
        tr.source, tr.relation, tr.cible,
        tr.poids, tr.contexte || source,
        domaineDetecte
      );
      totalTriplets++;
    }

    // Pause légère pour ne pas bloquer l'UI
    if (ci % 10 === 9) {
      await new Promise(function(r) { setTimeout(r, 50); });
    }
  }

  return {
    chunks:    chunks.length,
    noeuds:    totalNoeuds,
    triplets:  totalTriplets,
    domaine:   domaineDetecte,
    source:    source,
  };
}

// ── Stats Couche G ────────────────────────────────────────────────────────────

export async function statsLayerG() {
  var { statsGraphe } = require('./aube-knowledge-graph');
  return await statsGraphe();
}
