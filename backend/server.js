const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    emoji TEXT,
    scheduled_time TEXT,
    status TEXT DEFAULT 'pending',
    date TEXT,
    completed_at TEXT
  )`);
});

app.post("/activity", (req, res) => {
  const { type, title, emoji, scheduled_time, date } = req.body;
  db.run(
    `INSERT INTO activities (type,title,emoji,scheduled_time,date)
     VALUES (?,?,?,?,?)`,
    [type, title, emoji, scheduled_time, date],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

app.get("/activities/today", (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  db.all(
    "SELECT * FROM activities WHERE date=? ORDER BY id DESC",
    [today],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

app.get("/activities/all", (req, res) => {
  db.all("SELECT * FROM activities ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.put("/activity/:id/status", (req, res) => {
  const completed_at =
    req.body.status === "completed" ? new Date().toISOString() : null;

  db.run(
    "UPDATE activities SET status=?, completed_at=? WHERE id=?",
    [req.body.status, completed_at, req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ updated: true });
    }
  );
});

app.get("/report/overview", (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  db.all("SELECT * FROM activities WHERE date=?", [today], (err, rows) => {
    if (err) return res.status(500).json(err);

    const total = rows.length;
    const completed = rows.filter((r) => r.status === "completed").length;
    const skipped = rows.filter((r) => r.status === "skipped").length;
    const pending = rows.filter((r) => r.status === "pending").length;

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.json({ total, completed, skipped, pending, progress });
  });
});

app.listen(5000, () => console.log("Backend running on 5000"));