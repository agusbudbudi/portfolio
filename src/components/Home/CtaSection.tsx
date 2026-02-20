import React from 'react';
import { Download, Linkedin } from 'lucide-react';
import Button from '../common/Button';
import './CtaSection.css';

const CtaSection: React.FC = () => {
  return (
    <section className="cta-home section">
      <div className="cta-glow"></div>
      <div className="container">
        <div className="cta-content">
          <div className="cta-header">
            <h2>Let's Work Together 🚀</h2>
          </div>
          <p className="cta-description">
            I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions. Let's build something exceptional together.
          </p>
          <div className="cta-actions">
            <Button href="/assets/CV_Agus_Budiman_QA_Engineer.pdf" variant="secondary">
              <Download size={20} /> Download CV
            </Button>
            <Button href="https://linkedin.com/in/agus-budiman" variant="primary">
              <Linkedin size={20} /> LinkedIn Connect
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
