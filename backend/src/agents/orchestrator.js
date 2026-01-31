const { createTicket } = require('../services/ticketing');
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

    // Step 3: Send Notification (Fire & Forget)
    sendNotification({ classification, assignment, original_alert: { description } });

    // Step 4: Auto-create a ticket for tracking
    const ticket = await createTicket({ classification, assignment, original_alert: { description } });

    // Step 5: Return the unified response (WITH ticket details)
    return {
      status: 'processed',
      timestamp: new Date().toISOString(),
      original_alert: { description, source, metadata },
      analysis: {
        classification,
        assignment,
        suggested_actions: actions
      },
      action_taken: {
        ticket_id: ticket.id,
        ticket_link: ticket.link
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
