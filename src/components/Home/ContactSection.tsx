import React from 'react';
import { Linkedin, Instagram, Github, Mail, ArrowUpRight, MessageCircle } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import './ContactSection.css';

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
    <section id="contact" className="contact-section section">
      <div className="container">
        <SectionHeader 
          icon={<MessageCircle size={20} />}
          iconClassName="contact-icon-bg"
          title="Get in"
          titleSpan="Touch"
          subtitle="Contact me or follow my social media"
        />

        <div className="contact-grid">
          {CONTACT_ITEMS.map((item, index) => (
            <a key={index} href={item.url} className="contact-item" target="_blank" rel="noopener noreferrer">
              <div className="contact-left">
                <div className="contact-icon">
                  {item.name === 'LinkedIn' && <Linkedin size={24} />}
                  {item.name === 'Instagram' && <Instagram size={24} />}
                  {item.name === 'GitHub' && <Github size={24} />}
                  {item.name === 'E-mail' && <Mail size={24} />}
                </div>
                <div className="contact-info">
                  <h4>{item.name}</h4>
                  <p>{item.label}</p>
                </div>
              </div>
              <div className="contact-right">
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
