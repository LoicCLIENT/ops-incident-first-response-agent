const { callWatsonxOrchestrate } = require('../services/watsonx');
const fs = require('fs');
const path = require('path');

async function classifyIncident(description) {
  // Read the prompt template your team already created
  const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../../../prompts/classification.md'), 
    'utf8'
  );

  try {
    const result = await callWatsonxOrchestrate({
      skill: 'incident-classifier', // Ensure this matches your watsonx skill ID
      input: {
        prompt: `${promptTemplate}\n\nIncident Description: ${description}`,
        parameters: { max_new_tokens: 200 }
      }
    });

    return result; 
  } catch (error) {
    console.error('Classification failed, falling back to P2/General:', error.message);
    return {
      severity: 'P2',
      category: 'General',
      confidence: 0.5,
      tags: ['fallback'],
      reasoning: 'AI Classification service was unavailable.'
    };
  }
}

module.exports = { classifyIncident };