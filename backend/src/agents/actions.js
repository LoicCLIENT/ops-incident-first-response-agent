const { callWatsonxOrchestrate } = require('../services/watsonx');
const { extractJsonFromText } = require('../utils/jsonParser');
const fs = require('fs');
const path = require('path');

async function recommendActions(description, classification) {
  const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../../../prompts/actions.md'), 
    'utf8'
  );

  const inputContext = `
Incident Description: ${description}
Severity: ${classification.severity}
Category: ${classification.category}
`;

  try {
    const result = await callWatsonxOrchestrate({
      skill: 'incident-action-recommender',
      input: {
        prompt: `${promptTemplate}\n\n${inputContext}`,
        parameters: { max_new_tokens: 300 }
      }
    });

    const output = typeof result === 'string' ? result : result?.output || JSON.stringify(result);
    const parsed = extractJsonFromText(output) || result;

    return {
      immediate: Array.isArray(parsed.immediate) ? parsed.immediate : [],
      diagnostic: Array.isArray(parsed.diagnostic) ? parsed.diagnostic : [],
      communication: Array.isArray(parsed.communication) ? parsed.communication : []
    };
  } catch (error) {
    console.error('Action agent failed:', error.message);
    return {
      immediate: ['Check logs', 'Escalate manually'],
      diagnostic: [],
      communication: []
    };
  }
}

module.exports = { recommendActions };