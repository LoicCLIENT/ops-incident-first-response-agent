const { callWatsonxOrchestrate } = require('../services/watsonx');

// NovaPay team directory for smart fallback routing
const TEAMS = {
  'payment-processing': {
    team: 'Platform Engineering',
    owner: 'Maria Santos',
    slack: '#platform-incidents',
    pagerduty: 'platform-oncall'
  },
  'database': {
    team: 'Database Team',
    owner: 'Robert Taylor',
    slack: '#dba-incidents',
    pagerduty: 'dba-oncall'
  },
  'infrastructure': {
    team: 'SRE',
    owner: 'David Kim',
    slack: '#sre-incidents',
    pagerduty: 'sre-oncall'
  },
  'security': {
    team: 'Security Team',
    owner: 'Sarah Johnson',
    slack: '#security-incidents',
    pagerduty: 'security-oncall'
  },
  'network': {
    team: 'SRE',
    owner: 'Carlos Rodriguez',
    slack: '#sre-incidents',
    pagerduty: 'sre-oncall'
  },
  'performance': {
    team: 'SRE',
    owner: 'Emma Wilson',
    slack: '#sre-incidents',
    pagerduty: 'sre-oncall'
  }
};

async function assignOwner(description, classification) {
  const inputContext = `
Incident Description: ${description}

Classification Results:
- Severity: ${classification.severity}
- Category: ${classification.category}
- Tags: ${classification.tags?.join(', ') || 'none'}
`;

  try {
    const result = await callWatsonxOrchestrate({
      skill: 'incident-assigner',
      input: { prompt: inputContext }
    });

    if (result && !result.error) {
      return {
        team: result.team || 'SRE',
        owner: result.owner || 'On-Call',
        escalationPath: result.escalationPath || [],
        reasoning: result.reasoning || 'Assignment complete'
      };
    }

    throw new Error(result?.fallback || 'Assignment failed');

  } catch (error) {
    console.error('[Assignment] Error:', error.message);

    // Smart fallback based on category
    const category = classification.category?.toLowerCase() || 'infrastructure';
    const teamInfo = TEAMS[category] || TEAMS['infrastructure'];

    // Build escalation path based on severity
    let escalationPath = [];
    if (classification.severity === 'P1') {
      escalationPath = [
        `@${teamInfo.owner.toLowerCase().replace(' ', '.')}`,
        '@jennifer.lee',
        '@michael.brown',
        '@amanda.foster'
      ];
    } else if (classification.severity === 'P2') {
      escalationPath = [
        `@${teamInfo.owner.toLowerCase().replace(' ', '.')}`,
        '@jennifer.lee'
      ];
    } else {
      escalationPath = [`@${teamInfo.owner.toLowerCase().replace(' ', '.')}`];
    }

    return {
      team: teamInfo.team,
      owner: teamInfo.owner,
      escalationPath,
      reasoning: `Routed to ${teamInfo.team} based on category: ${category} (fallback)`
    };
  }
}

module.exports = { assignOwner };
