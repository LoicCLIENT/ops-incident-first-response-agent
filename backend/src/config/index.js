module.exports = {
  watsonx: {
    apiUrl: process.env.WATSONX_API_URL,
    apiKey: process.env.WATSONX_API_KEY,
    projectId: process.env.WATSONX_PROJECT_ID
  },
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  },
  server: {
    port: process.env.PORT || 3001
  }
};
