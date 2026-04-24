import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CheckCircle, Zap, Bug, Clock } from "lucide-react";
import "./MetricsSection.css";

const MetricsSection: React.FC = () => {
  const metrics = [
    {
      icon: <CheckCircle size={24} />,
      value: "200+",
      label: "Automated Test Cases",
      description: "Robust scripts across Web, Mobile & API",
    },
    {
      icon: <Zap size={24} />,
      value: "80%",
      label: "Faster Testing Cycle",
      description: "Significantly reduced time-to-market",
    },
    {
      icon: <Bug size={24} />,
      value: "250+",
      label: "Bugs Identified",
      description: "Critical issues caught before production",
    },
    {
      icon: <Clock size={24} />,
      value: "6+ Yrs",
      label: "QA Experience",
      description: "Years of expertise in diverse domains",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="metrics-section section">
      <div className="container">
        <motion.div
          className="metrics-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              className="metric-card"
              variants={itemVariants}
            >
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-info">
                <h3 className="metric-value">{metric.value}</h3>
                <h4 className="metric-label">{metric.label}</h4>
                <p className="metric-description">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MetricsSection;
