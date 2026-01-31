const axios = require('axios');
const querystring = require('querystring');
// Use us-south region (or your region)
const WATSONX_AI_ENDPOINT = "https://us-south.ml.cloud.ibm.com"; 
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;
let cachedToken = null;
let tokenExpiration = 0;
async function getIamToken() {
  const currentTime = Math.floor(Date.now() / 1000);
  if (cachedToken && currentTime < tokenExpiration - 300) return cachedToken;
  try {
    const response = await axios.post(
      'https://iam.cloud.ibm.com/identity/token',
      querystring.stringify({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: WATSONX_API_KEY
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    cachedToken = response.data.access_token;
    tokenExpiration = currentTime + response.data.expires_in;
    console.log('[Watson] IAM token refreshed');
    return cachedToken;
  } catch (error) {
    console.error('[Watson] IAM Token Error:', error.message);
    throw new Error('Authentication failed');
  }
}
async function callWatsonxOrchestrate({ skill, input }) {
  if (!WATSONX_PROJECT_ID) {
    throw new Error('Missing WATSONX_PROJECT_ID in .env');
  }
  const token = await getIamToken();
  
  // Map the Orchestrate "Skill" names to system instructions
  let systemMessage = "";
  if (skill === 'incident-classifier') {
    systemMessage = "You are an Incident Classifier. Respond with JSON only (no markdown, no explanation). Fields: severity (P1/P2/P3/P4), category, confidence (0-1), tags (array), reasoning.";
  } else if (skill === 'incident-assigner') {
    systemMessage = "You are an Incident Assigner. Respond with JSON only. Fields: team, owner, escalationPath (array), reasoning.";
  } else {
    systemMessage = "You are an Action Recommender. Respond with JSON only. Fields: immediate (array), diagnostic (array), communication (array).";
  }

  try {
    console.log(`[Watson] Calling ${skill}...`);
    const response = await axios.post(
      `${WATSONX_AI_ENDPOINT}/ml/v1/text/chat?version=2023-05-29`,
      {
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: input.prompt
          }
        ],
        project_id: WATSONX_PROJECT_ID,
        model_id: "ibm/granite-3-3-8b-instruct",
        frequency_penalty: 0,
        max_tokens: 2000,
        presence_penalty: 0,
        temperature: 0,
        top_p: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    // Extract the generated text from response
    const generatedText = response.data.choices[0].message.content;
    console.log(`[Watson] ${skill} response:`, generatedText.substring(0, 100));
    
    try {
      // Clean markdown code blocks if present
      const cleanText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (e) {
      console.error(`[Watson] Failed to parse JSON from ${skill}:`, e.message);
      return { error: true, fallback: "Invalid JSON response", raw: generatedText };
    }
  } catch (error) {
    console.error(`[Watson] API call failed for ${skill}:`);
    if (error.response) {
      console.error('[Watson] Status:', error.response.status);
      console.error('[Watson] Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('[Watson] Error:', error.message);
    }
    // Return a fallback so the UI doesn't crash
    return { error: true, fallback: "Watson AI unavailable" };
  }
}
module.exports = { callWatsonxOrchestrate };