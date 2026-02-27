
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT,
    time TEXT
  )`);
});

app.post('/activity', (req, res) => {
  const { type, title } = req.body;
  db.run("INSERT INTO activities (type, title) VALUES (?, ?)", [type, title]);
  res.json({ status: "Activity logged" });
});

app.get('/activities', (req, res) => {
  db.all("SELECT * FROM activities ORDER BY timestamp DESC", [], (err, rows) => {
    res.json(rows);
  });
});

app.listen(5000, () => console.log("Backend running on port 5000"));
