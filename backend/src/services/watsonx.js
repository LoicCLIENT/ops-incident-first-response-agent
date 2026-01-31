const axios = require('axios');
const querystring = require('querystring');

const WATSONX_API_URL = process.env.WATSONX_API_URL; // e.g., https://api.au-syd.orchestrate.watson.cloud.ibm.com
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;

let cachedToken = null;
let tokenExpiration = 0;

/**
 * Exchanges the IBM Cloud API Key for an IAM Access Token.
 * This is required to authenticate with watsonx Orchestrate.
 */
async function getIamToken() {
  const currentTime = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (buffer of 5 minutes)
  if (cachedToken && currentTime < tokenExpiration - 300) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      querystring.stringify({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: WATSONX_API_KEY
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiration = currentTime + response.data.expires_in;
    console.log('Successfully refreshed IAM token');
    return cachedToken;
  } catch (error) {
    console.error('Failed to get IAM token:', error.response ? error.response.data : error.message);
    throw new Error('Authentication failed');
  }
}

/**
 * Executes a skill in watsonx Orchestrate.
 * @param {Object} params
 * @param {string} params.skill - The ID or name of the skill (e.g., 'incident-classifier')
 * @param {Object} params.input - The input data for the skill
 */
async function callWatsonxOrchestrate({ skill, input }) {
  if (!WATSONX_API_KEY || !WATSONX_API_URL) {
    throw new Error('Missing WATSONX_API_KEY or WATSONX_API_URL in .env');
  }

  try {
    const token = await getIamToken();
    
    // Note: Adjust the URL path if your specific Orchestrate instance uses a different schema.
    // This assumes the standard pattern for skill execution.
    const response = await axios.post(
      `${WATSONX_API_URL}/v1/skills/${skill}/execute`,
      { input },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`watsonx Orchestrate execution failed for skill '${skill}':`);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    // Re-throw so the agent (classification.js) handles the fallback
    throw error;
  }
}

module.exports = { callWatsonxOrchestrate };