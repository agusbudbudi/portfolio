import React from 'react';
import { BookOpen, Calendar, ArrowRight, Tag } from 'lucide-react';

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
    <section className="py-12 md:py-20 bg-ld-cloud overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-ld-lilac text-ld-violet">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              QA Knowledge <span className="text-ld-violet">Hub</span>
            </h2>
            <p className="text-sm text-ld-slate">Sharing insights, best practices, and thoughts on the world of software quality.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-ld-canvas rounded-xl overflow-hidden border border-ld-ash transition-colors hover:border-ld-violet hover:shadow-ld-subtle-2 flex flex-col"
            >
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4 text-[10px] font-semibold">
                  <span className="flex items-center gap-1.5 text-ld-violet uppercase tracking-wider">
                    <Tag size={10} /> {article.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-ld-fog uppercase tracking-wider">
                    <Calendar size={10} /> {article.date}
                  </span>
                </div>

                <h3 className="font-ld-display font-semibold text-lg text-ld-graphite mb-3 leading-snug">{article.title}</h3>
                <p className="text-sm text-ld-slate leading-relaxed mb-6 flex-grow">{article.excerpt}</p>

                <div className="flex justify-between items-center pt-5 border-t border-ld-ash mt-auto">
                  <span className="text-xs text-ld-fog font-medium">{article.readTime}</span>
                  <button className="flex items-center gap-1.5 text-ld-violet hover:gap-2.5 transition-all duration-200 font-semibold bg-transparent border-none cursor-pointer p-0 text-sm">
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
