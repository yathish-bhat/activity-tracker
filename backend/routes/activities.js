const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/activities — all activities, newest first
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM activities ORDER BY created_at DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/activities/weekly — aggregated by date+type for current week (Mon–Sun)
router.get('/weekly', (req, res) => {
  try {
    const now = new Date();
    const day = now.getDay();
    const diffToMon = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMon);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];

    const rows = db.prepare(`
      SELECT date, type, SUM(duration) as total_duration
      FROM activities
      WHERE date >= ? AND date <= ?
      GROUP BY date, type
      ORDER BY date ASC
    `).all(monStr, sunStr);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/activities/today — all activities for today
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.prepare('SELECT * FROM activities WHERE date = ? ORDER BY created_at DESC').all(today);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/activities — create new activity
router.post('/', (req, res) => {
  try {
    const { type, duration, unit, notes, date } = req.body;
    if (!type || !duration || !date) {
      return res.status(400).json({ error: 'type, duration, and date are required' });
    }
    const stmt = db.prepare('INSERT INTO activities (type, duration, unit, notes, date) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(type, duration, unit || 'minutes', notes || '', date);
    const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/activities/:id
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Activity not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;