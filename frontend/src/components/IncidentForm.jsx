import React, { useState } from 'react';

// Realistic Datadog-style alert examples for NovaPay
const EXAMPLES = [
  {
    id: 'p1-db',
    severity: 'P1',
    label: 'Database Outage',
    description: `🚨 CRITICAL ALERT - Datadog Monitor Triggered
Service: novapay-prod-aurora
Alert: PostgreSQL Primary Unreachable

Details:
- Connection failures: 100% (was 0%)
- Active connections: 0 (was 847)
- All read replicas also reporting connection issues
- payment-svc pods in CrashLoopBackOff (23 pods affected)

Impact: Complete payment processing outage
Revenue at risk: ~$83,000/hour
Started: 2024-01-15 14:32:18 UTC (3 minutes ago)
Region: us-east-1

Recent changes: None in last 24 hours
Last successful health check: 14:29:01 UTC`
  },
  {
    id: 'p1-security',
    severity: 'P1',
    label: 'Security Breach',
    description: `🔴 SECURITY ALERT - Anomaly Detection
Service: auth-svc / IAM
Alert: Unusual Access Pattern Detected

Details:
- 15,000+ failed auth attempts in 5 minutes (baseline: 50)
- Source IPs: Multiple geographic locations (Russia, China, Brazil)
- Target: admin API endpoints
- Some successful authentications from unusual locations

Affected accounts: 3 admin users showing suspicious activity
WAF blocks: 12,847 requests blocked
Started: 2024-01-15 09:15:00 UTC

IMMEDIATE ACTION REQUIRED - Potential credential compromise`
  },
  {
    id: 'p2-payments',
    severity: 'P2',
    label: 'Payment Degraded',
    description: `⚠️ ALERT - Payment Processing Degraded
Service: payment-svc / Stripe Integration
Alert: Error Rate Threshold Exceeded

Details:
- Payment success rate: 76% (SLO: 99.5%)
- p99 latency: 4.2s (SLO: 500ms)
- Stripe webhook delivery: 340 pending, 89 failed
- Error type: "card_declined" and "processing_error" elevated

Affected: EU merchant transactions primarily
Merchant complaints: 12 tickets opened in last 30 min
Started: 2024-01-15 11:45:00 UTC

Stripe Status: All systems operational
No recent deployments to payment-svc`
  },
  {
    id: 'p2-infra',
    severity: 'P2',
    label: 'K8s Node Issues',
    description: `⚠️ ALERT - Kubernetes Cluster Degradation
Cluster: novapay-prod-eks
Alert: Multiple Nodes NotReady

Details:
- Nodes affected: 3 of 12 (ip-10-0-1-45, ip-10-0-2-78, ip-10-0-3-12)
- Status: NotReady (kubelet stopped responding)
- Pods evicted: 47 pods rescheduling
- Services affected: payment-svc, webhook-svc, fraud-detector

Current capacity: 75% (normally 100%)
Pending pods: 23 in Pending state
Auto-scaling: Attempting to provision new nodes
Started: 2024-01-15 16:20:00 UTC

AWS Health: No reported issues in us-east-1`
  },
  {
    id: 'p3-perf',
    severity: 'P3',
    label: 'Slow Dashboard',
    description: `📊 ALERT - Performance Degradation
Service: merchant-portal / reporting-api
Alert: Response Time SLO Breach

Details:
- Dashboard load time: 8.5s (SLO: 2s)
- API p95 latency: 3.2s (normal: 400ms)
- Database CPU: 78% (normal: 35%)
- Slow query detected: analytics aggregation query

Affected users: Internal analytics team + 230 merchants
User complaints: 5 support tickets
Started: 2024-01-15 10:00:00 UTC

Likely cause: Large data import job started at 09:45 UTC
Non-critical: Core payment processing unaffected`
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
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
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
        placeholder="Paste alert from Datadog, PagerDuty, or describe the incident..."
        required
        disabled={loading}
      />

      <button
        type="submit"
        className={`submit-button ${loading ? 'loading' : ''}`}
        disabled={loading || !description.trim()}
      >
        {loading ? 'Analyzing with Watson AI...' : 'Analyze Incident'}
        {!loading && <span className="shortcut-hint">⌘↵</span>}
      </button>

      <div className="examples-section">
        <span className="examples-label">Demo scenarios (click to load)</span>
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
