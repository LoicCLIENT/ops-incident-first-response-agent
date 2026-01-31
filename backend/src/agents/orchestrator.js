const { createTicket } = require('../services/ticketing');
const { sendNotification } = require('../services/notifications');
const { classifyIncident } = require('./classification');
const { assignOwner } = require('./assignment');
const { recommendActions } = require('./actions');
const { sendNotification } = require('../services/notifications');

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

async function processIncident({ description, source, metadata }) {
  const startTime = Date.now();
  const steps = [];

  steps.push({ step: 1, message: 'Analyzing incident text...', timestamp: Date.now() });

  const classification = await classifyIncident(description);
  steps.push({
    step: 2,
    message: `Classification: ${classification.category} | Severity: ${classification.severity}`,
    timestamp: Date.now()
  });

  const assignment = await assignOwner(description, classification);
  steps.push({
    step: 3,
    message: `Assigning to: ${assignment.team} → ${assignment.owner}`,
    timestamp: Date.now()
  });

  const ticket = {
    id: generateTicketId(),
    status: 'Open',
    priority: classification.severity === 'P1' ? 'Urgent' : 'High'
  };
  steps.push({
    step: 4,
    message: `Creating ticket ${ticket.id}...`,
    timestamp: Date.now()
  });

  const actions = await recommendActions(description, classification);
  steps.push({
    step: 5,
    message: 'Generating response checklist...',
    timestamp: Date.now()
  });

  const notification = {
    title: `${classification.severity} Incident: ${classification.category}`,
    body: `Assigned: ${assignment.owner} | Ticket: ${ticket.id}`
  };
  steps.push({
    step: 6,
    message: 'Drafting stakeholder notification...',
    timestamp: Date.now()
  });

  sendNotification({ classification, assignment, actions, ticket }).catch(console.error);

  return {
    success: true,
    processingTime: Date.now() - startTime,
    steps,
    incident: { description, source: source || 'manual', metadata: metadata || {} },
    classification,
    assignment,
    ticket,
    actions,
    notification,
    timestamp: new Date().toISOString()
  };
}

module.exports = { processIncident };
