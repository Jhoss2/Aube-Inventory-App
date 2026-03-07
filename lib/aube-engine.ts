/**
 * aube-engine.ts
 * Moteur IA d'Aube — Google Gemini 1.5 Flash (gratuit)
 * Hybride : données locales de l'app + connaissances générales
 *
 * Clé API : obtenez la vôtre gratuitement sur https://aistudio.google.com/app/apikey
 * Remplacez GEMINI_API_KEY ci-dessous par votre clé.
 */

const GEMINI_API_KEY = 'VOTRE_CLE_API_GEMINI_ICI';
const GEMINI_MODEL   = 'gemini-1.5-flash';
const GEMINI_URL     =
  'https://generativelanguage.googleapis.com/v1beta/models/' +
  GEMINI_MODEL +
  ':streamGenerateContent?alt=sse&key=' +
  GEMINI_API_KEY;

// ── Types ─────────────────────────────────────────────────────────────────────

type GeminiPart    = { text: string };
type GeminiContent = { role: 'user' | 'model'; parts: GeminiPart[] };

export type AubeMessage = {
  role: 'user' | 'model';
  text: string;
};

// ── Formatage du contexte appData ─────────────────────────────────────────────

function buildAppContext(appData: any): string {
  if (!appData) return '';

  const salles    = appData.salles    || [];
  const materiels = appData.materiels || [];

  if (salles.length === 0 && materiels.length === 0) {
    return 'Aucune donnée encore enregistrée dans la base de données.';
  }

  let ctx = '=== BASE DE DONNÉES U-AUBEN SUPPLIES TRACKER ===\n\n';

  // Salles
  ctx += 'SALLES ENREGISTRÉES (' + salles.length + ') :\n';
  salles.forEach(function(s: any) {
    ctx += '  - Salle "' + (s.name || s.id) + '" | Bloc ' + (s.blockId || '?') +
           ' | Niveau ' + (s.level || '?') + '\n';
  });

  ctx += '\nMATÉRIELS ENREGISTRÉS (' + materiels.length + ') :\n';

  // Grouper par salle pour plus de clarté
  salles.forEach(function(s: any) {
    var items = materiels.filter(function(m: any) {
      return String(m.roomId) === String(s.id);
    });
    if (items.length === 0) return;

    ctx += '\n  Salle "' + (s.name || s.id) + '" (' + items.length + ' matériels) :\n';
    items.forEach(function(m: any) {
      ctx += '    * ' + (m.nom || '?') +
             ' | Catégorie: ' + (m.category || '?') +
             ' | Marque: '    + (m.marque   || '?') +
             ' | Couleur: '   + (m.couleur  || '?') +
             ' | Quantité: '  + (m.quantite || '?') +
             ' | État: '      + (m.etat     || '?');
      if (m.dateAcquisition)    ctx += ' | Acquisition: '    + new Date(m.dateAcquisition).toLocaleDateString('fr-FR');
      if (m.dateVerification)   ctx += ' | Vérification: '   + new Date(m.dateVerification).toLocaleDateString('fr-FR');
      if (m.dateRenouvellement) ctx += ' | Renouvellement: ' + new Date(m.dateRenouvellement).toLocaleDateString('fr-FR');
      if (m.infos)              ctx += ' | Notes: '          + m.infos;
      ctx += '\n';
    });
  });

  // Matériels sans salle connue
  var orphelins = materiels.filter(function(m: any) {
    return !salles.find(function(s: any) { return String(s.id) === String(m.roomId); });
  });
  if (orphelins.length > 0) {
    ctx += '\n  Matériels sans salle associée (' + orphelins.length + ') :\n';
    orphelins.forEach(function(m: any) {
      ctx += '    * ' + (m.nom || '?') + ' | État: ' + (m.etat || '?') + '\n';
    });
  }

  // Alertes automatiques
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var alertes: string[] = [];

  materiels.forEach(function(m: any) {
    var etatUp = (m.etat || '').toUpperCase().trim();
    if (['USÉ', 'USE', 'EN PANNE', 'ENDOMMAGÉ', 'ENDOMMAGE', 'DAMAGED'].includes(etatUp)) {
      var salle = salles.find(function(s: any) { return String(s.id) === String(m.roomId); });
      alertes.push('État critique: "' + (m.nom || '?') + '" (' + etatUp + ') dans salle "' + (salle ? salle.name : '?') + '"');
    }
    if (m.dateRenouvellement) {
      try {
        var dr = new Date(m.dateRenouvellement);
        dr.setHours(0, 0, 0, 0);
        var diff = Math.ceil((dr.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 0) {
          alertes.push('Renouvellement DÉPASSÉ de ' + Math.abs(diff) + ' jours: "' + (m.nom || '?') + '"');
        } else if (diff <= 30) {
          alertes.push('Renouvellement dans ' + diff + ' jours: "' + (m.nom || '?') + '"');
        }
      } catch {}
    }
  });

  if (alertes.length > 0) {
    ctx += '\nALERTES ACTIVES (' + alertes.length + ') :\n';
    alertes.forEach(function(a) { ctx += '  ⚠️ ' + a + '\n'; });
  } else {
    ctx += '\nALERTES : Aucune alerte active.\n';
  }

  ctx += '\n=== FIN DE LA BASE DE DONNÉES ===';
  return ctx;
}

// ── Prompt système ────────────────────────────────────────────────────────────

function buildSystemPrompt(customPrompt: string, appData: any): string {
  var appCtx = buildAppContext(appData);
  var today  = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    customPrompt + '\n\n' +
    'Tu es un assistant intelligent intégré à l\'application U-Auben Supplies Tracker ' +
    'de l\'Université Aube Nouvelle. ' +
    'Tu réponds TOUJOURS en français. ' +
    'Tu es précis, bienveillant, et tu utilises les données ci-dessous pour répondre ' +
    'aux questions sur les salles, matériels, états et alertes. ' +
    'Si la question ne concerne pas les données, tu réponds normalement comme un assistant IA général. ' +
    'Date d\'aujourd\'hui : ' + today + '.\n\n' +
    appCtx
  );
}

// ── Historique → format Gemini ────────────────────────────────────────────────

function historyToGemini(history: AubeMessage[]): GeminiContent[] {
  return history.map(function(msg) {
    return {
      role:  msg.role,
      parts: [{ text: msg.text }],
    };
  });
}

// ── Streaming Gemini ──────────────────────────────────────────────────────────

export async function chatWithAubeStream(
  userText:     string,
  systemPrompt: string,
  appData:      any,
  history:      AubeMessage[],
  onChunk:      (chunk: string) => void
): Promise<void> {

  var fullSystem = buildSystemPrompt(systemPrompt, appData);
  var contents   = historyToGemini(history);

  // Ajoute le message actuel
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

  // Lecture du stream SSE
  var reader = response.body!.getReader();
  var decoder = new TextDecoder('utf-8');
  var buffer  = '';

  while (true) {
    var result = await reader.read();
    if (result.done) break;

    buffer += decoder.decode(result.value, { stream: true });

    // Parse les lignes SSE
    var lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line.startsWith('data:')) continue;

      var jsonStr = line.slice(5).trim();
      if (jsonStr === '[DONE]') return;

      try {
        var parsed = JSON.parse(jsonStr);
        var text   = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) onChunk(text);
      } catch {}
    }
  }
                   }
    
