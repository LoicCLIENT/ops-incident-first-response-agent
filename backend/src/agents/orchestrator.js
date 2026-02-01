import { sendNotification } from '../services/notifications.js';
import { classifyIncident } from './classification.js';
import { assignOwner }  from './assignment.js';
import { recommendActions } from './actions.js';

function generateTicketId() {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  return `INC-${year}-${num}`;
}

async function processIncident({ description, source, metadata }) {
  const startTime = Date.now();
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

    // Step 3: Generate ticket
    const ticket = {
      id: generateTicketId(),
      status: 'Open',
      priority: classification.severity === 'P1' ? 'Urgent' : 'High'
    };

    // Step 4: Create notification
    const notification = {
      title: `${classification.severity} Incident: ${classification.category}`,
      body: `Assigned: ${assignment.owner} | Ticket: ${ticket.id}`
    };

    // Step 5: Send Notification (Fire & Forget)
    sendNotification({ classification, assignment, actions, ticket });

    // Step 6: Return the unified response matching frontend expectations
    return {
      classification,
      assignment,
      ticket,
      actions,
      notification,
      processingTime: Date.now() - startTime,
      steps: [
        { message: `Extracted incident` },
        { message: `Severity ${classification.severity} (${(classification.confidence * 100).toFixed(0)}%)` },
        { message: `Assigned to ${assignment.owner}` },
        { message: `Created ${ticket.id}` },
        { message: `${actions.immediate?.length || 0} actions generated` },
        { message: 'Analysis complete' }
      ]
    };

  } catch (error) {
    console.error('Orchestration failed:', error);
    return {
      error: error.message,
      original_alert: { description, source, metadata }
    };
  }
}

export { processIncident };
