import React, { useState, useEffect, useRef } from 'react';
import IncidentForm from './components/IncidentForm';
import AgentWorkflow from './components/AgentWorkflow';
import ResultsPanel from './components/ResultsPanel';
import SkeletonPanel from './components/SkeletonPanel';
import { processIncident } from './services/api';

// MOCK DATA - Remove when backend is ready
/*
const MOCK_RESPONSE = {
  classification: {
    category: 'Infrastructure',
    severity: 'P1',
    confidence: 0.94,
    tags: ['API', 'Payment', 'Latency', 'EU-West']
  },
  assignment: {
    owner: 'Sarah Chen',
    team: 'Platform Infrastructure',
    escalationPath: ['L1 Support', 'Platform Team', 'SRE On-Call', 'VP Engineering']
  },
  ticket: {
    id: 'INC-2024-0892',
    status: 'Open',
    priority: 'P1'
  },
  actions: {
    immediate: [
      'Check Payment API health dashboard for error patterns',
      'Review recent deployments in EU-West region',
      'Verify Stripe webhook endpoint connectivity',
      'Scale up API instances if CPU > 80%',
      'Enable detailed logging for payment service'
    ]
  },
  notification: {
    body: `P1 Incident Detected

Service: Payment API
Region: EU-West
Impact: 23% error rate, 12s response times

Assigned: Sarah Chen (Platform Infrastructure)
Ticket: INC-2024-0892

Investigation in progress.`
  },
  steps: [
    { message: 'Extracted 4 entities' },
    { message: 'Severity P1 (94%)' },
    { message: 'Assigned to Sarah Chen' },
    { message: 'Created INC-2024-0892' },
    { message: '5 actions generated' },
    { message: 'Draft ready' }
  ],
  processingTime: 1247
};
*/
function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(null);

  // Live timer while processing
  useEffect(() => {
    let interval;
    if (loading) {
      startTimeRef.current = Date.now();
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (incidentData) => {
    setLoading(true);
    setResults(null);
    setElapsedTime(0);

    try {
      for (let i = 1; i <= 6; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 400));
      }

      const finalTime = Date.now() - startTimeRef.current;
      const response = await processIncident(incidentData);
      setCurrentStep('complete');
      setResults({ ...response, processingTime: finalTime });
    } catch (error) {
      console.error('Error:', error);
      const message = error?.response?.data?.error || error.message || 'Failed to process incident';
      setResults({ error: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-title">
            <h1>Ops Incident First Response</h1>
          </div>
          <div className="header-badge">
            <span className="badge-text">Powered by</span>
            <span className="badge-logo">watson<span className="badge-x">x</span></span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="left-panel">
          <IncidentForm onSubmit={handleSubmit} loading={loading} />
          <AgentWorkflow currentStep={currentStep} elapsedTime={elapsedTime} loading={loading} />
        </div>

        <div className="right-panel">
          {results ? (
            <ResultsPanel results={results} />
          ) : loading ? (
            <SkeletonPanel />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h2 className="empty-title">AI-Powered Incident Response</h2>
              <p className="empty-text">
                Describe an incident and get instant classification, assignment, and action recommendations
              </p>
              <div className="empty-features">
                <div className="empty-feature">
                  <span className="feature-icon">→</span>
                  <span>Auto-classify severity</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">→</span>
                  <span>Assign to right team</span>
                </div>
                <div className="empty-feature">
                  <span className="feature-icon">→</span>
                  <span>Generate action checklist</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
