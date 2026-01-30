import React, { useState } from 'react';

function IncidentForm({ onSubmit, loading }) {
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ description, source: 'manual', metadata: {} });
  };

  const primaryExample = `ALERT: Payment API response times spiked to 12s (normal: 200ms).
Error rate jumped to 23% in EU-West region.
Multiple customer complaints incoming. Stripe webhook failures detected.
Started: 14:32 UTC. No recent deployments.`;

  return (
    <form onSubmit={handleSubmit} className="incident-form">
      <h2>Report Incident</h2>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the incident..."
        rows={5}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Analyze Incident'}
      </button>

      <div className="examples">
        <p>Try demo example:</p>
        <button type="button" onClick={() => setDescription(primaryExample)} className="example-btn">
          Payment API Alert (Primary Demo)
        </button>
      </div>
    </form>
  );
}

export default IncidentForm;
