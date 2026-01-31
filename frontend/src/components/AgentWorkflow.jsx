import React, { useMemo } from 'react';

const STEPS = [
  { id: 1, label: 'Analyze Incident' },
  { id: 2, label: 'Classify Severity' },
  { id: 3, label: 'Assign Owner' },
  { id: 4, label: 'Create Ticket' },
  { id: 5, label: 'Build Checklist' },
  { id: 6, label: 'Draft Notification' }
];

function AgentWorkflow({ currentStep, elapsedTime, loading }) {
  const formatTime = (ms) => {
    return (ms / 1000).toFixed(1) + 's';
  };
  const getStepStatus = (stepId) => {
    if (currentStep === 'complete') return 'complete';
    if (!currentStep) return 'pending';
    if (stepId < currentStep) return 'complete';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const progressHeight = useMemo(() => {
    if (currentStep === 'complete') return '100%';
    if (!currentStep) return '0%';
    const percentage = ((currentStep - 1) / (STEPS.length - 1)) * 100;
    return `${Math.min(percentage, 100)}%`;
  }, [currentStep]);

  return (
    <div className="agent-workflow">
      <div className="workflow-header">
        <span className="workflow-label">Pipeline</span>
        {loading && (
          <span className="workflow-timer">{formatTime(elapsedTime)}</span>
        )}
      </div>

      <div className="workflow-timeline">
        <div className="timeline-track">
          <div
            className="timeline-progress"
            style={{ height: progressHeight }}
          />
        </div>

        <div className="workflow-steps">
          {STEPS.map((step) => {
            const status = getStepStatus(step.id);

            return (
              <div key={step.id} className={`workflow-step ${status}`}>
                <div className="step-node">
                  {status === 'complete' && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                  {status === 'active' && <div className="node-pulse" />}
                </div>
                <span className="step-name">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AgentWorkflow;
