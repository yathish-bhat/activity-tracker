const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'activities.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    unit TEXT DEFAULT 'minutes',
    notes TEXT,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    actual_duration INTEGER,
    actual_unit TEXT,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Migration: add columns if they don't exist (safe for existing DBs)
try { db.exec('ALTER TABLE activities ADD COLUMN status TEXT DEFAULT "pending"'); } catch(e) {}
try { db.exec('ALTER TABLE activities ADD COLUMN actual_duration INTEGER'); } catch(e) {}
try { db.exec('ALTER TABLE activities ADD COLUMN actual_unit TEXT'); } catch(e) {}
try { db.exec('ALTER TABLE activities ADD COLUMN completed_at DATETIME'); } catch(e) {}

module.exports = db;