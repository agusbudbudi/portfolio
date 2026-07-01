import React, { useState } from "react";
import {
  Search,
  ClipboardList,
  Code2,
  MonitorPlay,
  PlayCircle,
  BarChart3,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import SectionHeader from "../common/SectionHeader";

interface Tool {
  name: string;
  logo: string;
}

interface StlcPhase {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  tools: Tool[];
  deliverables: string[];
}

const STLC_PHASES: StlcPhase[] = [
  {
    id: "requirement",
    title: "Requirement Analysis",
    icon: <Search size={24} />,
    description:
      "Analyzing software requirements from a testing perspective to identify testable requirements and clarify ambiguities.",
    tools: [
      { name: "Jira", logo: "/img/tools/jira-logo.png" },
      { name: "Figma", logo: "/img/tools/figma-logo.png" },
    ],
    deliverables: [
      "RTM (Requirement Traceability Matrix)",
      "Test Automation Feasibility Report",
    ],
  },
  {
    id: "planning",
    title: "Test Planning",
    icon: <ClipboardList size={24} />,
    description:
      "Defining the testing strategy, scope, resources, and schedule. Risk assessment and mitigation plans are established here.",
    tools: [
      { name: "TestRail", logo: "/img/tools/testrail-logo.png" },
      { name: "Asana", logo: "/img/tools/asana-logo.png" },
    ],
    deliverables: ["Test Plan Document", "Risk Assessment Report"],
  },
  {
    id: "development",
    title: "Test Case Development",
    icon: <Code2 size={24} />,
    description:
      "Creating detailed test cases, test data, and automation scripts based on the finalized test plan.",
    tools: [
      { name: "Cypress", logo: "/img/tools/cypress-logo.svg" },
      { name: "Webdriver.io", logo: "/img/tools/webdriver-io-logo.png" },
      { name: "VS Code", logo: "/img/tools/vsc-logo.png" },
    ],
    deliverables: ["Test Cases / Scenarios", "Automation Scripts", "Test Data"],
  },
  {
    id: "environment",
    title: "Environment Setup",
    icon: <MonitorPlay size={24} />,
    description:
      "Preparing the test environment (hardware/software) and ensuring smoke tests pass before actual execution.",
    tools: [
      { name: "Jenkins", logo: "/img/tools/jenkins-logo.svg" },
      { name: "Vercel", logo: "/img/tools/vercel-logo.svg" },
    ],
    deliverables: ["Test Environment Ready", "Smoke Test Report"],
  },
  {
    id: "execution",
    title: "Test Execution",
    icon: <PlayCircle size={24} />,
    description:
      "Executing the test cases, logging defects in the tracking system, and re-testing fixed issues.",
    tools: [
      { name: "Postman", logo: "/img/tools/postman-logo.png" },
      { name: "Charles", logo: "/img/tools/charles-proxy-logo.png" },
      { name: "DBeaver", logo: "/img/tools/dbeaver-logo.png" },
    ],
    deliverables: ["Bug Reports", "Execution Logs", "Daily Status Report"],
  },
  {
    id: "closure",
    title: "Test Cycle Closure",
    icon: <BarChart3 size={24} />,
    description:
      "Evaluating the cycle completion criteria, analyzing test metrics, and documenting lessons learned.",
    tools: [
      { name: "Allure Report", logo: "/img/tools/allure-logo.png" },
      { name: "GitHub", logo: "/img/tools/github-logo.png" },
    ],
    deliverables: ["Test Summary Report", "QA Metrics Dashboard"],
  },
];

const StlcPipeline: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number>(0);

  return (
    <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900/30 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <SectionHeader
          icon={<GitBranch size={20} />}
          iconClassName="stlc-icon"
          title="Interactive"
          titleSpan="STLC Map"
          subtitle="How I navigate the Software Testing Life Cycle to ensure quality."
        />

        <div className="flex flex-col gap-12 mt-12">
          {/* Steps node progress bar */}
          <div className="relative py-5">
            {/* Connector line - hidden on mobile/tablet */}
            <div className="absolute top-[50px] left-[5%] right-[5%] h-1 bg-slate-200 dark:bg-slate-800/80 z-0 rounded-full hidden lg:block"></div>

            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-between items-start gap-6 lg:gap-0 relative z-10">
              {STLC_PHASES.map((phase, index) => {
                const isActive = index === activePhase;
                const isCompleted = index < activePhase;

                return (
                  <div
                    key={phase.id}
                    className="flex flex-col items-center gap-3 cursor-pointer w-[calc(50%-1rem)] sm:w-[calc(33%-1.2rem)] lg:w-[130px] group"
                    onClick={() => setActivePhase(index)}
                  >
                    <div className="relative flex justify-center items-center transition-transform duration-300 group-hover:scale-105">
                      <div className={`w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isActive
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                        : isCompleted
                          ? 'border-blue-550 text-blue-500 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-800/85 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900'
                        }`}>
                        {phase.icon}
                      </div>
                      <div className={`absolute -top-1 -right-1 border-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm ${isActive
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isCompleted
                          ? 'border-blue-500 text-blue-550 dark:border-blue-400 dark:text-blue-400 bg-white dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-800/85 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900'
                        }`}>
                        {index + 1}
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold text-center tracking-wide transition-colors ${isActive
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400'
                      }`}>
                      {phase.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 sm:p-10 shadow-none border border-slate-200 dark:border-slate-800/80 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white m-0">{STLC_PHASES[activePhase].title}</h2>
            </div>

            <p className="text-slate-650 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-[800px]">
              {STLC_PHASES[activePhase].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Tools Used</h4>
                <div className="flex flex-wrap gap-2.5">
                  {STLC_PHASES[activePhase].tools.map((tool, i) => (
                    <span key={i} className="flex items-center gap-3 px-4 py-2 bg-blue-500/5 dark:bg-blue-500/10 text-blue-550 dark:text-blue-400 border border-slate-100 dark:border-slate-800/60 rounded-xl text-xs font-semibold hover:-translate-y-0.5 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-all duration-300">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="w-7 h-7 object-contain"
                      />
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Key Deliverables</h4>
                <div className="flex flex-wrap gap-2.5">
                  {STLC_PHASES[activePhase].deliverables.map((item, i) => (
                    <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
              <ChevronRight size={16} /> Click on other phases to see details
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StlcPipeline;
