import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, User } from 'lucide-react';
import type { QaLibraryArticleSummary } from '../../../types/qaLibrary';

interface QaLibraryArticleCardProps {
  article: QaLibraryArticleSummary;
  categoryLabel: string;
}

const QaLibraryArticleCard: React.FC<QaLibraryArticleCardProps> = ({ article, categoryLabel }) => (
  <Link
    to={`/qa-library/${article.slug}`}
    className="group flex flex-col rounded-xl border border-ld-frost bg-white overflow-hidden no-underline hover:border-ld-violet hover:shadow-[0_8px_24px_rgba(30,27,75,0.08)] transition-all"
  >
    <div className="aspect-video w-full bg-ld-cloud overflow-hidden">
      {article.thumbnailUrl ? (
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ld-fog text-xs">Tanpa thumbnail</div>
      )}
    </div>
    <div className="flex flex-col flex-1 p-4">
      <span className="inline-block w-fit px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet mb-2">
        {categoryLabel}
      </span>
      <h3 className="font-ld-display font-semibold text-base text-ld-onyx leading-snug mb-2 line-clamp-2">
        {article.title}
      </h3>
      <p className="text-sm text-ld-slate leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>

      <div className="flex items-center gap-2 mb-3">
        {article.authorAvatarUrl ? (
          <img src={article.authorAvatarUrl} alt="" className="w-5 h-5 rounded-full object-cover object-top border border-ld-frost shrink-0" />
        ) : (
          <span className="w-5 h-5 rounded-full bg-ld-cloud border border-ld-frost shrink-0 flex items-center justify-center text-ld-fog">
            <User size={11} />
          </span>
        )}
        <span className="text-xs text-ld-slate truncate">{article.authorName}</span>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-ld-fog">
          <Clock size={13} />
          <span>{article.readingTimeMinutes} menit baca</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-ld-violet">
          Read More
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  </Link>
);

export default QaLibraryArticleCard;
