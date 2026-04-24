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
import "./CompatibilityMatrix.css";



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
    <section className="compatibility-matrix section">
      <div className="container">
        <SectionHeader
          icon={<ShieldCheck size={20} />}
          iconClassName="matrix-icon"
          title="Testing"
          titleSpan="Matrix"
          subtitle="A comprehensive overview of environments and platforms I support."
        />

        <div className="matrix-grid">
          {COMPATIBILITY_DATA.map((group, gIdx) => (
            <div key={gIdx} className="matrix-category">
              <h3 className="category-title">{group.category}</h3>
              <div className="category-items">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="matrix-card">
                    <div className="card-icon-main">{item.icon}</div>
                    <div className="card-info">
                      <div className="card-name-row">
                        <span className="platform-name">{item.name}</span>
                        <div
                          className={`status-badge ${item.status.toLowerCase()}`}
                        >
                          <ShieldCheck size={12} />
                          {item.status}
                        </div>
                      </div>
                      <span className="platform-type">{item.type}</span>
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
