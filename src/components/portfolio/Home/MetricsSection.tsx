import React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CheckCircle, Zap, Bug, Clock } from "lucide-react";

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
    <section className="py-12 md:py-20 bg-ld-canvas relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              className="bg-ld-canvas p-6 rounded-xl border border-ld-ash flex flex-col items-center text-center transition-colors relative z-10 hover:border-ld-violet hover:shadow-ld-subtle-2 group"
              variants={itemVariants}
            >
              <div className="w-12 h-12 bg-ld-lilac text-ld-violet rounded-lg flex items-center justify-center mb-4 transition-colors group-hover:bg-ld-violet group-hover:text-white">
                {metric.icon}
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-ld-display font-semibold text-[1.75rem] text-ld-graphite mb-1 tracking-tight">{metric.value}</h3>
                <h4 className="text-sm font-semibold text-ld-graphite mb-2">{metric.label}</h4>
                <p className="text-xs text-ld-slate leading-relaxed">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MetricsSection;
