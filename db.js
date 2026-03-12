// Database Management - SQLite
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || './helena_followup.db';

// Initialize Database
function initDB() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar banco de dados:', err);
        reject(err);
      } else {
        console.log('✅ Banco de dados conectado');
        createTables(db).then(() => resolve(db)).catch(reject);
      }
    });
  });
}

// Create Tables
function createTables(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Settings Table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY,
          key TEXT UNIQUE,
          value TEXT
        )
      `);

      // Campaign Log Table
      db.run(`
        CREATE TABLE IF NOT EXISTS campaign_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          contactId TEXT,
          phone TEXT,
          templateId TEXT,
          templateName TEXT,
          channelId TEXT,
          status TEXT,
          message TEXT
        )
      `);

      // Contact Follow-up State Table
      db.run(`
        CREATE TABLE IF NOT EXISTS contact_followup_state (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contactId TEXT UNIQUE,
          phone TEXT,
          channelId TEXT,
          lastMessageDate DATETIME,
          lastFollowupDate DATETIME,
          daysSinceLastMessage INTEGER
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

// Get Setting
function getSetting(db, key) {
  return new Promise((resolve, reject) => {
    db.get('SELECT value FROM settings WHERE key = ?', [key], (err, row) => {
      if (err) reject(err);
      else resolve(row ? row.value : null);
    });
  });
}

// Set Setting
function setSetting(db, key, value) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, value],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Get Config
async function getConfig(db) {
  const config = {
    selectedChannelId: await getSetting(db, 'selectedChannelId'),
    enabledChannels: JSON.parse(await getSetting(db, 'enabledChannels') || '[]'),
    selectedTags: JSON.parse(await getSetting(db, 'selectedTags') || '[]'),
    selectedTemplate: await getSetting(db, 'selectedTemplate'),
    selectedDays: JSON.parse(await getSetting(db, 'selectedDays') || '[1,3,7,30]')
  };
  return config;
}

// Save Config
async function saveConfig(db, config) {
  await setSetting(db, 'selectedChannelId', config.selectedChannelId || '');
  await setSetting(db, 'enabledChannels', JSON.stringify(config.enabledChannels || []));
  await setSetting(db, 'selectedTags', JSON.stringify(config.selectedTags || []));
  await setSetting(db, 'selectedTemplate', config.selectedTemplate || '');
  await setSetting(db, 'selectedDays', JSON.stringify(config.selectedDays || [1, 3, 7, 30]));
}

// Log Campaign
function logCampaign(db, log) {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO campaign_log (contactId, phone, templateId, templateName, channelId, status, message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        log.contactId,
        log.phone,
        log.templateId,
        log.templateName,
        log.channelId,
        log.status,
        log.message
      ],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

// Get History
function getHistory(db, limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM campaign_log ORDER BY timestamp DESC LIMIT ?',
      [limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

// Get Stats
function getStats(db) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT status, COUNT(*) as count FROM campaign_log GROUP BY status`,
      (err, rows) => {
        if (err) reject(err);
        else {
          const stats = { total: 0, success: 0, error: 0 };
          rows.forEach((row) => {
            stats.total += row.count;
            if (row.status === 'success') stats.success = row.count;
            if (row.status === 'error') stats.error = row.count;
          });
          resolve(stats);
        }
      }
    );
  });
}

module.exports = {
  initDB,
  getSetting,
  setSetting,
  getConfig,
  saveConfig,
  logCampaign,
  getHistory,
  getStats
};
