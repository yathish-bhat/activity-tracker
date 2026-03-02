const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET /api/activities — all activities for this user
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM activities WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/activities/weekly
router.get('/weekly', (req, res) => {
  try {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon = new Date(now); mon.setDate(now.getDate() - diff); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
    const monStr = mon.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];
    const rows = db.prepare(
      'SELECT date, type, SUM(duration) as total_duration FROM activities WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY date, type ORDER BY date ASC'
    ).all(req.userId, monStr, sunStr);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/activities/today
router.get('/today', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const rows = db.prepare('SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at DESC').all(req.userId, today);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/activities/report/daily?date=2026-03-03
router.get('/report/daily', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const rows = db.prepare('SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(req.userId, date);

    const summary = {};
    let totalMin = 0;
    rows.forEach(a => {
      const min = a.unit === 'hours' ? a.duration * 60 : a.duration;
      totalMin += min;
      if (!summary[a.type]) summary[a.type] = { count: 0, totalMin: 0, entries: [] };
      summary[a.type].count++;
      summary[a.type].totalMin += min;
      summary[a.type].entries.push(a);
    });

    res.json({
      date,
      userName: req.userName,
      totalActivities: rows.length,
      totalMinutes: totalMin,
      summary,
      activities: rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/activities/report/weekly?weekOf=2026-03-02
router.get('/report/weekly', (req, res) => {
  try {
    let refDate = req.query.weekOf ? new Date(req.query.weekOf + 'T00:00:00') : new Date();
    const day = refDate.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon = new Date(refDate); mon.setDate(refDate.getDate() - diff); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const monStr = mon.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];

    const rows = db.prepare(
      'SELECT * FROM activities WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC, created_at ASC'
    ).all(req.userId, monStr, sunStr);

    const byDate = {};
    const byType = {};
    let totalMin = 0;

    rows.forEach(a => {
      const min = a.unit === 'hours' ? a.duration * 60 : a.duration;
      totalMin += min;

      if (!byDate[a.date]) byDate[a.date] = [];
      byDate[a.date].push(a);

      if (!byType[a.type]) byType[a.type] = { count: 0, totalMin: 0 };
      byType[a.type].count++;
      byType[a.type].totalMin += min;
    });

    const daysActive = Object.keys(byDate).length;

    res.json({
      weekStart: monStr,
      weekEnd: sunStr,
      userName: req.userName,
      totalActivities: rows.length,
      totalMinutes: totalMin,
      daysActive,
      byType,
      byDate,
      activities: rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/activities
router.post('/', (req, res) => {
  try {
    const { type, duration, unit, notes, date } = req.body;
    if (!type || !duration || !date) return res.status(400).json({ error: 'type, duration, and date are required' });
    const stmt = db.prepare('INSERT INTO activities (user_id, type, duration, unit, notes, date) VALUES (?, ?, ?, ?, ?, ?)');
    const result = stmt.run(req.userId, type, duration, unit || 'minutes', notes || '', date);
    const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/activities/:id
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM activities WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;