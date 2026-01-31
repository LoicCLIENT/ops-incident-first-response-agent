const { callWatsonxOrchestrate } = require('../services/watsonx');

async function classifyIncident(description) {
  try {
    const result = await callWatsonxOrchestrate({
      skill: 'incident-classifier',
      input: { prompt: description }
    });

    // Handle successful response
    if (result && !result.error) {
      return {
        severity: result.severity || 'P2',
        category: result.category || 'General',
        confidence: typeof result.confidence === 'number' ? result.confidence : 0.85,
        tags: Array.isArray(result.tags) ? result.tags : [],
        reasoning: result.reasoning || 'Classification complete'
      };
    }

    throw new Error(result?.fallback || 'Classification failed');

  } catch (error) {
    console.error('[Classification] Error:', error.message);

    // Smart fallback based on keywords in description
    const desc = description.toLowerCase();
    let severity = 'P3';
    let category = 'General';
    let tags = [];

    // Severity detection
    if (desc.includes('critical') || desc.includes('down') || desc.includes('outage') ||
        desc.includes('unreachable') || desc.includes('100%') || desc.includes('breach')) {
      severity = 'P1';
    } else if (desc.includes('high') || desc.includes('degraded') || desc.includes('timeout') ||
               desc.includes('error rate') || desc.includes('failing') || desc.includes('slow')) {
      severity = 'P2';
    }

    // Category detection
    if (desc.includes('database') || desc.includes('postgres') || desc.includes('aurora') ||
        desc.includes('rds') || desc.includes('query') || desc.includes('connection pool')) {
      category = 'database';
      tags.push('database', 'aurora');
    } else if (desc.includes('payment') || desc.includes('stripe') || desc.includes('transaction') ||
               desc.includes('checkout') || desc.includes('merchant')) {
      category = 'payment-processing';
      tags.push('payments', 'stripe');
    } else if (desc.includes('pod') || desc.includes('kubernetes') || desc.includes('k8s') ||
               desc.includes('node') || desc.includes('eks') || desc.includes('container')) {
      category = 'infrastructure';
      tags.push('kubernetes', 'eks');
    } else if (desc.includes('security') || desc.includes('breach') || desc.includes('unauthorized') ||
               desc.includes('auth') || desc.includes('credential')) {
      category = 'security';
      tags.push('security');
    } else if (desc.includes('network') || desc.includes('dns') || desc.includes('latency') ||
               desc.includes('load balancer') || desc.includes('timeout')) {
      category = 'network';
      tags.push('network');
    } else if (desc.includes('cpu') || desc.includes('memory') || desc.includes('disk') ||
               desc.includes('performance')) {
      category = 'performance';
      tags.push('performance');
    }

    return {
      severity,
      category,
      confidence: 0.6,
      tags: [...tags, 'fallback-classification'],
      reasoning: 'Classified via keyword matching (Watson unavailable)'
    };
  }
}

module.exports = { classifyIncident };
