// backend/src/services/ticketing.js

async function createTicket(incidentData) {
  const { classification, assignment, original_alert } = incidentData;
  
  // Simulate API delay (makes it feel real in the demo)
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate a random Ticket ID (e.g., INC-4921)
  const ticketId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Create a mock "Link" to the ticket
  const ticketLink = `https://service-now.mock-corp.com/incident/${ticketId}`;

  console.log(`[Ticketing] Created ticket ${ticketId} for ${classification.category} incident.`);

  return {
    id: ticketId,
    link: ticketLink,
    status: 'Open',
    priority: classification.severity,
    assigned_to: assignment.owner,
    created_at: new Date().toISOString()
  };
}

module.exports = { createTicket };