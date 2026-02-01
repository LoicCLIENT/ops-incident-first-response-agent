const { callWatsonxOrchestrate } = require('../services/watsonx');
const { extractJsonFromText } = require('../utils/jsonParser');
const fs = require('fs');
const path = require('path');

// NovaPay runbook actions by category - real commands for real infrastructure
const RUNBOOKS = {
  'database': {
    immediate: [
      'Check Aurora cluster status: `aws rds describe-db-clusters --db-cluster-identifier novapay-prod`',
      'Verify connection pool health: `kubectl logs -n payments deployment/payment-svc --tail=50 | grep -i connection`',
      'Check read replica status: `aws rds describe-db-instances --filters Name=db-cluster-id,Values=novapay-prod`',
      'DO NOT restart primary without DBA approval'
    ],
    diagnostic: [
      'Check active connections: `SELECT count(*), state FROM pg_stat_activity GROUP BY state;`',
      'Find long-running queries: `SELECT pid, now() - query_start AS duration, query FROM pg_stat_activity WHERE state != \'idle\' AND query_start < now() - interval \'30 seconds\';`',
      'Check replication lag: `SELECT client_addr, pg_wal_lsn_diff(sent_lsn, write_lsn) as lag_bytes FROM pg_stat_replication;`'
    ],
    communication: [
      'Post to #dba-incidents: Database incident - investigating',
      'Page @robert.taylor via PagerDuty if P1/P2'
    ]
  },
  'payment-processing': {
    immediate: [
      'Check Stripe API status: `curl -s https://status.stripe.com/api/v2/status.json | jq .status`',
      'Check payment-svc pod status: `kubectl get pods -n payments -l app=payment-svc -o wide`',
      'Review recent error logs: `kubectl logs -n payments deployment/payment-svc --tail=100 | grep -i error`',
      'DO NOT disable Stripe webhooks without approval'
    ],
    diagnostic: [
      'Check payment success rate in Datadog dashboard',
      'Review Stripe webhook delivery status in Stripe dashboard',
      'Check for upstream bank/processor issues'
    ],
    communication: [
      'Post to #platform-incidents: Payment processing incident - investigating',
      'Notify @maria.santos as payment-svc owner'
    ]
  },
  'infrastructure': {
    immediate: [
      'Check node health: `kubectl get nodes -o wide`',
      'Check pod status across namespaces: `kubectl get pods -A | grep -v Running`',
      'Check recent events: `kubectl get events -A --sort-by=\'.lastTimestamp\' | tail -20`'
    ],
    diagnostic: [
      'Check node resources: `kubectl top nodes`',
      'Check pod resource usage: `kubectl top pods -n payments`',
      'Review Datadog infrastructure dashboard'
    ],
    communication: [
      'Post to #sre-incidents: Infrastructure incident - investigating',
      'Page SRE on-call if nodes are unhealthy'
    ]
  },
  'security': {
    immediate: [
      'Check auth service status: `kubectl get pods -n platform -l app=auth-svc`',
      'Review auth failure logs: `kubectl logs -n platform deployment/auth-svc --tail=100 | grep -i "unauthorized\\|failed\\|denied"`',
      'IMMEDIATELY notify security team - DO NOT delay',
      'DO NOT rotate credentials without security team approval'
    ],
    diagnostic: [
      'Check failed login attempts in CloudWatch',
      'Review WAF logs for suspicious IPs',
      'Audit recent API access patterns'
    ],
    communication: [
      'Post to #security-incidents: SECURITY INCIDENT - immediate attention required',
      'Page @sarah.johnson immediately',
      'Preserve all logs for forensics'
    ]
  },
  'network': {
    immediate: [
      'Check DNS resolution: `nslookup api.novapay.com`',
      'Check load balancer health: `aws elbv2 describe-target-health --target-group-arn <arn>`',
      'Verify ingress controller: `kubectl get pods -n ingress-nginx`'
    ],
    diagnostic: [
      'Check network latency in Datadog',
      'Review ALB access logs for errors',
      'Test connectivity between services'
    ],
    communication: [
      'Post to #sre-incidents: Network incident - investigating',
      'Notify @carlos.rodriguez as network specialist'
    ]
  },
  'performance': {
    immediate: [
      'Check node CPU/memory: `kubectl top nodes`',
      'Check pod resource usage: `kubectl top pods -A --sort-by=cpu | head -20`',
      'Review HPA status: `kubectl get hpa -A`'
    ],
    diagnostic: [
      'Check Datadog APM for slow endpoints',
      'Review database query performance',
      'Check for memory leaks in application logs'
    ],
    communication: [
      'Post to #sre-incidents: Performance degradation - investigating',
      'Notify service owner based on affected component'
    ]
  }
};

async function recommendActions(description, classification) {
  const inputContext = `
Incident Description: ${description}

Classification Results:
- Severity: ${classification.severity}
- Category: ${classification.category}
- Tags: ${classification.tags?.join(', ') || 'none'}

Provide specific, actionable recommendations for NovaPay's infrastructure.
`;

  try {
    const result = await callWatsonxOrchestrate({
      skill: 'incident-action-recommender',
      input: { prompt: inputContext }
    });

    if (result && !result.error) {
      return {
        immediate: result.immediate || [],
        diagnostic: result.diagnostic || [],
        communication: result.communication || []
      };
    }

    throw new Error(result?.fallback || 'Actions generation failed');

  } catch (error) {
    console.error('[Actions] Error:', error.message);

    // Smart fallback based on category
    const category = classification.category?.toLowerCase() || 'infrastructure';
    const runbook = RUNBOOKS[category] || RUNBOOKS['infrastructure'];

    // Add severity-specific communication
    let communication = [...runbook.communication];
    if (classification.severity === 'P1') {
      communication.unshift('🚨 P1 INCIDENT - Page all on-call immediately');
      communication.push('Update status page: Investigating service degradation');
    }

    return {
      immediate: runbook.immediate,
      diagnostic: runbook.diagnostic,
      communication
    };
  }
}

module.exports = { recommendActions };