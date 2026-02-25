import * as SQLite from 'expo-sqlite';

const dbName = 'LogisticsApp.db';

export const db = SQLite.openDatabaseSync(dbName);

export async function initializeDatabase() {
  try {
    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS salles (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        emplacement TEXT NOT NULL,
        niveau TEXT NOT NULL,
        capacity TEXT,
        area TEXT,
        photoId TEXT,
        plan3dId TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS materiel (
        id TEXT PRIMARY KEY,
        salleId TEXT NOT NULL,
        nom TEXT NOT NULL,
        categorie TEXT,
        dateRen TEXT,
        photoId TEXT,
        status TEXT DEFAULT 'active',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (salleId) REFERENCES salles(id)
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        date TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        materielId TEXT,
        type TEXT NOT NULL,
        message TEXT,
        date TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS aube_kb (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize Aube KB if not exists
    const aubeExists = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM aube_kb WHERE id = ?',
      ['default']
    );

    if (!aubeExists) {
      await db.runAsync(
        'INSERT INTO aube_kb (id, content) VALUES (?, ?)',
        ['default', 'Je suis Aube, l\'assistant logistique.']
      );
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Helper functions for file storage (images, PDFs)
export async function saveFileToDb(fileId: string, dataUrl: string): Promise<void> {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO files (id, data) VALUES (?, ?)',
      [fileId, dataUrl]
    );
  } catch (error) {
    console.error('Error saving file to DB:', error);
    throw error;
  }
}

export async function loadFileFromDb(fileId: string): Promise<string | null> {
  try {
    const result = await db.getFirstAsync<{ data: string }>(
      'SELECT data FROM files WHERE id = ?',
      [fileId]
    );
    return result?.data || null;
  } catch (error) {
    console.error('Error loading file from DB:', error);
    return null;
  }
}

export async function deleteFileFromDb(fileId: string): Promise<void> {
  try {
    await db.runAsync('DELETE FROM files WHERE id = ?', [fileId]);
  } catch (error) {
    console.error('Error deleting file from DB:', error);
    throw error;
  }
}

// Settings helpers
export async function saveSetting(key: string, value: string): Promise<void> {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    );
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return result?.value || null;
  } catch (error) {
    console.error('Error getting setting:', error);
    return null;
  }
}

// Aube KB helpers
export async function getAubeKb(): Promise<string> {
  try {
    const result = await db.getFirstAsync<{ content: string }>(
      'SELECT content FROM aube_kb WHERE id = ?',
      ['default']
    );
    return result?.content || 'Je suis Aube, l\'assistant logistique.';
  } catch (error) {
    console.error('Error getting Aube KB:', error);
    return 'Je suis Aube, l\'assistant logistique.';
  }
}

export async function saveAubeKb(content: string): Promise<void> {
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO aube_kb (id, content) VALUES (?, ?)',
      ['default', content]
    );
  } catch (error) {
    console.error('Error saving Aube KB:', error);
    throw error;
  }
}
