import React, { useState } from 'react';

const EXAMPLES = [
  {
    id: 'p1',
    severity: 'P1',
    label: 'Database Down',
    description: `CRITICAL: PostgreSQL primary database unreachable.
All application servers returning 500 errors.
Customer-facing services completely unavailable.
Revenue impact: ~$50k/hour. Started: 2 minutes ago.`
  },
  {
    id: 'p2',
    severity: 'P2',
    label: 'Payment API',
    description: `ALERT: Payment API response times spiked to 12s (normal: 200ms).
Error rate jumped to 23% in EU-West region.
Stripe webhook failures detected.
Started: 14:32 UTC. No recent deployments.`
  },
  {
    id: 'p3',
    severity: 'P3',
    label: 'Slow Queries',
    description: `WARNING: Dashboard loading times increased to 8s.
Database CPU at 78%. Several slow queries identified.
Affecting internal analytics team.
Started: 1 hour ago after data import job.`
  }
];

function IncidentForm({ onSubmit, loading }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (description.trim() && !loading) {
      onSubmit({ description, source: 'manual', metadata: {} });
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
    // Escape to clear
    if (e.key === 'Escape') {
      setDescription('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="incident-form">
      <label className="form-label">Incident Description</label>

      <textarea
        className="incident-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the incident..."
        required
        disabled={loading}
      />

      <button
        type="submit"
        className={`submit-button ${loading ? 'loading' : ''}`}
        disabled={loading || !description.trim()}
      >
        {loading ? 'Processing...' : 'Analyze'}
        {!loading && <span className="shortcut-hint">⌘↵</span>}
      </button>

      <div className="examples-section">
        <span className="examples-label">Demo scenarios</span>
        <div className="examples-list">
          {EXAMPLES.map((example) => (
            <button
              key={example.id}
              type="button"
              className={`example-button severity-${example.severity.toLowerCase()}`}
              onClick={() => setDescription(example.description)}
              disabled={loading}
            >
              <span className="example-severity">{example.severity}</span>
              <span className="example-name">{example.label}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}

export default IncidentForm;
