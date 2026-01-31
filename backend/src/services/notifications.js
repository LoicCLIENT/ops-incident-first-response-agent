const axios = require('axios');

async function sendNotification(incidentData) {
  const { classification, assignment, original_alert } = incidentData;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not set, skipping notification.');
    return;
  }

  // Only notify for high severity (P1/P2) to avoid noise
  if (!['P1', 'P2'].includes(classification.severity)) {
    console.log(`Skipping notification for ${classification.severity} incident.`);
    return;
  }

  const message = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚨 New ${classification.severity} Incident Detected`,
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Category:*\n${classification.category}`
          },
          {
            type: "mrkdwn",
            text: `*Assigned To:*\n${assignment.owner || 'Unassigned'}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Description:*\n${original_alert.description}`
        }
      }
    ]
  };

  try {
    await axios.post(webhookUrl, message);
    console.log('Slack notification sent successfully.');
  } catch (error) {
    console.error('Failed to send Slack notification:', error.message);
  }
}

module.exports = { sendNotification };