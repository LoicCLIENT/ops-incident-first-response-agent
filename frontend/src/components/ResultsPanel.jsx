import React from 'react';

function ResultsPanel({ results }) {
  if (!results) return null;

  if (results.error) {
    return (
      <div className="results-panel">
        <h2>Agent Results</h2>
        <div className="result-card">
          <h3>Error</h3>
          <p>{results.error}</p>
        </div>
      </div>
    );
  }

  const classification = results.classification || {};
  const assignment = results.assignment || {};
  const ticket = results.ticket || {};
  const actions = results.actions || {};
  const notification = results.notification || { body: '' };
  const processingTime = results.processingTime ?? results.processingTime ?? 0;

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(notification.body || '');
      alert('Copied to clipboard!');
    } catch (e) {
      console.error('Clipboard error', e);
      alert('Unable to copy to clipboard');
    }
  };

  const confidenceText = typeof classification.confidence === 'number'
    ? `${(classification.confidence * 100).toFixed(0)}%`
    : '—';

  return (
    <div className="results-panel">
      <h2>Agent Results</h2>
      <p className="processing-time">Processed in {processingTime}ms</p>

      <div className="result-card">
        <h3>🏷️ Classification</h3>
        <p><strong>Category:</strong> {classification.category || '—'}</p>
        <p><strong>Severity:</strong> {classification.severity || '—'}</p>
        <p><strong>Confidence:</strong> {confidenceText}</p>
        <p><strong>Tags:</strong> {classification.tags?.join(', ') || '—'}</p>
      </div>

      <div className="result-card">
        <h3>👤 Assigned Owner</h3>
        <p><strong>Team:</strong> {assignment.team || '—'}</p>
        <p><strong>Primary:</strong> {assignment.owner || '—'}</p>
        <p><strong>Escalation:</strong> {assignment.escalationPath?.join(' → ') || '—'}</p>
      </div>

      <div className="result-card">
        <h3>🎫 Ticket Created</h3>
        <p><strong>ID:</strong> {ticket.id || '—'}</p>
        <p><strong>Status:</strong> {ticket.status || '—'} | <strong>Priority:</strong> {ticket.priority || '—'}</p>
      </div>

      <div className="result-card">
        <h3>📋 Next Steps Checklist</h3>
        <ul>
          {(actions.immediate || []).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="result-card">
        <h3>📣 Draft Notification</h3>
        <pre>{notification.body || ''}</pre>
        <button onClick={copyToClipboard} className="copy-btn">Copy to Slack</button>
      </div>
    </div>
  );
}

export default ResultsPanel;
