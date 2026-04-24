import React, { useState } from "react";
import {
  Search,
  ClipboardList,
  Code2,
  MonitorPlay,
  PlayCircle,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import SectionHeader from "../common/SectionHeader";
import { GitBranch } from "lucide-react";
import "./StlcPipeline.css";

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
    <section className="stlc-pipeline section">
      <div className="container">
        <SectionHeader
          icon={<GitBranch size={20} />}
          iconClassName="stlc-icon"
          title="Interactive"
          titleSpan="STLC Map"
          subtitle="How I navigate the Software Testing Life Cycle to ensure quality."
        />

        <div className="stlc-container">
          <div className="stlc-steps-wrapper">
            <div className="stlc-line"></div>
            <div className="stlc-steps">
              {STLC_PHASES.map((phase, index) => (
                <div
                  key={phase.id}
                  className={`stlc-step-node ${index === activePhase ? "active" : ""} ${index < activePhase ? "completed" : ""}`}
                  onClick={() => setActivePhase(index)}
                >
                  <div className="node-visual">
                    <div className="node-icon-wrapper">{phase.icon}</div>
                    <div className="node-number">{index + 1}</div>
                  </div>
                  <span className="node-title">{phase.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stlc-details-card">
            <div className="stlc-details-header">
              <h2>{STLC_PHASES[activePhase].title}</h2>
            </div>

            <p className="phase-description">
              {STLC_PHASES[activePhase].description}
            </p>

            <div className="phase-info-grid">
              <div className="info-column">
                <h4>Tools Used</h4>
                <div className="info-tags">
                  {STLC_PHASES[activePhase].tools.map((tool, i) => (
                    <span key={i} className="info-tag tool-tag">
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className="phase-tool-logo"
                      />
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="info-column">
                <h4>Key Deliverables</h4>
                <div className="info-tags">
                  {STLC_PHASES[activePhase].deliverables.map((item, i) => (
                    <span key={i} className="info-tag deliverable-tag">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="stlc-nav-hint">
              <ChevronRight size={16} /> Click on other phases to see details
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StlcPipeline;
