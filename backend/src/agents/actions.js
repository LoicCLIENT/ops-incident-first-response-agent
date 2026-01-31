const { callWatsonxOrchestrate } = require('../services/watsonx');
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
    return result;
  } catch (error) {
    console.error('Action agent failed:', error.message);
    return { steps: ['Check logs', 'Escalate manually'] };
  }
}

module.exports = { recommendActions };