import React, { useState } from 'react';
import { Award, Newspaper, ArrowUpRight } from 'lucide-react';
import certData from '../data/certifications.json';
import articleData from '../data/articles.json';
import SectionHeader from '../components/common/SectionHeader';
import Badge from '../components/common/Badge';
import './Certifications.css';

const Certifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certs' | 'articles'>('certs');

  return (
    <div className="certifications-page container">
      <SectionHeader 
        icon={<Award size={20} />}
        iconClassName="cert-icon"
        title="Article &"
        titleSpan="Certifications"
        subtitle="Explore my latest articles and updates"
      />

      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'certs' ? 'active' : ''}`}
          onClick={() => setActiveTab('certs')}
        >
          <Award size={20} /> Certification
        </button>
        <button 
          className={`tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveTab('articles')}
        >
          <Newspaper size={20} /> Article
        </button>
      </div>

      {activeTab === 'certs' && (
        <div className="certs-grid">
          {certData.map((cert, index) => (
            <div key={index} className="cert-card">
              <div className="cert-img-container">
                <img src={cert.image} alt={cert.title} />
                <Badge className="year-badge">{cert.year}</Badge>
              </div>
              <div className="cert-content">
                <h4 className="cert-title">{cert.title}</h4>
                <p className="cert-issuer">{cert.issuer}</p>
                <a href={cert.verifyLink} target="_blank" rel="noopener noreferrer" className="cert-verify-link">
                  <span>Verify Credential</span>
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'articles' && (
        <div className="articles-grid">
          {articleData.map((article, index) => (
            <div key={index} className="article-item">
              <iframe 
                src={article.url} 
                className="article-iframe"
                frameBorder="0" 
                allowFullScreen 
                title={article.title}
              ></iframe>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certifications;
