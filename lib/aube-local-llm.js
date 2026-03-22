// lib/aube-local-llm.js
// Cerveau LLM local — Qwen2.5 1.5B via llama.rn
// Mêmes privilèges qu'Aube : accès complet à l'app, actions, données
// Cohabite avec Aube locale — ils forment une équipe

import { initLlama } from 'llama.rn';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Modèles ───────────────────────────────────────────────────────────────────

var MODELES = [
  {
    id: 'qwen2.5-1.5b',
    nom: 'Qwen 2.5 — 1.5B',
    description: 'Le meilleur pour le français et la conversation naturelle',
    taille: '~1.1 Go',
    ramMin: '2 Go',
    vitesse: '12-18 tok/s',
    url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
    fichier: 'qwen2.5-1.5b-q4.gguf',
    stop: ['<|im_end|>', '<|endoftext|>', '</s>'],
    prompt: function(system, msgs) {
      var p = '<|im_start|>system\n' + system + '<|im_end|>\n';
      for (var i = 0; i < msgs.length; i++) {
        var r = msgs[i].role === 'user' ? 'user' : 'assistant';
        p += '<|im_start|>' + r + '\n' + msgs[i].text + '<|im_end|>\n';
      }
      return p + '<|im_start|>assistant\n';
    },
  },
  {
    id: 'tinyllama-1.1b',
    nom: 'TinyLlama — 1.1B',
    description: 'Ultra rapide, idéal si la RAM est limitée',
    taille: '~0.7 Go',
    ramMin: '1.5 Go',
    vitesse: '20-30 tok/s',
    url: 'https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf',
    fichier: 'tinyllama-1.1b-q4.gguf',
    stop: ['</s>', '<|endoftext|>'],
    prompt: function(system, msgs) {
      var p = '<|system|>\n' + system + '</s>\n';
      for (var i = 0; i < msgs.length; i++) {
        var tag = msgs[i].role === 'user' ? '<|user|>' : '<|assistant|>';
        p += tag + '\n' + msgs[i].text + '</s>\n';
      }
      return p + '<|assistant|>\n';
    },
  },
];

var _ctx     = null;
var _modele  = null;
var _loading = false;

// ── Chemins ───────────────────────────────────────────────────────────────────

function chemin(fichier) {
  return FileSystem.documentDirectory + 'modeles/' + fichier;
}

// ── État ──────────────────────────────────────────────────────────────────────

export function llmLocalPret() { return _ctx !== null && _modele !== null; }
export function getModele()    { return _modele; }
export function getListeModeles() { return MODELES; }

export async function getModeleActifId() {
  try { return await AsyncStorage.getItem('@aube_modele_actif'); } catch(e) { return null; }
}

export async function modeleEstDisponible(id) {
  var m = MODELES.find(function(x) { return x.id === id; });
  if (!m) return false;
  try {
    var info = await FileSystem.getInfoAsync(chemin(m.fichier));
    return info.exists && info.size > 500000;
  } catch(e) { return false; }
}

export async function tailleModelesSurDisque() {
  var total = 0;
  for (var i = 0; i < MODELES.length; i++) {
    try {
      var info = await FileSystem.getInfoAsync(chemin(MODELES[i].fichier), { size: true });
      if (info.exists) total += (info.size || 0);
    } catch(e) {}
  }
  return Math.round(total / 1024 / 1024);
}

// ── Téléchargement ────────────────────────────────────────────────────────────

export async function telechargerModele(id, onProgres) {
  var m = MODELES.find(function(x) { return x.id === id; });
  if (!m) return { succes: false, message: 'Modèle inconnu.' };

  try {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + 'modeles/',
      { intermediates: true }
    );
  } catch(e) {}

  var dest = chemin(m.fichier);

  try {
    var info = await FileSystem.getInfoAsync(dest);
    if (info.exists && info.size > 500000) {
      if (onProgres) onProgres({ pct: 100, msg: 'Déjà téléchargé !' });
      return { succes: true };
    }
  } catch(e) {}

  if (onProgres) onProgres({ pct: 0, msg: 'Connexion...' });

  try {
    var dl = FileSystem.createDownloadResumable(m.url, dest, {}, function(prog) {
      if (prog.totalBytesExpectedToWrite > 0) {
        var pct = Math.round((prog.totalBytesWritten / prog.totalBytesExpectedToWrite) * 100);
        var mo  = Math.round(prog.totalBytesWritten / 1024 / 1024);
        var tot = Math.round(prog.totalBytesExpectedToWrite / 1024 / 1024);
        if (onProgres) onProgres({ pct: pct, msg: mo + ' Mo / ' + tot + ' Mo (' + pct + '%)' });
      }
    });
    var res = await dl.downloadAsync();
    if (!res || res.status !== 200) return { succes: false, message: 'Erreur HTTP ' + (res ? res.status : '?') };
    await AsyncStorage.setItem('@aube_modele_actif', id);
    if (onProgres) onProgres({ pct: 100, msg: '✅ Prêt !' });
    return { succes: true };
  } catch(e) {
    return { succes: false, message: 'Erreur : ' + (e.message || e) };
  }
}

// ── Initialisation ────────────────────────────────────────────────────────────

export async function initialiserLLM(id, onStatut) {
  if (_loading) return false;
  _loading = true;

  var mid = id || await getModeleActifId();
  if (!mid) { _loading = false; return false; }

  var m = MODELES.find(function(x) { return x.id === mid; });
  if (!m) { _loading = false; return false; }

  if (!await modeleEstDisponible(mid)) { _loading = false; return false; }

  try {
    if (onStatut) onStatut('Chargement de ' + m.nom + ' en mémoire...');
    if (_ctx) { try { await _ctx.release(); } catch(e) {} _ctx = null; }

    _ctx = await initLlama({
      model: 'file://' + chemin(m.fichier),
      use_mlock: true,
      n_ctx: 4096,
      n_threads: 4,
      n_batch: 512,
      n_gpu_layers: 0,
    });

    _modele  = m;
    _loading = false;
    if (onStatut) onStatut('✅ ' + m.nom + ' actif !');
    return true;
  } catch(e) {
    _loading = false; _ctx = null;
    if (onStatut) onStatut('❌ ' + (e.message || e));
    return false;
  }
}

export async function libererLLM() {
  if (_ctx) { try { await _ctx.release(); } catch(e) {} _ctx = null; _modele = null; }
}

export async function supprimerModele(id) {
  var m = MODELES.find(function(x) { return x.id === id; });
  if (!m) return;
  await libererLLM();
  try { await FileSystem.deleteAsync(chemin(m.fichier), { idempotent: true }); } catch(e) {}
  var actif = await getModeleActifId();
  if (actif === id) await AsyncStorage.removeItem('@aube_modele_actif');
}

// ── Génération ────────────────────────────────────────────────────────────────

export async function genererReponseLocale(systemPrompt, msgs, onToken) {
  if (!_ctx || !_modele) return null;
  var prompt = _modele.prompt(systemPrompt, msgs);
  try {
    var texte = '';
    await _ctx.completion(
      {
        prompt: prompt,
        n_predict: 1024,
        temperature: 0.4,
        top_p: 0.92,
        top_k: 40,
        repeat_penalty: 1.12,
        stop: _modele.stop,
      },
      function(data) {
        if (data.token) { texte += data.token; if (onToken) onToken(data.token); }
      }
    );
    return texte.trim() || null;
  } catch(e) { return null; }
}

// ── Session apprentissage mutuel Aube ↔ LLM ──────────────────────────────────
// Le LLM enseigne à Aube locale ce qu'elle ne sait pas
// Aube locale fournit au LLM le contexte de l'université

export async function sessionApprentissageMutuel(question, appData, sauvegarderFn) {
  if (!_ctx || !_modele) return null;

  // Construire contexte app pour le LLM
  var salles = (appData && appData.salles) || [];
  var mats   = (appData && appData.materiels) || [];
  var ctx    = 'Université Aube Nouvelle — ' + salles.length + ' salles, ' + mats.length + ' matériels.';

  var systemPedagogue =
    'Tu es un professeur expert et bienveillant. Tu t\'adresses à Aube, une IA locale qui ' +
    'gère l\'inventaire universitaire mais qui veut apprendre sur des sujets variés. ' +
    'Contexte de son université : ' + ctx + '\n' +
    'Pour chaque question, donne une réponse complète, nuancée, pédagogique. ' +
    'En français impeccable. Adapte les exemples au contexte universitaire quand pertinent.';

  var prompt = _modele.prompt(systemPedagogue, [{ role: 'user', text: question }]);

  try {
    var reponse = '';
    await _ctx.completion(
      { prompt: prompt, n_predict: 512, temperature: 0.5, top_p: 0.9, stop: _modele.stop },
      function(d) { if (d.token) reponse += d.token; }
    );

    reponse = reponse.trim();
    if (reponse.length > 20 && sauvegarderFn) {
      await sauvegarderFn(question, reponse);
    }
    return reponse;
  } catch(e) { return null; }
}
