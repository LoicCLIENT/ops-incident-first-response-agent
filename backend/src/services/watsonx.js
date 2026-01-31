const axios = require('axios');
const querystring = require('querystring');
// Hardcoded for Sydney Region to avoid .env confusion
const WATSONX_AI_ENDPOINT = "https://au-syd.ml.cloud.ibm.com"; 
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
    return cachedToken;
  } catch (error) {
    console.error('IAM Token Error:', error.message);
    throw new Error('Authentication failed');
  }
}
async function callWatsonxOrchestrate({ skill, input }) {
  if (!WATSONX_PROJECT_ID) {
    throw new Error('Missing WATSONX_PROJECT_ID in .env');
  }
  const token = await getIamToken();
  // 1. MAP the Orchestrate "Skill" names to simple instructions
  let instruction = "";
  if (skill === 'incident-classifier') {
    instruction = "You are an Incident Classifier. Output JSON only with fields: severity (P1/P2/P3), category, confidence, reasoning. Classify this:";
  } else if (skill === 'incident-assigner') {
    instruction = "You are an Incident Assigner. Output JSON only with fields: owner, team, confidence. Assign this:";
  } else {
    instruction = "You are an Action Recommender. Output JSON only with field: steps (array of strings). Recommend actions for:";
  }
  // 2. Combine the prompt
  const fullPrompt = `${instruction}\n\n${input.prompt}`;
  try {
    const response = await axios.post(
      `${WATSONX_AI_ENDPOINT}/ml/v1/text/generation?version=2023-05-29`,
      {
        input: fullPrompt,
        parameters: {
          decoding_method: "greedy",
          max_new_tokens: 300,
          min_new_tokens: 1,
          repetition_penalty: 1
        },
        model_id: "ibm/granite-13b-chat-v2", 
        project_id: WATSONX_PROJECT_ID
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    // 3. Clean and Parse the response
    const generatedText = response.data.results[0].generated_text;
    try {
        const cleanText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        return { result: generatedText, raw: true };
    }
  } catch (error) {
    console.error(`Direct Watsonx.ai call failed for ${skill}:`); // <--- Look for this in logs if it fails
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    // Return a fallback so the UI doesn't crash
    return { error: true, fallback: "AI unavailable" };
  }
}
module.exports = { callWatsonxOrchestrate };
// backend/src/services/watsonx.js
//EMERGENCY MOCK MODE: No API Key or Project ID needed!
/*
async function callWatsonxOrchestrate({ skill, input }) {
  console.log(`[Mock AI] Simulating execution for ${skill}...`);
  
  // Fake a 1-second "thinking" delay to make it look real in the demo
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return realistic data based on the skill requested
  if (skill === 'incident-classifier') {
    return {
      severity: "P1",
      category: "Database",
      confidence: 0.95,
      reasoning: "Keywords 'connection failing' and 'down' indicate critical database outage."
    };
  } 
  
  else if (skill === 'incident-assigner') {
    return {
      owner: "L3 Database Team",
      team: "DBA-OnCall",
      confidence: 0.90
    };
  } 
  
  else { // incident-action-recommender
    return {
      steps: [
        "Check database replica status",
        "Restart the primary connection pool",
        "Rollback recent schema changes"
      ]
    };
  }
}
*/
module.exports = { callWatsonxOrchestrate };