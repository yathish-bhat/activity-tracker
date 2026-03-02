require('dotenv').config();
const express = require('express');
const cors = require('cors');
const activitiesRouter = require('./routes/activities');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/activities', activitiesRouter);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Pulse API running on port ${PORT}`);
});