require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger } = require('./utils/logger');
const incidentRoutes = require('./routes/incident');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ops-incident-agent' });
});

app.use('/api/incident', incidentRoutes);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
