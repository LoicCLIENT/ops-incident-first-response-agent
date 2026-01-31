const { sendNotification } = require('../services/notifications');
const { classifyIncident } = require('./classification');
const { assignOwner } = require('./assignment');
const { recommendActions } = require('./actions');

async function processIncident({ description, source, metadata }) {
  console.log(`Processing incident from ${source}...`);

  try {
    // Step 1: Classify the incident
    const classification = await classifyIncident(description);
    console.log('Classification complete:', classification.category);

    // Step 2: Run Assignment and Actions in parallel
    const [assignment, actions] = await Promise.all([
      assignOwner(description, classification),
      recommendActions(description, classification)
    ]);

    // 👇 THIS WAS MISSING! Add it back here:
    sendNotification({ classification, assignment, original_alert: { description } });

    // Step 3: Return the unified response to the Frontend
    return {
      status: 'processed',
      timestamp: new Date().toISOString(),
      original_alert: { description, source, metadata },
      analysis: {
        classification,
        assignment,
        suggested_actions: actions
      }
    };

  } catch (error) {
    console.error('Orchestration failed:', error);
    return {
      status: 'failed',
      error: error.message,
      original_alert: { description, source, metadata }
    };
  }
}

module.exports = { processIncident };