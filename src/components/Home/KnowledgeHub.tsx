import React from 'react';
import { BookOpen, Calendar, ArrowRight, Tag } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import './KnowledgeHub.css';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    title: 'Shift-Left Testing: Why Start Early?',
    excerpt: 'Exploring the benefits of integrating testing into the early stages of the SDLC to catch bugs before they become expensive.',
    date: 'April 15, 2026',
    category: 'Strategy',
    readTime: '5 min read'
  },
  {
    id: 2,
    title: 'Writing Effective Bug Reports',
    excerpt: 'A comprehensive guide on what makes a bug report actionable, clear, and helpful for developers to fix issues faster.',
    date: 'March 28, 2026',
    category: 'Best Practices',
    readTime: '4 min read'
  },
  {
    id: 3,
    title: 'The Role of AI in Modern QA',
    excerpt: 'How AI-powered tools like TestGen are streamlining test case generation and improving automation coverage.',
    date: 'March 10, 2026',
    category: 'Automation',
    readTime: '6 min read'
  },
  {
    id: 4,
    title: 'Automation vs. Manual Testing',
    excerpt: 'Why manual testing remains critical even in an automated world, and how to strike the perfect balance for your team.',
    date: 'February 22, 2026',
    category: 'Methodology',
    readTime: '5 min read'
  }
];

const KnowledgeHub: React.FC = () => {
  return (
    <section className="knowledge-hub section">
      <div className="container">
        <SectionHeader 
          icon={<BookOpen size={20} />}
          iconClassName="knowledge-icon"
          title="QA Knowledge"
          titleSpan="Hub"
          subtitle="Sharing insights, best practices, and thoughts on the world of software quality."
        />

        <div className="articles-grid">
          {ARTICLES.map((article) => (
            <article key={article.id} className="article-card">
              <div className="article-content">
                <div className="article-meta">
                  <span className="article-category">
                    <Tag size={12} /> {article.category}
                  </span>
                  <span className="article-date">
                    <Calendar size={12} /> {article.date}
                  </span>
                </div>
                
                <h3 className="article-title">{article.title}</h3>
                <p className="article-excerpt">{article.excerpt}</p>
                
                <div className="article-footer">
                  <span className="read-time">{article.readTime}</span>
                  <button className="read-more-link">
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KnowledgeHub;
