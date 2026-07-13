import React from 'react';
import { Linkedin, Instagram, Github, Mail, ArrowUpRight, MessageCircle } from 'lucide-react';

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
    <section id="contact" className="py-12 md:py-20 bg-ld-canvas overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-ld-lilac text-ld-violet">
            <MessageCircle size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Get in <span className="text-ld-violet">Touch</span>
            </h2>
            <p className="text-sm text-ld-slate">Contact me or follow my social media</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {CONTACT_ITEMS.map((item, index) => (
            <a
              key={index}
              href={item.url}
              className="flex justify-between items-center bg-ld-canvas border border-ld-ash p-6 rounded-xl no-underline transition-colors hover:border-ld-violet hover:shadow-ld-subtle-2 group"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex gap-6 items-center">
                <div className="w-[50px] h-[50px] bg-ld-violet text-white rounded-lg flex items-center justify-center text-xl">
                  {item.name === 'LinkedIn' && <Linkedin size={24} />}
                  {item.name === 'Instagram' && <Instagram size={24} />}
                  {item.name === 'GitHub' && <Github size={24} />}
                  {item.name === 'E-mail' && <Mail size={24} />}
                </div>
                <div className="text-left">
                  <h4 className="text-base font-semibold text-ld-graphite mb-1 m-0">{item.name}</h4>
                  <p className="text-xs text-ld-fog m-0">{item.label}</p>
                </div>
              </div>
              <div className="text-ld-fog transition-colors group-hover:text-ld-violet">
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
