import React, { useState } from 'react';

function getSeverityClass(severity) {
  const s = severity?.toLowerCase() || '';
  if (s.includes('p1') || s.includes('critical')) return 'severity-p1';
  if (s.includes('p2') || s.includes('high')) return 'severity-p2';
  if (s.includes('p3') || s.includes('medium')) return 'severity-p3';
  return 'severity-p4';
}

function ResultsPanel({ results }) {
  const { classification, assignment, ticket, actions, notification, processingTime } = results;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(notification.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      incident: {
        severity: classification.severity,
        category: classification.category,
        tags: classification.tags,
        confidence: classification.confidence
      },
      assignment: {
        owner: assignment.owner,
        team: assignment.team,
        escalationPath: assignment.escalationPath
      },
      ticket: {
        id: ticket.id,
        status: ticket.status,
        priority: ticket.priority
      },
      actions: actions.immediate,
      notification: notification.body,
      processingTime: `${processingTime}ms`
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-${ticket.id}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const severityClass = getSeverityClass(classification.severity);

  const confidenceText = typeof classification.confidence === 'number'
    ? `${(classification.confidence * 100).toFixed(0)}%`
    : '—';

  return (
    <div className="results-panel animate-in">
      {/* Severity Banner */}
      <div className={`severity-banner ${severityClass} animate-section`} style={{ animationDelay: '0ms' }}>
        <div className="severity-indicator">
          <span className="severity-level">{classification.severity}</span>
          <span className="severity-label">
            {classification.severity === 'P1' ? 'Critical' :
             classification.severity === 'P2' ? 'High' :
             classification.severity === 'P3' ? 'Medium' : 'Low'}
          </span>
        </div>
        <div className="severity-category">{classification.category}</div>
      </div>

      <div className="results-header animate-section" style={{ animationDelay: '50ms' }}>
        <div className="results-title">Analysis Complete</div>
        <div className="results-header-actions">
          <div className="results-time">{processingTime}ms</div>
          <button className="export-button" onClick={exportResults} title="Export as JSON">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="result-section animate-section" style={{ animationDelay: '100ms' }}>
        <div className="section-label">Tags</div>
        <div className="tags-list">
          {classification.tags?.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Assignment */}
      <div className="result-section animate-section" style={{ animationDelay: '150ms' }}>
        <div className="section-label">Assigned To</div>
        <div className="owner-info">
          <div className="owner-name">{assignment.owner}</div>
          <div className="owner-team">{assignment.team}</div>
        </div>
        <div className="escalation-path">
          {assignment.escalationPath?.join(' → ')}
        </div>
      </div>

      {/* Ticket */}
      <div className="result-section animate-section" style={{ animationDelay: '200ms' }}>
        <div className="section-label">Ticket</div>
        <a href="#" className="ticket-link" onClick={(e) => e.preventDefault()}>
          {ticket.id}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>

      {/* Actions */}
      <div className="result-section animate-section" style={{ animationDelay: '250ms' }}>
        <div className="section-label">Immediate Actions</div>
        <div className="actions-list">
          {actions.immediate?.map((action, i) => (
            <div key={i} className="action-item">
              <span className="action-bullet">—</span>
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification */}
      <div className="result-section animate-section" style={{ animationDelay: '300ms' }}>
        <div className="section-label">Draft Notification</div>
        <div className="notification-content">{notification.body}</div>
        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={copyToClipboard}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default ResultsPanel;
