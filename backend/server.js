require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');
const authRouter = require('./routes/auth');
const activitiesRouter = require('./routes/activities');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://abrarkachari.com',
    'https://www.abrarkachari.com'
  ]
}));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/activities', activitiesRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Initialize database then start server
initDB()
  .then(() => {
    app.listen(PORT, () => console.log('Pulse API running on port ' + PORT));
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });