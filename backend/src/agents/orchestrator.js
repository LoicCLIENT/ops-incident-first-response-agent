import { classifyIncident } from './classification.js';
import { assignOwner } from './assignment.js';
import { recommendActions } from './actions.js';
import { sendNotification } from '../services/notifications.js';

function generateTicketId() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  return `INC-${year}-${num}`;
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

export { processIncident };
