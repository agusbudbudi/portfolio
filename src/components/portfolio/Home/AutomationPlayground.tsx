import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Terminal as TerminalIcon, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
      timer = setTimeout(() => setIsRunning(false), 0);
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
      case 'pass': return <CheckCircle2 size={14} className="text-[#4ec9b0]" />;
      case 'fail': return <XCircle size={14} className="text-[#f44747]" />;
      case 'warning': return <AlertCircle size={14} className="text-[#ce9178]" />;
      case 'result': return <CheckCircle2 size={14} className="text-[#4ec9b0]" />;
      default: return null;
    }
  };

  const getLogTextColor = (type: string) => {
    switch (type) {
      case 'pass': return 'text-[#4ec9b0]';
      case 'fail': return 'text-[#f44747]';
      case 'warning': return 'text-[#ce9178]';
      case 'result': return 'text-[#4ec9b0] font-bold mt-2.5 pt-2.5 border-t border-dashed border-[#444]';
      case 'info':
      default:
        return 'text-[#d4d4d4]';
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <TerminalIcon size={20} className="text-blue-500 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">Automation Playground</h3>
          </div>
          <div className="w-full sm:w-auto">
            {!isRunning && currentStep === -1 ? (
              <button
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-2xl text-base font-semibold transition-all duration-300 shadow-md shadow-blue-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 hover:from-sky-400 hover:to-blue-500 cursor-pointer border-none w-full justify-center"
                onClick={startSimulation}
              >
                <Play size={16} /> Run Test Suite
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl text-base font-semibold transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:bg-slate-555 dark:hover:bg-slate-800 hover:border-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
                onClick={resetSimulation}
                disabled={isRunning}
              >
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </div>
        </div>

        <div className="w-full max-w-[900px] mx-auto bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/10 dark:border-slate-800/80">
          <div className="bg-[#323232] px-4 py-3 flex items-center relative">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 text-[#a0a0a0] text-xs font-mono hidden sm:block">
              agus@macbook: ~/qa-automation
            </div>
          </div>
          <div className="h-[300px] sm:h-[400px] p-5 overflow-y-auto font-mono text-xs sm:text-sm leading-relaxed scroll-smooth" ref={scrollRef}>
            {logs.length === 0 ? (
              <div className="text-[#666] h-full flex flex-col justify-center items-center">
                <p>$ click "Run Test Suite" to start simulation...</p>
                <span className="inline-block w-2 h-4 bg-white animate-blink">_</span>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={`mb-1 flex gap-3 ${getLogTextColor(log.type)}`}>
                  <span className="text-[#569cd6] flex-shrink-0">[{log.timestamp}]</span>
                  <span className="flex items-center gap-2 word-break-all">
                    {getIcon(log.type)}
                    {log.text}
                  </span>
                </div>
              ))
            )}
            {isRunning && (
              <div className="mb-1 flex gap-3 text-[#d4d4d4]">
                <span className="text-[#569cd6] flex-shrink-0">[{getTime()}]</span>
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2 h-4 bg-white animate-blink">_</span>
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-5 text-slate-500 dark:text-slate-400 text-sm italic">
          This simulation demonstrates a real-time automated test run using standard QA reporting patterns.
        </p>
      </div>
    </section>
  );
};

export default AutomationPlayground;
