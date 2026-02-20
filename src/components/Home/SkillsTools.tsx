import React from 'react';
import { FlaskConical, Database, ShieldCheck, Cpu, Wrench } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import './SkillsTools.css';

const SKILL_CATEGORIES = [
  {
    title: 'Automation & Core',
    icon: <FlaskConical className="category-icon" />,
    skills: [
      { name: 'Cypress (Javascript)', level: 'Advanced', icon: '/img/tools/cypress-logo.svg' },
      { name: 'Appium (Mobile)', level: 'Intermediate', icon: '/img/tools/appium-logo.png' },
      { name: 'Webdriver.io', level: 'Intermediate', icon: '/img/tools/webdriver-io-logo.png' },
      { name: 'Javascript', level: 'Advanced', icon: '/img/tools/javascript-logo.png' },
      { name: 'Node.js', level: 'Intermediate', icon: '/img/tools/node-js-logo.png' },
      { name: 'Allure Report', level: 'Advanced', icon: '/img/tools/allure-logo.png' }
    ]
  },
  {
    title: 'API, Performance & SQL',
    icon: <Database className="category-icon" />,
    skills: [
      { name: 'Postman (API Testing)', level: 'Advanced', icon: '/img/tools/postman-logo.png' },
      { name: 'REST API & JSON', level: 'Advanced', icon: '/img/tools/rest-api-logo.png' },
      { name: 'SQL & Database', level: 'Advanced', icon: '/img/tools/sql-logo.png' },
      { name: 'DBeaver', level: 'Advanced', icon: '/img/tools/dbeaver-logo.png' },
      { name: 'JMeter', level: 'Beginner', icon: '/img/tools/jmeter-logo.png' }
    ]
  },
  {
    title: 'Management & Debug',
    icon: <ShieldCheck className="category-icon" />,
    skills: [
      { name: 'Jira & Confluence', level: 'Advanced', icon: '/img/tools/jira-logo.png' },
      { name: 'Asana', level: 'Advanced', icon: '/img/tools/asana-logo.png' },
      { name: 'TestRail', level: 'Advanced', icon: '/img/tools/testrail-logo.png' },
      { name: 'Adaptavist', level: 'Advanced', icon: '/img/tools/adaptavist-logo.png' },
      { name: 'Charles & Proxyman', level: 'Advanced', icon: '/img/tools/charles-proxy-logo.png' },
      { name: 'Crashlytics & App Center', level: 'Advanced', icon: '/img/tools/crashlytics-logo.png' }
    ]
  },
  {
    title: 'DevOps, Mobile & Tools',
    icon: <Cpu className="category-icon" />,
    skills: [
      { name: 'CI/CD (Jenkins, Git)', level: 'Intermediate', icon: '/img/tools/jenkins-logo.svg' },
      { name: 'GitHub', level: 'Advanced', icon: '/img/tools/github-logo.png' },
      { name: 'GitLab', level: 'Advanced', icon: '/img/tools/gitlab-logo.png' },
      { name: 'Android & iOS', level: 'Advanced', icon: '/img/tools/android-logo.png' },
      { name: 'VS Code', level: 'Advanced', icon: '/img/tools/vsc-logo.png' },
      { name: 'Sourcetree', level: 'Advanced', icon: '/img/tools/sourcetree-logo.png' }
    ]
  }
];

const SkillsTools: React.FC = () => {
  return (
    <section className="skills-tools section">
      <div className="container">
        <SectionHeader 
          icon={<Wrench size={20} />}
          iconClassName="skills-icon"
          title="Skills &"
          titleSpan="Tools"
          subtitle="The technical arsenal I use to ensure software quality."
        />

        <div className="skills-categories">
          {SKILL_CATEGORIES.map((category, idx) => (
            <div key={idx} className="skill-category-card">
              <div className="skill-category-header">
                {category.icon}
                <h3>{category.title}</h3>
              </div>
              <div className="skills-grid-mini">
                {category.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="skill-item-mini">
                    <img src={skill.icon} alt={skill.name} className="skill-icon-mini" />
                    <div className="skill-info-mini">
                      <p className="skill-name-mini">{skill.name}</p>
                      <span className={`skill-level-mini level-${skill.level.toLowerCase().split(' ')[0]}`}>
                        {skill.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsTools;
