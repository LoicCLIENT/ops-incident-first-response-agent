import React from 'react';

const STEPS = [
  { id: 1, label: 'Analyzing', icon: '🔍' },
  { id: 2, label: 'Classification', icon: '🏷️' },
  { id: 3, label: 'Assignment', icon: '👤' },
  { id: 4, label: 'Ticket', icon: '🎫' },
  { id: 5, label: 'Checklist', icon: '📋' },
  { id: 6, label: 'Notification', icon: '📣' }
];

function AgentWorkflow({ currentStep, steps }) {
  const getStepStatus = (stepId) => {
    if (currentStep === 'complete') return 'complete';
    if (!currentStep) return 'pending';
    if (stepId < currentStep) return 'complete';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="agent-workflow">
      <h2>Agent Pipeline</h2>
      <div className="workflow-steps">
        {STEPS.map((step) => (
          <div key={step.id} className={`step ${getStepStatus(step.id)}`}>
            <span className="icon">{step.icon}</span>
            <span className="label">{step.label}</span>
          </div>
        ))}
      </div>
      {steps.length > 0 && (
        <div className="step-trace">
          {steps.map((s, i) => (
            <div key={i} className="trace-line">✓ {s.message}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AgentWorkflow;
