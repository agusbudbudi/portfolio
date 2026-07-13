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
      { name: "Jira", logo: "/personal-portfolio/img/tools/jira-logo.webp" },
      { name: "Figma", logo: "/personal-portfolio/img/tools/figma-logo.webp" },
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
      { name: "TestRail", logo: "/personal-portfolio/img/tools/testrail-logo.webp" },
      { name: "Asana", logo: "/personal-portfolio/img/tools/asana-logo.webp" },
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
      { name: "Cypress", logo: "/personal-portfolio/img/tools/cypress-logo.svg" },
      { name: "Webdriver.io", logo: "/personal-portfolio/img/tools/webdriver-io-logo.webp" },
      { name: "VS Code", logo: "/personal-portfolio/img/tools/vsc-logo.webp" },
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
      { name: "Jenkins", logo: "/personal-portfolio/img/tools/jenkins-logo.svg" },
      { name: "Vercel", logo: "/personal-portfolio/img/tools/vercel-logo.svg" },
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
      { name: "Postman", logo: "/personal-portfolio/img/tools/postman-logo.webp" },
      { name: "Charles", logo: "/personal-portfolio/img/tools/charles-proxy-logo.webp" },
      { name: "DBeaver", logo: "/personal-portfolio/img/tools/dbeaver-logo.webp" },
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
      { name: "Allure Report", logo: "/personal-portfolio/img/tools/allure-logo.webp" },
      { name: "GitHub", logo: "/personal-portfolio/img/tools/github-logo.webp" },
    ],
    deliverables: ["Test Summary Report", "QA Metrics Dashboard"],
  },
];

const StlcPipeline: React.FC = () => {
  const [activePhase, setActivePhase] = useState<number>(0);

  return (
    <section className="py-12 md:py-20 bg-ld-cloud overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-ld-lilac text-ld-violet">
            <GitBranch size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Interactive <span className="text-ld-violet">STLC Map</span>
            </h2>
            <p className="text-sm text-ld-slate">How I navigate the Software Testing Life Cycle to ensure quality.</p>
          </div>
        </div>

        <div className="flex flex-col gap-12 mt-12">
          {/* Steps node progress bar */}
          <div className="relative py-5">
            {/* Connector line - hidden on mobile/tablet */}
            <div className="absolute top-[50px] left-[5%] right-[5%] h-1 bg-ld-ash z-0 rounded-full hidden lg:block"></div>

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
                    <div className="relative flex justify-center items-center">
                      <div className={`w-[60px] h-[60px] rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${isActive
                        ? 'bg-ld-violet text-white border-ld-violet'
                        : isCompleted
                          ? 'border-ld-violet text-ld-violet bg-ld-canvas'
                          : 'border-ld-ash text-ld-fog bg-ld-canvas'
                        }`}>
                        {phase.icon}
                      </div>
                      <div className={`absolute -top-1 -right-1 border-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm ${isActive
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : isCompleted
                          ? 'border-ld-violet text-ld-violet bg-ld-canvas'
                          : 'border-ld-ash text-ld-fog bg-ld-canvas'
                        }`}>
                        {index + 1}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold text-center tracking-wide transition-colors ${isActive
                      ? 'text-ld-graphite'
                      : 'text-ld-fog group-hover:text-ld-violet'
                      }`}>
                      {phase.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-ld-canvas rounded-xl p-6 sm:p-10 border border-ld-ash animate-fade-in">
            <div className="mb-6">
              <h2 className="font-ld-display font-semibold text-xl sm:text-2xl text-ld-graphite m-0">{STLC_PHASES[activePhase].title}</h2>
            </div>

            <p className="text-ld-slate text-sm sm:text-base leading-relaxed mb-8 max-w-[800px]">
              {STLC_PHASES[activePhase].description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col">
                <h4 className="text-xs font-semibold text-ld-fog uppercase tracking-widest mb-4">Tools Used</h4>
                <div className="flex flex-wrap gap-2.5">
                  {STLC_PHASES[activePhase].tools.map((tool, i) => (
                    <span key={i} className="flex items-center gap-3 px-4 py-2 bg-ld-lilac text-ld-violet border border-ld-ash rounded-lg text-xs font-semibold transition-colors hover:bg-ld-violet/10">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        loading="lazy"
                        decoding="async"
                        className="w-7 h-7 object-contain"
                      />
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs font-semibold text-ld-fog uppercase tracking-widest mb-4">Key Deliverables</h4>
                <div className="flex flex-wrap gap-2.5">
                  {STLC_PHASES[activePhase].deliverables.map((item, i) => (
                    <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-ld-fog italic">
              <ChevronRight size={16} /> Click on other phases to see details
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StlcPipeline;
