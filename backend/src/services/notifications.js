const axios = require('axios');

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

async function sendNotification({ classification, assignment, actions, ticket }) {
  const message = {
    text: `🚨 ${classification.severity} Incident: ${classification.category}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Severity:* ${classification.severity}\n*Category:* ${classification.category}\n*Assigned:* ${assignment.owner}\n*Ticket:* ${ticket.id}`
        }
      }
    ]
  };

  if (SLACK_WEBHOOK_URL) {
    await axios.post(SLACK_WEBHOOK_URL, message);
  }

  return { sent: true, channel: 'slack' };
}

module.exports = { sendNotification };
