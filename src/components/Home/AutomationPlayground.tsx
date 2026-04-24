import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import './AutomationPlayground.css';

interface LogEntry {
  id: number;
  text: string;
  type: 'info' | 'pass' | 'fail' | 'warning' | 'result';
  timestamp: string;
}

const SIMULATION_STEPS: Omit<LogEntry, 'id' | 'timestamp'>[] = [
  { text: 'Initializing test runner (Cypress v13.0)...', type: 'info' },
  { text: 'Connecting to browser: Chrome 124...', type: 'info' },
  { text: 'Visiting: https://portfolio-qa-agus.vercel.app', type: 'info' },
  { text: 'PASS: Navigation to Homepage', type: 'pass' },
  { text: 'PASS: Hero section visibility check', type: 'pass' },
  { text: 'PASS: Responsive menu toggle (Mobile)', type: 'pass' },
  { text: 'WARN: API response time > 200ms (Slow detected)', type: 'warning' },
  { text: 'FAIL: Projects grid lazy loading check', type: 'fail' },
  { text: 'RETRY: Attempting retry 1/3 for lazy loading...', type: 'info' },
  { text: 'PASS: Projects grid lazy loading (Retry success)', type: 'pass' },
  { text: 'PASS: Form validation - Contact Section', type: 'pass' },
  { text: 'PASS: Dark mode toggle persistence', type: 'pass' },
  { text: 'Generating Allure Report...', type: 'info' },
  { text: 'RESULT: 11 tests passed, 0 failed, 1 warning', type: 'result' },
];

const AutomationPlayground: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isRunning && currentStep < SIMULATION_STEPS.length - 1) {
      timer = setTimeout(() => {
        const nextStep = currentStep + 1;
        const newLog: LogEntry = {
          id: Date.now(),
          ...SIMULATION_STEPS[nextStep],
          timestamp: getTime(),
        };
        setLogs((prev) => [...prev, newLog]);
        setCurrentStep(nextStep);
      }, Math.random() * 800 + 400); // Random delay between steps
    } else if (currentStep === SIMULATION_STEPS.length - 1) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  const startSimulation = () => {
    setLogs([]);
    setCurrentStep(-1);
    setIsRunning(true);
  };

  const resetSimulation = () => {
    setLogs([]);
    setCurrentStep(-1);
    setIsRunning(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pass': return <CheckCircle2 size={14} className="log-icon-pass" />;
      case 'fail': return <XCircle size={14} className="log-icon-fail" />;
      case 'warning': return <AlertCircle size={14} className="log-icon-warn" />;
      case 'result': return <CheckCircle2 size={14} className="log-icon-result" />;
      default: return null;
    }
  };

  return (
    <section className="automation-playground section">
      <div className="container">
        <div className="terminal-header-main">
          <div className="terminal-title">
            <Terminal size={20} />
            <h3>Automation Playground</h3>
          </div>
          <div className="terminal-actions">
            {!isRunning && currentStep === -1 ? (
              <button className="run-btn" onClick={startSimulation}>
                <Play size={16} /> Run Test Suite
              </button>
            ) : (
              <button className="reset-btn" onClick={resetSimulation} disabled={isRunning}>
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="terminal-window">
          <div className="terminal-titlebar">
            <div className="terminal-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="terminal-tab">
              agus@macbook: ~/qa-automation
            </div>
          </div>
          <div className="terminal-body" ref={scrollRef}>
            {logs.length === 0 ? (
              <div className="terminal-placeholder">
                <p>$ click "Run Test Suite" to start simulation...</p>
                <span className="cursor">_</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`log-line type-${log.type}`}>
                  <span className="log-time">[{log.timestamp}]</span>
                  <span className="log-content">
                    {getIcon(log.type)}
                    {log.text}
                  </span>
                </div>
              ))
            )}
            {isRunning && (
              <div className="log-line">
                <span className="log-time">[{getTime()}]</span>
                <span className="log-content active">
                  <span className="cursor">_</span>
                </span>
              </div>
            )}
          </div>
        </div>
        
        <p className="playground-caption">
          This simulation demonstrates a real-time automated test run using standard QA reporting patterns.
        </p>
      </div>
    </section>
  );
};

export default AutomationPlayground;
