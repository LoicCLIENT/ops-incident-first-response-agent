import React, { useState } from 'react';

function ResultsPanel({ results }) {
  const [checkedItems, setCheckedItems] = useState({});

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

  const toggleCheckItem = (itemKey) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

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
        <ul>
          <li><strong>Category:</strong> {classification.category || '—'}</li>
          <li><strong>Severity:</strong> {classification.severity || '—'}</li>
          <li><strong>Confidence:</strong> {confidenceText}</li>
          <li><strong>Tags:</strong> {classification.tags?.join(', ') || '—'}</li>
        </ul>
      </div>

      <div className="result-card">
        <h3>👤 Assigned Owner</h3>
        <ul>
          <li><strong>Team:</strong> {assignment.team || '—'}</li>
          <li><strong>Primary:</strong> {assignment.owner || '—'}</li>
          <li><strong>Escalation:</strong> {assignment.escalationPath?.join(' → ') || '—'}</li>
        </ul>
      </div>

      <div className="result-card">
        <h3>🎫 Ticket Created</h3>
        <ul>
          <li><strong>ID:</strong> {ticket.id || '—'}</li>
          <li><strong>Status:</strong> {ticket.status || '—'} | <strong>Priority:</strong> {ticket.priority || '—'}</li>
        </ul>
      </div>

      <div className="result-card">
        <h3>📋 Next Steps Checklist</h3>
        <ul className="checklist">
          {(actions.immediate || []).map((a, i) => {
            const itemKey = `immediate_${i}`;
            const isChecked = checkedItems[itemKey] || false;
            return (
              <li key={i} className={isChecked ? 'checked' : ''}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheckItem(itemKey)}
                  className="checklist-checkbox"
                />
                <span style={{ textDecoration: isChecked ? 'line-through' : 'none' }}>
                  {a}
                </span>
              </li>
            );
          })}
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
