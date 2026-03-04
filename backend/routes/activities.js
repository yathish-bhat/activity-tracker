const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/weekly', async (req, res) => {
  try {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon = new Date(now); mon.setDate(now.getDate() - diff); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const monStr = mon.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];
    const r = await pool.query(
      'SELECT date, type, SUM(duration)::int as total_duration FROM activities WHERE user_id = $1 AND date >= $2 AND date <= $3 GROUP BY date, type ORDER BY date ASC',
      [req.userId, monStr, sunStr]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const r = await pool.query('SELECT * FROM activities WHERE user_id = $1 AND date = $2 ORDER BY created_at DESC', [req.userId, today]);
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/report/daily', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const r = await pool.query('SELECT * FROM activities WHERE user_id = $1 AND date = $2 ORDER BY created_at ASC', [req.userId, date]);
    const rows = r.rows;
    const summary = {}; let totalMin = 0; let completed = 0;
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

router.get('/report/weekly', async (req, res) => {
  try {
    let refDate = req.query.weekOf ? new Date(req.query.weekOf + 'T00:00:00') : new Date();
    const day = refDate.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const mon = new Date(refDate); mon.setDate(refDate.getDate() - diff); mon.setHours(0,0,0,0);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    const monStr = mon.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];
    const r = await pool.query(
      'SELECT * FROM activities WHERE user_id = $1 AND date >= $2 AND date <= $3 ORDER BY date ASC, created_at ASC',
      [req.userId, monStr, sunStr]
    );
    const rows = r.rows;
    const byDate = {}; const byType = {}; let totalMin = 0; let completed = 0;
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

router.post('/', async (req, res) => {
  try {
    const { type, duration, unit, notes, date } = req.body;
    if (!type || !duration || !date) return res.status(400).json({ error: 'type, duration, and date are required' });
    const r = await pool.query(
      'INSERT INTO activities (user_id, type, duration, unit, notes, date, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.userId, type, duration, unit || 'minutes', notes || '', date, 'pending']
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/complete', async (req, res) => {
  try {
    const { actual_duration, actual_unit } = req.body;
    if (!actual_duration) return res.status(400).json({ error: 'actual_duration is required' });
    const check = await pool.query('SELECT * FROM activities WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const r = await pool.query(
      'UPDATE activities SET status = $1, actual_duration = $2, actual_unit = $3, completed_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      ['completed', actual_duration, actual_unit || 'minutes', req.params.id, req.userId]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/reopen', async (req, res) => {
  try {
    const check = await pool.query('SELECT * FROM activities WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const r = await pool.query(
      'UPDATE activities SET status = $1, actual_duration = NULL, actual_unit = NULL, completed_at = NULL WHERE id = $2 AND user_id = $3 RETURNING *',
      ['pending', req.params.id, req.userId]
    );
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM activities WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;