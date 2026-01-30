import React from 'react';

function ResultsPanel({ results }) {
  const { classification, assignment, ticket, actions, notification, processingTime } = results;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(notification.body);
    alert('Copied to clipboard!');
  };

  return (
    <div className="results-panel">
      <h2>Agent Results</h2>
      <p className="processing-time">Processed in {processingTime}ms</p>

      <div className="result-card">
        <h3>🏷️ Classification</h3>
        <p><strong>Category:</strong> {classification.category}</p>
        <p><strong>Severity:</strong> {classification.severity}</p>
        <p><strong>Confidence:</strong> {(classification.confidence * 100).toFixed(0)}%</p>
        <p><strong>Tags:</strong> {classification.tags?.join(', ')}</p>
      </div>

      <div className="result-card">
        <h3>👤 Assigned Owner</h3>
        <p><strong>Team:</strong> {assignment.team}</p>
        <p><strong>Primary:</strong> {assignment.owner}</p>
        <p><strong>Escalation:</strong> {assignment.escalationPath?.join(' → ')}</p>
      </div>

      <div className="result-card">
        <h3>🎫 Ticket Created</h3>
        <p><strong>ID:</strong> {ticket.id}</p>
        <p><strong>Status:</strong> {ticket.status} | <strong>Priority:</strong> {ticket.priority}</p>
      </div>

      <div className="result-card">
        <h3>📋 Next Steps Checklist</h3>
        <ul>
          {actions.immediate?.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="result-card">
        <h3>📣 Draft Notification</h3>
        <pre>{notification.body}</pre>
        <button onClick={copyToClipboard} className="copy-btn">Copy to Slack</button>
      </div>
    </div>
  );
}

export default ResultsPanel;
