const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Configuration
const WATSONX_AI_ENDPOINT = process.env.WATSONX_API_URL || "https://us-south.ml.cloud.ibm.com";
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
const WATSONX_PROJECT_ID = process.env.WATSONX_PROJECT_ID;

// Token cache
let cachedToken = null;
let tokenExpiration = 0;

// Load rich prompts at startup for better Watson responses
const PROMPTS = {
  classifier: fs.readFileSync(path.join(__dirname, '../../../prompts/classification.md'), 'utf8'),
  assigner: fs.readFileSync(path.join(__dirname, '../../../prompts/assignment.md'), 'utf8'),
  actions: fs.readFileSync(path.join(__dirname, '../../../prompts/actions.md'), 'utf8')
};

console.log('[Watson] Loaded prompts:', Object.keys(PROMPTS).join(', '));

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

  // Use rich prompts loaded from files as system message
  let systemPrompt = "";
  if (skill === 'incident-classifier') {
    systemPrompt = PROMPTS.classifier;
  } else if (skill === 'incident-assigner') {
    systemPrompt = PROMPTS.assigner;
  } else {
    systemPrompt = PROMPTS.actions;
  }

  try {
    console.log(`[Watson] Calling ${skill} with NovaPay context...`);

    const response = await axios.post(
      `${WATSONX_AI_ENDPOINT}/ml/v1/text/chat?version=2023-05-29`,
      {
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Analyze this incident and respond with JSON only:\n\n${input.prompt}`
          }
        ],
        project_id: WATSONX_PROJECT_ID,
        model_id: "ibm/granite-3-3-8b-instruct",
        frequency_penalty: 0,
        max_tokens: 2500,
        presence_penalty: 0,
        temperature: 0.1,
        top_p: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const generatedText = response.data.choices[0].message.content;
    console.log(`[Watson] ${skill} response (${generatedText.length} chars)`);

    try {
      // Clean markdown code blocks if present
      let cleanText = generatedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Find JSON object in the response
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (e) {
      console.error(`[Watson] JSON parse error for ${skill}:`, e.message);
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
    return { error: true, fallback: "Watson AI unavailable" };
  }
}

module.exports = { callWatsonxOrchestrate };
