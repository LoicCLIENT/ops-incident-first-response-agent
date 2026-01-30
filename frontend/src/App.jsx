import React, { useState } from 'react';
import IncidentForm from './components/IncidentForm';
import AgentWorkflow from './components/AgentWorkflow';
import ResultsPanel from './components/ResultsPanel';
import { processIncident } from './services/api';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [steps, setSteps] = useState([]);

  const handleSubmit = async (incidentData) => {
    setLoading(true);
    setResults(null);
    setSteps([]);

    try {
      for (let i = 1; i <= 6; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, 800));
      }

      const response = await processIncident(incidentData);
      setSteps(response.steps || []);
      setCurrentStep('complete');
      setResults(response);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🚨 Ops Incident First Response Agent</h1>
        <p>Powered by IBM watsonx Orchestrate</p>
      </header>

      <main>
        <section className="input-section">
          <IncidentForm onSubmit={handleSubmit} loading={loading} />
        </section>

        <section className="workflow-section">
          <AgentWorkflow currentStep={currentStep} steps={steps} />
        </section>

        {results && (
          <section className="results-section">
            <ResultsPanel results={results} />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
