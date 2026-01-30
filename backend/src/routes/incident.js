const express = require('express');
const router = express.Router();
const { processIncident } = require('../agents/orchestrator');

router.post('/', async (req, res) => {
  try {
    const { description, source, metadata } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Incident description required' });
    }

    const result = await processIncident({ description, source, metadata });
    res.json(result);
  } catch (error) {
    console.error('Incident processing error:', error);
    res.status(500).json({ error: 'Failed to process incident' });
  }
});

module.exports = router;
