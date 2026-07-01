import React from "react";
import {
  Monitor,
  Smartphone,
  Laptop,
  ShieldCheck,
  Globe,
  Apple,
  Smartphone as PhoneIcon,
} from "lucide-react";
import SectionHeader from "../common/SectionHeader";

const COMPATIBILITY_DATA = [
  {
    category: "Browsers",
    items: [
      {
        name: "Google Chrome",
        type: "Desktop",
        icon: <Globe size={20} />,
        status: "Expert",
      },
      {
        name: "Mozilla Firefox",
        type: "Desktop",
        icon: <Globe size={20} />,
        status: "Verified",
      },
      {
        name: "Apple Safari",
        type: "Desktop",
        icon: <Globe size={20} />,
        status: "Verified",
      },
      {
        name: "Microsoft Edge",
        type: "Desktop",
        icon: <Globe size={20} />,
        status: "Verified",
      },
    ],
  },
  {
    category: "Mobile Devices",
    items: [
      {
        name: "iOS (iPhone/iPad)",
        type: "Mobile",
        icon: <Apple size={20} />,
        status: "Expert",
      },
      {
        name: "Android Devices",
        type: "Mobile",
        icon: <PhoneIcon size={20} />,
        status: "Expert",
      },
      {
        name: "Mobile Browsers",
        type: "Mobile",
        icon: <Smartphone size={20} />,
        status: "Expert",
      },
      {
        name: "Tablet Viewport",
        type: "Tablet",
        icon: <Laptop size={20} />,
        status: "Verified",
      },
    ],
  },
  {
    category: "Operating Systems",
    items: [
      {
        name: "Windows 10/11",
        type: "OS",
        icon: <Monitor size={20} />,
        status: "Verified",
      },
      {
        name: "macOS",
        type: "OS",
        icon: <Apple size={20} />,
        status: "Verified",
      },
    ],
  },
];

const CompatibilityMatrix: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <SectionHeader
          icon={<ShieldCheck size={20} />}
          iconClassName="matrix-icon"
          title="Testing"
          titleSpan="Matrix"
          subtitle="A comprehensive overview of environments and platforms I support."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          {COMPATIBILITY_DATA.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white m-0 pl-3 border-l-4 border-blue-500">
                {group.category}
              </h3>
              <div className="flex flex-col gap-4">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl transition-all duration-300 hover:-translate-y-1 lg:hover:translate-x-2.5 lg:hover:translate-y-0 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/50 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</span>
                        <div className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${item.status.toLowerCase() === 'expert'
                          ? 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                          }`}>
                          <ShieldCheck size={12} />
                          {item.status}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{item.type}</span>
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

export default CompatibilityMatrix;
