const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'activities.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    unit TEXT DEFAULT 'minutes',
    notes TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

module.exports = db;