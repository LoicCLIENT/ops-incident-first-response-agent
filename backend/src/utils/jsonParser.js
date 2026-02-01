/**
 * Extracts and parses JSON from LLM output that may contain code blocks.
 * Handles formats like:
 * - Raw JSON: {"key": "value"}
 * - JSON in code block: ```json\n{"key": "value"}\n```
 * - JSON in triple backticks: ```\n{"key": "value"}\n```
 */
function extractJsonFromText(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  try {
    // Try to parse as-is (raw JSON)
    return JSON.parse(text);
  } catch (e) {
    // Try to extract from code block
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch (innerError) {
        console.error('Failed to parse JSON from code block:', innerError.message);
        return null;
      }
    }

    // Try to find JSON object pattern
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (innerError) {
        console.error('Failed to parse JSON from pattern:', innerError.message);
        return null;
      }
    }

    return null;
  }
}

module.exports = { extractJsonFromText };
