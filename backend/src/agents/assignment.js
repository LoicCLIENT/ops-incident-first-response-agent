const { callWatsonxOrchestrate } = require('../services/watsonx');
const fs = require('fs');
const path = require('path');

async function assignOwner(description, classification) {
  const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../../../prompts/assignment.md'), 
    'utf8'
  );

  const inputContext = `
Incident Description: ${description}
Detected Category: ${classification.category}
Detected Severity: ${classification.severity}
`;

  try {
    const result = await callWatsonxOrchestrate({
      skill: 'incident-assigner', // Make sure this matches your watsonx skill name
      input: {
        prompt: `${promptTemplate}\n\n${inputContext}`,
        parameters: { max_new_tokens: 150 }
      }
    });
    return result;
  } catch (error) {
    console.error('Assignment agent failed:', error.message);
    return { owner: 'On-Call Generic', team: 'SRE', confidence: 0.0 };
  }
}

module.exports = { assignOwner };