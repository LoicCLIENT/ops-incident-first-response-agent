const { callWatsonxOrchestrate } = require('../services/watsonx');
const { extractJsonFromText } = require('../utils/jsonParser');
const fs = require('fs');
const path = require('path');

async function classifyIncident(description) {
  const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../../../prompts/classification.md'), 
    'utf8'
  );

  try {
    console.log('[Classification] Calling Watson...');
    const result = await callWatsonxOrchestrate({
      skill: 'incident-classifier',
      input: {
        prompt: `${promptTemplate}\n\nIncident Description: ${description}`,
        parameters: { max_new_tokens: 200 }
      }
    });
    console.log('[Classification] Watson returned:', JSON.stringify(result).substring(0, 100));

    const output = typeof result === 'string' ? result : result?.output || JSON.stringify(result);
    const parsed = extractJsonFromText(output) || result;

    return {
      severity: parsed.severity || 'P2',
      category: parsed.category || 'General',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      reasoning: parsed.reasoning || 'Classification complete'
    };
  } catch (error) {
    console.error('[Classification] Watson call failed:', error.message);
    console.error('[Classification] Falling back to default...');
    return {
      severity: 'P2',
      category: 'General',
      confidence: 0.5,
      tags: ['fallback'],
      reasoning: 'Classification service unavailable'
    };
  }
}

module.exports = { classifyIncident };