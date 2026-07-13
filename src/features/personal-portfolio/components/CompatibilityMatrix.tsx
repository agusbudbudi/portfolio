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
    <section className="py-12 md:py-20 bg-ld-canvas overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-ld-lilac text-ld-violet">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Testing <span className="text-ld-violet">Matrix</span>
            </h2>
            <p className="text-sm text-ld-slate">A comprehensive overview of environments and platforms I support.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
          {COMPATIBILITY_DATA.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-6">
              <h3 className="text-lg font-semibold text-ld-graphite m-0 pl-3 border-l-4 border-ld-violet">
                {group.category}
              </h3>
              <div className="flex flex-col gap-4">
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center gap-4 p-5 bg-ld-canvas border border-ld-ash rounded-xl transition-colors hover:border-ld-violet hover:shadow-ld-subtle-2"
                  >
                    <div className="w-12 h-12 bg-ld-cloud text-ld-violet rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <span className="font-semibold text-ld-graphite text-sm">{item.name}</span>
                        <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${item.status.toLowerCase() === 'expert'
                          ? 'bg-indigo-500/10 text-indigo-500'
                          : 'bg-emerald-500/10 text-emerald-600'
                          }`}>
                          <ShieldCheck size={12} />
                          {item.status}
                        </div>
                      </div>
                      <span className="text-xs text-ld-fog">{item.type}</span>
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
