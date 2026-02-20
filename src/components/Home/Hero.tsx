import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Available for new opportunities
</div>
            <h1>Hi, I'm Agus 👋🏻</h1>
            <h2 className="hero-job-title">Quality Assurance Engineer</h2>
            <p className="hero-summary">
              With 6+ years experience in automation & manual testing. 
              Delivering high-quality software through meticulous analysis and modern testing frameworks.
            </p>

            <div className="hero-highlight-skills">
              <Badge>Manual Testing</Badge>
              <Badge>Automation</Badge>
              <Badge>API Testing</Badge>
              <Badge>Cypress</Badge>
              <Badge>Appium</Badge>
            </div>

            <div className="hero-cta">
              <Button to="/projects" variant="primary">
                Lihat Portfolio <ArrowRight size={20} />
              </Button>
              <Button href="/#contact" variant="secondary">
                Hubungi Saya <Mail size={20} />
              </Button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="id-card-wrapper">
              <div className="id-card">
                <div className="id-card-shine"></div>
                
                <div className="id-card-top">
                  <div className="id-card-header">
                    <img src="/img/diricare-logo.png" alt="Diricare" className="id-card-logo" />
                    <img src="/img/qr-code.png" alt="QR Code" className="id-card-qr-img" />
                  </div>
                  <div className="id-card-photo">
                    <img src="/img/profile/hero-agus.png" alt="Agus Budiman" />
                  </div>
                </div>

                <div className="id-card-bottom">
                  <div className="id-card-info">
                    <h3 className="id-card-name">Agus Budiman</h3>
                    <p className="id-card-role">Professional QA Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
