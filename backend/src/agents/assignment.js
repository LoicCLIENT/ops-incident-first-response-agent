const { callWatsonxOrchestrate } = require('../services/watsonx');
const { extractJsonFromText } = require('../utils/jsonParser');
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
    console.log('[Assignment] Calling Watson...');
    const result = await callWatsonxOrchestrate({
      skill: 'incident-assigner',
      input: {
        prompt: `${promptTemplate}\n\n${inputContext}`,
        parameters: { max_new_tokens: 150 }
      }
    });
    console.log('[Assignment] Watson returned:', JSON.stringify(result).substring(0, 100));

    const output = typeof result === 'string' ? result : result?.output || JSON.stringify(result);
    const parsed = extractJsonFromText(output) || result;

    return {
      team: parsed.team || 'SRE',
      owner: parsed.owner || 'On-Call Generic',
      ownerName: parsed.ownerName || 'On-Call',
      escalationPath: Array.isArray(parsed.escalationPath) ? parsed.escalationPath : [],
      reasoning: parsed.reasoning || 'Assignment complete'
    };
  } catch (error) {
    console.error('[Assignment] Watson call failed:', error.message);
    console.error('[Assignment] Falling back to default...');
    return {
      team: 'SRE',
      owner: 'On-Call Generic',
      ownerName: 'On-Call',
      escalationPath: [],
      reasoning: 'Assignment service unavailable'
    };
  }
}

module.exports = { assignOwner };