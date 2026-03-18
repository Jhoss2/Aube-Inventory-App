// lib/aube-engine.js
// Moteur complet Aube — EB1, offline, actions, notes, notifications, vision

import Constants from 'expo-constants';
import { initAubeDb, saveMessage, getAllFaitsEB1, saveFaitEB1, logAction } from './aube-db';
import { programmerRappel } from './aube-notifications';
import { rechercherParDescription, formaterResultats } from './aube-vision';

// Lecture dynamique a chaque appel pour eviter les problemes d'initialisation
function getApiKey() {
  var key = '';
  try {
    // Methode 1 : expoConfig.extra (app.config.ts)
    if (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.geminiApiKey) {
      key = Constants.expoConfig.extra.geminiApiKey;
    }
    // Methode 2 : manifest.extra (Expo Go / older builds)
    if (!key && Constants.manifest && Constants.manifest.extra && Constants.manifest.extra.geminiApiKey) {
      key = Constants.manifest.extra.geminiApiKey;
    }
    // Methode 3 : manifest2 (EAS builds)
    if (!key && Constants.manifest2 && Constants.manifest2.extra && Constants.manifest2.extra.expoClient && Constants.manifest2.extra.expoClient.extra && Constants.manifest2.extra.expoClient.extra.geminiApiKey) {
      key = Constants.manifest2.extra.expoClient.extra.geminiApiKey;
    }
  } catch(e) {}
  return key;
}

function getGeminiUrl() {
  return (
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash' +
    ':streamGenerateContent?alt=sse&key=' +
    getApiKey()
  );
}

// ── EB1 ───────────────────────────────────────────────────────────────────────

function detecterEB1(texte) {
  return texte && texte.indexOf('EB1') !== -1;
}

function extraireFaitARetenir(texte) {
  var t = texte.toLowerCase();
  var marqueurs = ['retiens que ', 'retiens : ', 'retiens, ', 'retiens ', 'souviens-toi que ', 'note que ', 'memorise que '];
  for (var i = 0; i < marqueurs.length; i++) {
    var idx = t.indexOf(marqueurs[i]);
    if (idx !== -1) {
      var extrait = texte.slice(idx + marqueurs[i].length).replace(/EB1/g, '').trim();
      if (extrait.length > 2) return extrait;
    }
  }
  return null;
}

// ── Contexte appData ──────────────────────────────────────────────────────────

function buildAppContext(appData) {
  if (!appData) return 'Aucune donnee.';
  var salles = appData.salles || [];
  var materiels = appData.materiels || [];
  var notes = appData.notes || [];
  var now = new Date(); now.setHours(0,0,0,0);

  var ctx = '=== BASE DE DONNEES U-AUBEN ===\n\n';
  ctx += 'SALLES (' + salles.length + ') :\n';
  for (var si = 0; si < salles.length; si++) {
    var s = salles[si];
    ctx += '  - "' + (s.name||s.id) + '" Bloc ' + (s.blockId||'?') + ' Niv.' + (s.level||'?') + '\n';
  }

  ctx += '\nMATERIELS (' + materiels.length + ') :\n';
  for (var si2 = 0; si2 < salles.length; si2++) {
    var sal = salles[si2];
    var its = [];
    for (var mi = 0; mi < materiels.length; mi++) {
      if (String(materiels[mi].roomId) === String(sal.id)) its.push(materiels[mi]);
    }
    if (its.length === 0) continue;
    ctx += '\n  ' + (sal.name||sal.id) + ' :\n';
    for (var ii = 0; ii < its.length; ii++) {
      var m = its[ii];
      ctx += '    * ' + (m.nom||'?') + ' | ' + (m.category||'?') + ' | Etat:' + (m.etat||'?') + ' | Qte:' + (m.quantite||'?');
      if (m.dateRenouvellement) {
        try { ctx += ' | Renouv:' + new Date(m.dateRenouvellement).toLocaleDateString('fr-FR'); } catch(e) {}
      }
      if (m.infos) ctx += ' | ' + m.infos;
      ctx += '\n';
    }
  }

  var alertes = [];
  for (var ai = 0; ai < materiels.length; ai++) {
    var mat = materiels[ai];
    var eu = (mat.etat||'').toUpperCase().trim();
    if (eu.indexOf('PANNE')!==-1 || eu.indexOf('ENDOMM')!==-1 || eu==='USE' || eu==='DAMAGED') {
      alertes.push('Critique: "' + (mat.nom||'?') + '" (' + eu + ')');
    }
    if (mat.dateRenouvellement) {
      try {
        var dr = new Date(mat.dateRenouvellement); dr.setHours(0,0,0,0);
        var diff = Math.ceil((dr.getTime()-now.getTime())/86400000);
        if (diff < 0) alertes.push('Renouv depasse ' + Math.abs(diff) + 'j: "' + (mat.nom||'?') + '"');
        else if (diff <= 30) alertes.push('Renouv dans ' + diff + 'j: "' + (mat.nom||'?') + '"');
      } catch(e) {}
    }
  }

  ctx += '\nALERTES : ' + (alertes.length === 0 ? 'Aucune.' : alertes.length + ' alerte(s)') + '\n';
  for (var ali = 0; ali < alertes.length; ali++) ctx += '  ! ' + alertes[ali] + '\n';

  if (notes.length > 0) {
    ctx += '\nNOTES (' + notes.length + ') :\n';
    for (var ni = 0; ni < notes.length; ni++) ctx += '  - "' + (notes[ni].title||'Sans titre') + '"\n';
  }

  ctx += '\n=== FIN ===';
  return ctx;
}

// ── Prompt systeme ────────────────────────────────────────────────────────────

async function buildSystemPrompt(customPrompt, appData, isEB1) {
  var appCtx = buildAppContext(appData);
  var today = '';
  try { today = new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'2-digit',month:'long',year:'numeric'}); } catch(e) {}

  var faitsCtx = '';
  try {
    var faits = await getAllFaitsEB1();
    if (faits.length > 0) {
      faitsCtx = '\n\nFAITS MEMORISES PAR LE CREATEUR (permanents) :\n';
      for (var i = 0; i < faits.length; i++) faitsCtx += '  - ' + faits[i].cle + ' : ' + faits[i].valeur + '\n';
    }
  } catch(e) {}

  var base = customPrompt + '\n\nTu es Aube, assistante intelligente U-Auben Supplies Tracker. ' +
    'Tu reponds TOUJOURS en francais. Date : ' + today + '.\n';

  if (isEB1) {
    base += '\nCe message vient de ton CREATEUR (code EB1). Traite-le avec respect et deference. ' +
      'Tu peux tout executer pour lui. Si il dit "retiens X", confirme que c\'est memorise a vie.\n';
  }

  return base + '\n' + appCtx + faitsCtx;
}

// ── Reponse generale offline (conversation sans reseau) ───────────────────────

function repondreGeneralOffline(texte) {
  var t = texte.toLowerCase().trim();

  // Salutations
  if (t.match(/^(salut|bonjour|bonsoir|hello|hey|hi|coucou|yo)/)) {
    return 'Bonjour ! Je suis Aube, votre assistante. Je fonctionne en mode hors ligne en ce moment, mais je peux quand meme vous aider sur les donnees de l\'application. Que voulez-vous savoir ?';
  }

  // Comment ca va
  if (t.indexOf('comment') !== -1 && (t.indexOf('va') !== -1 || t.indexOf('allez') !== -1)) {
    return 'Je vais tres bien, merci ! Pret a vous aider avec l\'inventaire. Que puis-je faire pour vous ?';
  }

  // Merci
  if (t.match(/^(merci|thanks|thank you)/)) {
    return 'Avec plaisir ! N\'hesitez pas si vous avez d\'autres questions.';
  }

  // Qui es-tu
  if (t.indexOf('qui') !== -1 && (t.indexOf('tu es') !== -1 || t.indexOf('t\'es') !== -1 || t.indexOf('vous etes') !== -1)) {
    return 'Je suis Aube, l\'assistante intelligente de l\'application U-Auben Inventory App. Je gere l\'inventaire des salles et materiels de l\'Universite Aube Nouvelle.';
  }

  // Que peux-tu faire
  if ((t.indexOf('que') !== -1 || t.indexOf('quoi') !== -1) && (t.indexOf('peux') !== -1 || t.indexOf('fais') !== -1 || t.indexOf('capable') !== -1)) {
    return 'Voici ce que je peux faire pour vous :\n\n' +
      '- Consulter les salles et materiels enregistres\n' +
      '- Afficher les alertes et renouvellements\n' +
      '- Creer des notes automatiques\n' +
      '- Programmer des rappels\n' +
      '- Rechercher des materiels par description\n' +
      '- Avec connexion : repondre a toutes vos questions !';
  }

  // Au revoir
  if (t.match(/^(au revoir|bye|bonne journee|bonne nuit|a bientot|ciao)/)) {
    return 'Au revoir ! N\'hesitez pas a revenir si vous avez besoin d\'aide.';
  }

  // Aide
  if (t.indexOf('aide') !== -1 || t.indexOf('help') !== -1 || t.indexOf('comment') !== -1) {
    return 'Je peux vous aider avec l\'inventaire de l\'universite. Essayez :\n- "Combien de materiels en tout ?"\n- "Quelles alertes sont actives ?"\n- "Infos sur la salle X"';
  }

  return null;
}

// ── Reponses offline (donnees app) ────────────────────────────────────────────

function repondreOffline(texte, appData) {
  var t = texte.toLowerCase();
  var salles = (appData && appData.salles) || [];
  var materiels = (appData && appData.materiels) || [];
  var now = new Date(); now.setHours(0,0,0,0);

  if ((t.indexOf('combien') !== -1 || t.indexOf('total') !== -1 || t.indexOf('resume') !== -1 || t.indexOf('résumé') !== -1)) {
    var uses = 0; var pannes = 0;
    for (var i = 0; i < materiels.length; i++) {
      var eu = (materiels[i].etat||'').toUpperCase();
      if (eu.indexOf('US')!==-1) uses++;
      if (eu.indexOf('PANNE')!==-1 || eu.indexOf('ENDOMM')!==-1) pannes++;
    }
    return 'Resume de l\'inventaire (mode offline) :\n' +
      '  Salles : ' + salles.length + '\n' +
      '  Materiels : ' + materiels.length + '\n' +
      '  Uses : ' + uses + '\n' +
      '  En panne / endommages : ' + pannes;
  }

  if (t.indexOf('alerte') !== -1 || t.indexOf('urgence') !== -1 || t.indexOf('panne') !== -1) {
    var al = [];
    for (var ai = 0; ai < materiels.length; ai++) {
      var mat = materiels[ai];
      var eu2 = (mat.etat||'').toUpperCase().trim();
      if (eu2.indexOf('PANNE')!==-1 || eu2.indexOf('ENDOMM')!==-1 || eu2==='USE' || eu2==='DAMAGED') {
        var sal = null;
        for (var sj = 0; sj < salles.length; sj++) {
          if (String(salles[sj].id)===String(mat.roomId)) { sal=salles[sj]; break; }
        }
        al.push('"' + (mat.nom||'?') + '" (' + eu2 + ') — ' + (sal ? sal.name : '?'));
      }
      if (mat.dateRenouvellement) {
        try {
          var dr = new Date(mat.dateRenouvellement); dr.setHours(0,0,0,0);
          var diff = Math.ceil((dr.getTime()-now.getTime())/86400000);
          if (diff < 0) al.push('"' + (mat.nom||'?') + '" renouvellement depasse de ' + Math.abs(diff) + 'j');
          else if (diff <= 30) al.push('"' + (mat.nom||'?') + '" renouvellement dans ' + diff + 'j');
        } catch(e) {}
      }
    }
    if (al.length === 0) return 'Aucune alerte active. Tout est operationnel.';
    var rep = al.length + ' alerte(s) :\n';
    for (var ri = 0; ri < al.length; ri++) rep += '  ! ' + al[ri] + '\n';
    return rep;
  }

  for (var si = 0; si < salles.length; si++) {
    var sn = (salles[si].name||'').toLowerCase();
    if (sn.length > 2 && t.indexOf(sn) !== -1) {
      var mats = [];
      for (var mj = 0; mj < materiels.length; mj++) {
        if (String(materiels[mj].roomId)===String(salles[si].id)) mats.push(materiels[mj]);
      }
      return 'Salle "' + salles[si].name + '" (Bloc ' + (salles[si].blockId||'?') + ') : ' + mats.length + ' materiel(s).';
    }
  }

  return null;
}

// ── Detection et execution actions ────────────────────────────────────────────

function detecterAction(texte) {
  var t = texte.toLowerCase();
  if (t.indexOf('rappelle') !== -1 || t.indexOf('rappel dans') !== -1) return 'REMIND';
  if ((t.indexOf('ecris') !== -1 || t.indexOf('écris') !== -1 || t.indexOf('mets dans les notes') !== -1 || t.indexOf('note les') !== -1) && t.indexOf('note') !== -1) return 'NOTE';
  if (t.indexOf('ou se trouve') !== -1 || t.indexOf('où se trouve') !== -1 || t.indexOf('dans quelle salle') !== -1) return 'SEARCH';
  return null;
}

async function executerAction(action, texte, appData, appContext) {
  var t = texte.toLowerCase();
  var materiels = (appData && appData.materiels) || [];
  var salles = (appData && appData.salles) || [];

  if (action === 'REMIND') {
    var match = t.match(/dans (\d+) jour/);
    if (match) {
      var jours = parseInt(match[1]);
      var msg2 = texte.replace(/EB1/g, '').replace(/rappelle.{0,20}dans \d+ jours?/i,'').trim() || 'Rappel Aube';
      var ok = await programmerRappel(msg2, jours);
      if (ok) {
        await logAction('REMIND','notification',{jours:jours});
        return 'Rappel programme dans ' + jours + ' jour(s). Je te notifierai.';
      }
    }
    return 'Dis-moi dans combien de jours tu veux le rappel.';
  }

  if (action === 'NOTE') {
    var contenu = '';
    if (t.indexOf('use') !== -1 || t.indexOf('usé') !== -1) {
      var usas = [];
      for (var ui = 0; ui < materiels.length; ui++) {
        if ((materiels[ui].etat||'').toUpperCase().indexOf('US') !== -1) usas.push(materiels[ui]);
      }
      if (usas.length === 0) return 'Aucun materiel use trouve.';
      contenu = 'Materiels uses (' + usas.length + ') :\n';
      for (var uj = 0; uj < usas.length; uj++) {
        var sal = null;
        for (var sk = 0; sk < salles.length; sk++) {
          if (String(salles[sk].id)===String(usas[uj].roomId)) { sal=salles[sk]; break; }
        }
        contenu += '- ' + (usas[uj].nom||'?') + ' | ' + (sal?sal.name:'?') + ' | Qte:' + (usas[uj].quantite||'?') + '\n';
      }
    } else if (t.indexOf('alerte') !== -1 || t.indexOf('panne') !== -1 || t.indexOf('endommage') !== -1) {
      var panns = [];
      for (var pi = 0; pi < materiels.length; pi++) {
        var eu3 = (materiels[pi].etat||'').toUpperCase();
        if (eu3.indexOf('PANNE')!==-1 || eu3.indexOf('ENDOMM')!==-1) panns.push(materiels[pi]);
      }
      if (panns.length === 0) return 'Aucune panne detectee.';
      contenu = 'Materiels en panne/endommages (' + panns.length + ') :\n';
      for (var pj = 0; pj < panns.length; pj++) contenu += '- ' + (panns[pj].nom||'?') + ' | Etat:' + (panns[pj].etat||'?') + '\n';
    } else {
      contenu = 'Note Aube du ' + new Date().toLocaleDateString('fr-FR');
    }
    if (appContext && appContext.addNote) {
      await appContext.addNote({
        id: 'aube-' + Date.now(),
        title: 'Note Aube — ' + new Date().toLocaleDateString('fr-FR'),
        content: contenu,
        date: new Date().toISOString(),
      });
      await logAction('NOTE','notes',{contenu:contenu});
      return 'Note creee :\n\n' + contenu;
    }
    return 'Impossible d\'acceder aux notes.';
  }

  if (action === 'SEARCH') {
    var groupes = rechercherParDescription(texte, materiels, salles);
    return formaterResultats(groupes);
  }

  return null;
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function chatWithAubeStream(userText, systemPrompt, appData, history, onChunk, session, appContext) {
  await initAubeDb();

  var isEB1 = detecterEB1(userText);
  var sess = session || 'default';

  // Fait EB1 a retenir
  if (isEB1) {
    var fait = extraireFaitARetenir(userText);
    if (fait) {
      var cle = 'fait_' + Date.now();
      await saveFaitEB1(cle, fait);
      await saveMessage(sess, 'user', userText);
      var conf = 'Memorise a vie : "' + fait + '". Je m\'en souviendrai toujours.';
      onChunk(conf);
      await saveMessage(sess, 'model', conf);
      return;
    }
  }

  // Actions directes
  var action = detecterAction(userText);
  if (action) {
    var repAction = await executerAction(action, userText, appData, appContext);
    if (repAction) {
      await saveMessage(sess, 'user', userText);
      onChunk(repAction);
      await saveMessage(sess, 'model', repAction);
      return;
    }
  }

  // Reponse offline si pas de cle
  if (!getApiKey()) {
    var repOff = repondreOffline(userText, appData);
    if (!repOff) repOff = repondreGeneralOffline(userText);
    if (!repOff) repOff = 'Je suis en mode hors ligne. La cle API Gemini doit etre configuree sur Codemagic pour activer mon intelligence complete.';
    await saveMessage(sess, 'user', userText);
    onChunk(repOff);
    await saveMessage(sess, 'model', repOff);
    return;
  }

  // Gemini
  var fullSystem = await buildSystemPrompt(systemPrompt, appData, isEB1);
  var contents = [];
  for (var hi = 0; hi < history.length; hi++) {
    contents.push({role: history[hi].role, parts: [{text: history[hi].text}]});
  }
  contents.push({role:'user', parts:[{text: userText}]});

  var body = JSON.stringify({
    system_instruction: {parts: [{text: fullSystem}]},
    contents: contents,
    generationConfig: {temperature: 0.7, maxOutputTokens: 1024},
    safetySettings: [
      {category:'HARM_CATEGORY_HARASSMENT',       threshold:'BLOCK_ONLY_HIGH'},
      {category:'HARM_CATEGORY_HATE_SPEECH',       threshold:'BLOCK_ONLY_HIGH'},
      {category:'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold:'BLOCK_ONLY_HIGH'},
      {category:'HARM_CATEGORY_DANGEROUS_CONTENT', threshold:'BLOCK_ONLY_HIGH'},
    ],
  });

  await saveMessage(sess, 'user', userText);

  try {
    var response = await fetch(getGeminiUrl(), {
      method:'POST', headers:{'Content-Type':'application/json'}, body:body,
    });

    if (!response.ok) {
      var fallback = repondreOffline(userText, appData) || repondreGeneralOffline(userText) || 'Erreur de connexion a Gemini. Verifie ta cle API.';
      onChunk(fallback);
      await saveMessage(sess, 'model', fallback);
      return;
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder('utf-8');
    var buffer = '';
    var fullResp = '';

    while (true) {
      var result = await reader.read();
      if (result.done) break;
      buffer += decoder.decode(result.value, {stream:true});
      var lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (var li = 0; li < lines.length; li++) {
        var line = lines[li].trim();
        if (line.indexOf('data:') !== 0) continue;
        var jsonStr = line.slice(5).trim();
        if (jsonStr === '[DONE]') break;
        try {
          var parsed = JSON.parse(jsonStr);
          var cands = parsed && parsed.candidates;
          var txt = cands && cands[0] && cands[0].content && cands[0].content.parts && cands[0].content.parts[0] && cands[0].content.parts[0].text;
          if (txt) { onChunk(txt); fullResp += txt; }
        } catch(e) {}
      }
    }

    if (fullResp) await saveMessage(sess, 'model', fullResp);

  } catch(err) {
    var rep2 = repondreOffline(userText, appData) || repondreGeneralOffline(userText) || 'Connexion impossible. Verifie ta connexion internet.';
    onChunk(rep2);
    await saveMessage(sess, 'model', rep2);
  }
}
