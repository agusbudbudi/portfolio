import React, { useState } from 'react';
import { Quote, Linkedin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import endorsementData from '../../data/endorsements.json';
import SectionHeader from '../common/SectionHeader';
import './FeaturedEndorsements.css';

const FeaturedEndorsements: React.FC = () => {
  const [expandedEndorsement, setExpandedEndorsement] = useState<number | null>(null);

  // Show only top 2 endorsements
  const featuredEndorsements = endorsementData.slice(0, 2);

  const toggleEndorsement = (index: number) => {
    setExpandedEndorsement(expandedEndorsement === index ? null : index);
  };

  return (
    <section className="featured-endorsements section">
      <div className="container">
        <div className="section-header-row">
          <SectionHeader 
            icon={<Quote size={20} />}
            iconClassName="endorsement-icon"
            title="What Others"
            titleSpan="Say"
            subtitle="Testimonials from colleagues and leaders I've collaborated with."
          />
          <Link to="/about#endorsement" className="btn btn-outline view-all-btn">
            Lihat Semua <ArrowRight size={18} />
          </Link>
        </div>

        <div className="endorsement-grid">
          {featuredEndorsements.map((endorsement, index) => (
            <div key={index} className="endorsement-card">
              <div className="endorsement-header">
                <div className="endorsement-profile-wrapper">
                  <img src={endorsement.image} alt={endorsement.name} className="endorsement-img" />
                  <div className="endorsement-company-badge">
                    <img src={endorsement.logo} alt={endorsement.company} />
                  </div>
                </div>
                <div className="endorsement-author-info">
                  <div className="author-name-row">
                    <h3 className="author-name">{endorsement.name}</h3>
                    <a href={endorsement.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                      <Linkedin size={16} />
                    </a>
                  </div>
                  <p className="author-relation">{endorsement.relation}</p>
                </div>
              </div>

              <div className="endorsement-content-wrapper">
                <div className={`endorsement-text ${expandedEndorsement === index ? 'is-expanded' : ''}`}>
                  <p>{endorsement.content}</p>
                </div>
                {endorsement.content.length > 200 && (
                  <button className="read-more-btn" onClick={() => toggleEndorsement(index)}>
                    {expandedEndorsement === index ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEndorsements;
