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
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 relative overflow-hidden">
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
              className="bg-white dark:bg-slate-900 p-6 rounded-[20px] border border-slate-200 dark:border-slate-800/80 flex flex-col items-center text-center transition-all duration-400 ease-smooth relative z-10 hover:-translate-y-2 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 group"
              variants={itemVariants}
            >
              {/* background shine gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 -z-10"></div>

              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/25 text-blue-500 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20">
                {metric.icon}
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-[1.75rem] font-extrabold text-slate-900 dark:text-white mb-1 tracking-tight">{metric.value}</h3>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">{metric.label}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{metric.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MetricsSection;
