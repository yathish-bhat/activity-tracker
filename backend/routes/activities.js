const express = require('express');
const router = express.Router();
const db = require('../database');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/activities
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
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
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

// GET /api/activities/report/daily
router.get('/report/daily', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const rows = db.prepare('SELECT * FROM activities WHERE user_id = ? AND date = ? ORDER BY created_at ASC').all(req.userId, date);
    const summary = {};
    let totalMin = 0;
    let completed = 0;
    rows.forEach(a => {
      const min = a.unit === 'hours' ? a.duration * 60 : a.duration;
      totalMin += min;
      if (a.status === 'completed') completed++;
      if (!summary[a.type]) summary[a.type] = { count: 0, totalMin: 0, completed: 0, entries: [] };
      summary[a.type].count++;
      summary[a.type].totalMin += min;
      if (a.status === 'completed') summary[a.type].completed++;
      summary[a.type].entries.push(a);
    });
    res.json({ date, userName: req.userName, totalActivities: rows.length, totalMinutes: totalMin, completedCount: completed, summary, activities: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/activities/report/weekly
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
    const byDate = {}; const byType = {};
    let totalMin = 0; let completed = 0;
    rows.forEach(a => {
      const min = a.unit === 'hours' ? a.duration * 60 : a.duration;
      totalMin += min;
      if (a.status === 'completed') completed++;
      if (!byDate[a.date]) byDate[a.date] = [];
      byDate[a.date].push(a);
      if (!byType[a.type]) byType[a.type] = { count: 0, totalMin: 0, completed: 0 };
      byType[a.type].count++;
      byType[a.type].totalMin += min;
      if (a.status === 'completed') byType[a.type].completed++;
    });
    res.json({ weekStart: monStr, weekEnd: sunStr, userName: req.userName, totalActivities: rows.length, totalMinutes: totalMin, completedCount: completed, daysActive: Object.keys(byDate).length, byType, byDate, activities: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/activities
router.post('/', (req, res) => {
  try {
    const { type, duration, unit, notes, date } = req.body;
    if (!type || !duration || !date) return res.status(400).json({ error: 'type, duration, and date are required' });
    const stmt = db.prepare('INSERT INTO activities (user_id, type, duration, unit, notes, date, status) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const result = stmt.run(req.userId, type, duration, unit || 'minutes', notes || '', date, 'pending');
    const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/activities/:id/complete — mark as completed with actual duration
router.patch('/:id/complete', (req, res) => {
  try {
    const { actual_duration, actual_unit } = req.body;
    if (!actual_duration) return res.status(400).json({ error: 'actual_duration is required' });
    const existing = db.prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(
      'UPDATE activities SET status = ?, actual_duration = ?, actual_unit = ?, completed_at = ? WHERE id = ? AND user_id = ?'
    ).run('completed', actual_duration, actual_unit || 'minutes', new Date().toISOString(), req.params.id, req.userId);
    const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
    res.json(row);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/activities/:id/reopen — mark back as pending
router.patch('/:id/reopen', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(
      'UPDATE activities SET status = ?, actual_duration = NULL, actual_unit = NULL, completed_at = NULL WHERE id = ? AND user_id = ?'
    ).run('pending', req.params.id, req.userId);
    const row = db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id);
    res.json(row);
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