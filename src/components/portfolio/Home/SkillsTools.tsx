import React from 'react';
import { FlaskConical, Database, ShieldCheck, Cpu, Wrench } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const SKILL_CATEGORIES = [
  {
    title: 'Automation & Core',
    icon: <FlaskConical size={22} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />,
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
    icon: <Database size={22} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />,
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
    icon: <ShieldCheck size={22} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />,
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
    icon: <Cpu size={22} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />,
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
  const getLevelClasses = (level: string) => {
    switch (level.toLowerCase()) {
      case 'advanced':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'intermediate':
        return 'bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400';
      case 'beginner':
      default:
        return 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400';
    }
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50 dark:bg-slate-900/30 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <SectionHeader
          icon={<Wrench size={20} />}
          iconClassName="skills-icon"
          title="Skills &"
          titleSpan="Tools"
          subtitle="The technical arsenal I use to ensure software quality."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-16">
          {SKILL_CATEGORIES.map((category, idx) => (
            <div key={idx} className="p-4 rounded-[24px]">
              <div className="flex items-center gap-3 mb-8">
                {category.icon}
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white m-0">{category.title}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {category.skills.map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-8 pb-5 rounded-[20px] transition-all duration-400 ease-spring relative overflow-hidden group hover:-translate-y-2 hover:scale-[1.03] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30"
                  >
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="max-w-[80px] h-10 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow"
                    />
                    <div className="flex flex-col items-center gap-2 text-center">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white m-0 leading-tight">{skill.name}</p>
                      <span className={`absolute top-0 left-0 text-[10px] px-2.5 py-1 rounded-br-xl font-bold uppercase tracking-wider ${getLevelClasses(skill.level)}`}>
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
