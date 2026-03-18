// lib/aube-db.js
// Base SQLite d'Aube — memoire, faits EB1, historique conversations

import * as SQLite from 'expo-sqlite';

var _db = null;

export async function initAubeDb() {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('aube.db');

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS conversations (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  session TEXT NOT NULL,' +
    '  role TEXT NOT NULL,' +
    '  content TEXT NOT NULL,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS faits_eb1 (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  cle TEXT UNIQUE NOT NULL,' +
    '  valeur TEXT NOT NULL,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  await _db.execAsync(
    'CREATE TABLE IF NOT EXISTS actions_log (' +
    '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
    '  action TEXT NOT NULL,' +
    '  entite TEXT NOT NULL,' +
    '  data TEXT NOT NULL,' +
    '  timestamp TEXT NOT NULL' +
    ');'
  );

  return _db;
}

function db() { return _db; }

// ── Conversations ─────────────────────────────────────────────────────────────

export async function saveMessage(session, role, content) {
  if (!db()) return;
  await db().runAsync(
    'INSERT INTO conversations (session, role, content, timestamp) VALUES (?, ?, ?, ?)',
    [session, role, content, new Date().toISOString()]
  );
}

export async function getSessionHistory(session, limit) {
  if (!db()) return [];
  var lim = limit || 20;
  var rows = await db().getAllAsync(
    'SELECT id, role, content FROM conversations WHERE session = ? ORDER BY id DESC LIMIT ?',
    [session, lim]
  );
  return rows.reverse();
}

export async function deleteMessageById(id) {
  if (!db()) return;
  await db().runAsync('DELETE FROM conversations WHERE id = ?', [id]);
}

export async function clearSession(session) {
  if (!db()) return;
  await db().runAsync('DELETE FROM conversations WHERE session = ?', [session]);
}

// ── Faits EB1 (memorises a vie par le createur) ───────────────────────────────

export async function saveFaitEB1(cle, valeur) {
  if (!db()) return;
  await db().runAsync(
    'INSERT OR REPLACE INTO faits_eb1 (cle, valeur, timestamp) VALUES (?, ?, ?)',
    [cle, valeur, new Date().toISOString()]
  );
}

export async function getFaitEB1(cle) {
  if (!db()) return null;
  var row = await db().getFirstAsync(
    'SELECT valeur FROM faits_eb1 WHERE cle = ?', [cle]
  );
  return row ? row.valeur : null;
}

export async function getAllFaitsEB1() {
  if (!db()) return [];
  return await db().getAllAsync(
    'SELECT cle, valeur FROM faits_eb1 ORDER BY timestamp DESC'
  );
}

export async function deleteFaitEB1(cle) {
  if (!db()) return;
  await db().runAsync('DELETE FROM faits_eb1 WHERE cle = ?', [cle]);
}

// ── Log actions ───────────────────────────────────────────────────────────────

export async function logAction(action, entite, data) {
  if (!db()) return;
  await db().runAsync(
    'INSERT INTO actions_log (action, entite, data, timestamp) VALUES (?, ?, ?, ?)',
    [action, entite, JSON.stringify(data), new Date().toISOString()]
  );
}
