import React from 'react';
import { Linkedin, Instagram, Github, Mail, ArrowUpRight, MessageCircle } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const CONTACT_ITEMS = [
  {
    name: 'LinkedIn',
    label: 'Professional Network',
    url: 'https://linkedin.com/in/agus-budiman'
  },
  {
    name: 'Instagram',
    label: '@agus.budimaan',
    url: 'https://www.instagram.com/agus.budimaan/'
  },
  {
    name: 'GitHub',
    label: 'Projects & Code',
    url: 'https://github.com/agusbudbudi'
  },
  {
    name: 'E-mail',
    label: 'agus.buddiman@gmail.com',
    url: 'mailto:agus.buddiman@gmail.com'
  }
];

const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-12 md:py-20 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <SectionHeader
          icon={<MessageCircle size={20} />}
          iconClassName="contact-icon-bg"
          title="Get in"
          titleSpan="Touch"
          subtitle="Contact me or follow my social media"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {CONTACT_ITEMS.map((item, index) => (
            <a
              key={index}
              href={item.url}
              className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-[20px] decoration-none transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/35 hover:border-blue-500 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex gap-6 items-center">
                <div className="w-[50px] h-[50px] bg-blue-500 text-white rounded-[14px] flex items-center justify-center text-xl shadow-md shadow-blue-500/15">
                  {item.name === 'LinkedIn' && <Linkedin size={24} />}
                  {item.name === 'Instagram' && <Instagram size={24} />}
                  {item.name === 'GitHub' && <Github size={24} />}
                  {item.name === 'E-mail' && <Mail size={24} />}
                </div>
                <div className="text-left">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 m-0">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-405 m-0">{item.label}</p>
                </div>
              </div>
              <div className="text-slate-400 dark:text-slate-500 transition-all duration-350 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight size={20} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
