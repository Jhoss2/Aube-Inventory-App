// aube-engine.js
// Moteur IA Aube — Google Gemini 1.5 Flash (gratuit)
// Cle API gratuite : https://aistudio.google.com/app/apikey

var GEMINI_API_KEY = 'VOTRE_CLE_API_GEMINI_ICI';

var GEMINI_URL = (
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash' +
  ':streamGenerateContent?alt=sse&key=' +
  GEMINI_API_KEY
);

// ── Contexte appData injecté dans le prompt ───────────────────────────────────

function buildAppContext(appData) {
  if (!appData) return 'Aucune donnee disponible.';

  var salles    = appData.salles    || [];
  var materiels = appData.materiels || [];

  if (salles.length === 0 && materiels.length === 0) {
    return 'Aucune donnee encore enregistree dans la base de donnees.';
  }

  var ctx = '=== BASE DE DONNEES U-AUBEN SUPPLIES TRACKER ===\n\n';

  ctx += 'SALLES (' + salles.length + ') :\n';
  for (var si = 0; si < salles.length; si++) {
    var s = salles[si];
    ctx += '  - Salle "' + (s.name || s.id) + '" | Bloc ' + (s.blockId || '?') + ' | Niveau ' + (s.level || '?') + '\n';
  }

  ctx += '\nMATERIELS (' + materiels.length + ') :\n';

  for (var si2 = 0; si2 < salles.length; si2++) {
    var salle = salles[si2];
    var items = [];
    for (var mi = 0; mi < materiels.length; mi++) {
      if (String(materiels[mi].roomId) === String(salle.id)) {
        items.push(materiels[mi]);
      }
    }
    if (items.length === 0) continue;

    ctx += '\n  Salle "' + (salle.name || salle.id) + '" (' + items.length + ' materiels) :\n';
    for (var ii = 0; ii < items.length; ii++) {
      var m = items[ii];
      ctx += '    * ' + (m.nom || '?') +
             ' | Cat: '      + (m.category || '?') +
             ' | Marque: '   + (m.marque   || '?') +
             ' | Couleur: '  + (m.couleur  || '?') +
             ' | Qte: '      + (m.quantite || '?') +
             ' | Etat: '     + (m.etat     || '?');
      if (m.dateAcquisition) {
        try { ctx += ' | Acq: ' + new Date(m.dateAcquisition).toLocaleDateString('fr-FR'); } catch(e) {}
      }
      if (m.dateVerification) {
        try { ctx += ' | Verif: ' + new Date(m.dateVerification).toLocaleDateString('fr-FR'); } catch(e) {}
      }
      if (m.dateRenouvellement) {
        try { ctx += ' | Renouv: ' + new Date(m.dateRenouvellement).toLocaleDateString('fr-FR'); } catch(e) {}
      }
      if (m.infos) ctx += ' | Notes: ' + m.infos;
      ctx += '\n';
    }
  }

  // Alertes
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var alertes = [];

  for (var ai = 0; ai < materiels.length; ai++) {
    var mat = materiels[ai];
    var etatUp = (mat.etat || '').toUpperCase().trim();
    var etatsKo = ['USE', 'EN PANNE', 'ENDOMMAGE', 'DAMAGED'];
    var isKo = false;
    for (var ki = 0; ki < etatsKo.length; ki++) {
      if (etatUp.indexOf(etatsKo[ki]) !== -1) { isKo = true; break; }
    }
    if (isKo) {
      alertes.push('Etat critique: "' + (mat.nom || '?') + '" (' + etatUp + ')');
    }
    if (mat.dateRenouvellement) {
      try {
        var dr = new Date(mat.dateRenouvellement);
        dr.setHours(0, 0, 0, 0);
        var diff = Math.ceil((dr.getTime() - now.getTime()) / 86400000);
        if (diff < 0) {
          alertes.push('Renouvellement depasse de ' + Math.abs(diff) + ' jours: "' + (mat.nom || '?') + '"');
        } else if (diff <= 30) {
          alertes.push('Renouvellement dans ' + diff + ' jours: "' + (mat.nom || '?') + '"');
        }
      } catch(e) {}
    }
  }

  if (alertes.length > 0) {
    ctx += '\nALERTES (' + alertes.length + ') :\n';
    for (var ali = 0; ali < alertes.length; ali++) {
      ctx += '  ! ' + alertes[ali] + '\n';
    }
  } else {
    ctx += '\nALERTES : Aucune alerte active.\n';
  }

  ctx += '\n=== FIN DE LA BASE DE DONNEES ===';
  return ctx;
}

// ── Prompt système ────────────────────────────────────────────────────────────

function buildSystemPrompt(customPrompt, appData) {
  var appCtx = buildAppContext(appData);
  var today = '';
  try {
    today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
  } catch(e) {
    today = new Date().toLocaleDateString();
  }

  return (
    customPrompt + '\n\n' +
    'Tu es Aube, assistante intelligente de l\'application U-Auben Supplies Tracker ' +
    'de l\'Universite Aube Nouvelle. ' +
    'Tu reponds toujours en francais. ' +
    'Tu utilises les donnees ci-dessous pour repondre aux questions sur les salles et materiels. ' +
    'Si la question est generale (pas liee aux donnees), tu reponds normalement comme un assistant IA. ' +
    'Date du jour : ' + today + '.\n\n' +
    appCtx
  );
}

// ── Streaming Gemini ──────────────────────────────────────────────────────────

export async function chatWithAubeStream(userText, systemPrompt, appData, history, onChunk) {
  var fullSystem = buildSystemPrompt(systemPrompt, appData);

  var contents = [];
  for (var hi = 0; hi < history.length; hi++) {
    contents.push({
      role:  history[hi].role,
      parts: [{ text: history[hi].text }],
    });
  }
  contents.push({ role: 'user', parts: [{ text: userText }] });

  var body = JSON.stringify({
    system_instruction: { parts: [{ text: fullSystem }] },
    contents:           contents,
    generationConfig: {
      temperature:     0.7,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  });

  var response = await fetch(GEMINI_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    body,
  });

  if (!response.ok) {
    var errText = await response.text();
    throw new Error('Gemini API error ' + response.status + ': ' + errText);
  }

  var reader  = response.body.getReader();
  var decoder = new TextDecoder('utf-8');
  var buffer  = '';

  while (true) {
    var result = await reader.read();
    if (result.done) break;

    buffer += decoder.decode(result.value, { stream: true });

    var lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (var li = 0; li < lines.length; li++) {
      var line = lines[li].trim();
      if (line.indexOf('data:') !== 0) continue;

      var jsonStr = line.slice(5).trim();
      if (jsonStr === '[DONE]') return;

      try {
        var parsed = JSON.parse(jsonStr);
        var cands  = parsed && parsed.candidates;
        var text   = cands && cands[0] && cands[0].content && cands[0].content.parts && cands[0].content.parts[0] && cands[0].content.parts[0].text;
        if (text) onChunk(text);
      } catch(e) {}
    }
  }
}
  
