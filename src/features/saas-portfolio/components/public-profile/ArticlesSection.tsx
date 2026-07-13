import React from 'react';
import { Newspaper } from 'lucide-react';
import type { ArticleEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';
import ArticleSlider from './ArticleSlider';

const ArticlesSection: React.FC<{ articles: ArticleEntry[] }> = ({ articles }) => (
  <section className="mt-14">
    <SectionHeading
      icon={<Newspaper size={20} />}
      iconClassName="bg-amber-500/10 text-amber-500"
      title="Article"
      subtitle="Tulisan dan publikasi yang pernah dibuat."
    />
    <ArticleSlider articles={articles} />
  </section>
);

export default ArticlesSection;
