const { callWatsonxOrchestrate } = require('../services/watsonx');

const ON_CALL_ROSTER = {
  'Platform Engineering': {
    primary: { name: 'Maria Chen', handle: '@maria.chen' },
    backup: { name: 'James Wong', handle: '@james.wong' }
  },
  'Security Team': {
    primary: { name: 'Alex Rivera', handle: '@alex.rivera' },
    backup: { name: 'Sam Kumar', handle: '@sam.kumar' }
  }
};

async function assignOwner(classification) {
  // TODO: Implement watsonx Orchestrate call

  const team = 'Platform Engineering';
  const roster = ON_CALL_ROSTER[team];

  return {
    team: team,
    owner: roster.primary.handle,
    ownerName: roster.primary.name,
    escalationPath: [roster.backup.handle, 'engineering-manager'],
    reasoning: `${classification.category} routes to ${team}`
  };
}

module.exports = { assignOwner };
