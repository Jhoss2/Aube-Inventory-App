// lib/aube-layer-h.js
// COUCHE H — Harmonisation / Autocorrection
// "Avant de répondre, Aube relit son propre raisonnement"
// Co-conçu Claude + Gemini
// Vérifie les contradictions dans le graphe AVANT l'affichage

import * as SQLite from 'expo-sqlite';

var _db = null;

async function getDb() {
  if (_db) return _db;
  try {
    _db = await SQLite.openDatabaseAsync('aube_knowledge.db');
    return _db;
  } catch(e) { return null; }
}

// ── Détecteur de contradictions ───────────────────────────────────────────────

export async function verifierContradictions(reponse, contexte) {
  var db = await getDb();
  if (!db) return { valide: true, reponse: reponse, corrections: [] };

  var corrections = [];
  var repCorrigee = reponse;
  var tRep = reponse.toLowerCase();

  try {
    // Chercher toutes les arêtes "contredit" dans le graphe
    var contradictions = await db.getAllAsync(
      'SELECT n1.label as source, n2.label as cible, a.contexte, a.poids ' +
      'FROM aretes a ' +
      'JOIN noeuds n1 ON n1.id = a.source_id ' +
      'JOIN noeuds n2 ON n2.id = a.cible_id ' +
      'WHERE a.relation = "contredit" AND a.poids > 0.7'
    );

    for (var i = 0; i < contradictions.length; i++) {
      var c = contradictions[i];
      var sLbl = c.source.toLowerCase().replace(/_/g, ' ');
      var cLbl = c.cible.toLowerCase().replace(/_/g, ' ');

      // Si la réponse affirme quelque chose qui est contredit dans le graphe
      if (tRep.indexOf(sLbl) !== -1 && tRep.indexOf(cLbl) !== -1) {
        corrections.push({
          type:    'contradiction',
          source:  c.source,
          cible:   c.cible,
          contexte: c.contexte || '',
          poids:   c.poids,
        });
      }
    }

    // Vérifier cohérence version/langage
    // Ex: si réponse dit "yield" mais contexte est Python 2.7 → avertir
    if (contexte) {
      var ctxNorm = contexte.toLowerCase();
      if (ctxNorm.indexOf('python 2') !== -1 && tRep.indexOf('f-string') !== -1) {
        corrections.push({
          type:    'version',
          message: 'Les f-strings nécessitent Python 3.6+. Votre contexte mentionne Python 2.',
          poids:   0.95,
        });
        repCorrigee = repCorrigee.replace(
          /f['"]/g,
          'str.format() (Python 2 ne supporte pas les f-strings)'
        );
      }
      if (ctxNorm.indexOf('python 2') !== -1 && tRep.indexOf('yield from') !== -1) {
        corrections.push({
          type:    'version',
          message: '"yield from" nécessite Python 3. En Python 2, utilisez une boucle for.',
          poids:   0.95,
        });
      }
    }

  } catch(e) {}

  return {
    valide:      corrections.length === 0,
    reponse:     repCorrigee,
    corrections: corrections,
    nbCorrections: corrections.length,
  };
}

// ── Vérificateur de cohérence logistique ─────────────────────────────────────

export async function verifierCoherenceLogistique(reponse, appData) {
  if (!appData) return { valide: true, reponse: reponse };

  var corrections = [];
  var repCorrigee = reponse;
  var tRep = reponse.toLowerCase();

  var materiels = (appData.materiels || []);
  var salles    = (appData.salles    || []);

  // Vérifier : si Aube mentionne un matériel, vérifier qu'il existe réellement
  var noms = materiels.map(function(m) { return (m.nom || '').toLowerCase(); });

  // Détecter les chiffres/stats dans la réponse et les valider
  var nbRegex = /(\d+)\s+(salle|materiel|equipement|projecteur|ordinateur)/gi;
  var match;
  while ((match = nbRegex.exec(reponse)) !== null) {
    var nb      = parseInt(match[1]);
    var type    = match[2].toLowerCase();
    var nbReel  = 0;

    if (type === 'salle') nbReel = salles.length;
    else {
      nbReel = materiels.filter(function(m) {
        return (m.category || '').toLowerCase().indexOf(type) !== -1 ||
               (m.nom || '').toLowerCase().indexOf(type) !== -1;
      }).length;
    }

    // Si l'écart est significatif → corriger
    if (nbReel > 0 && Math.abs(nb - nbReel) > 2) {
      corrections.push({
        type:    'chiffre_incorrect',
        trouve:  nb,
        reel:    nbReel,
        element: type,
      });
      repCorrigee = repCorrigee.replace(
        new RegExp(nb + '\\s+' + type, 'gi'),
        nbReel + ' ' + type
      );
    }
  }

  return {
    valide:        corrections.length === 0,
    reponse:       repCorrigee,
    corrections:   corrections,
    nbCorrections: corrections.length,
  };
}

// ── Vérificateur principal — orchestre tout ───────────────────────────────────

export async function harmoniser(reponse, appData, contexte) {
  if (!reponse || reponse.length < 10) return reponse;

  try {
    // Étape 1 : Contradictions dans le graphe
    var r1 = await verifierContradictions(reponse, contexte);

    // Étape 2 : Cohérence logistique avec données réelles
    var r2 = await verifierCoherenceLogistique(r1.reponse, appData);

    var nbTotal = r1.nbCorrections + r2.nbCorrections;
    var repFinale = r2.reponse;

    // Si corrections significatives → ajouter note de transparence
    if (nbTotal > 0 && r2.corrections.some(function(c) { return c.type === 'chiffre_incorrect'; })) {
      repFinale += '\n\n_(Réponse vérifiée et corrigée par ma couche de validation.)_';
    }

    return repFinale;
  } catch(e) {
    return reponse; // En cas d'erreur → retourner la réponse originale sans bloquer
  }
}
