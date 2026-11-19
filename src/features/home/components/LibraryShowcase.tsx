import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Bookmark, Clock, Search } from 'lucide-react';
import { useQaLibraryArticles } from '../../qa-library/hooks/useQaLibraryArticles';
import { useQaLibraryCategories } from '../../qa-library/hooks/useQaLibraryCategories';

// Home "QA Library" row art, same grammar as SimulatorShowcase: three stacked,
// non-overlapping pieces (search left → featured article full width →
// reading list right). Uses real articles and
// categories when the API answers; neutral skeleton bars otherwise.
// Plays once on mount (mounted when scrolled into view). Decorative only.

const EASE = [0.4, 0, 0.2, 1] as const;
const SHADOW = 'shadow-[0_18px_40px_-12px_rgba(39,40,53,0.2)]';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});
const grow = (delay: number, to: string): Variants => ({
  hidden: { width: '0%' },
  show: { width: to, transition: { duration: 0.9, ease: EASE, delay } },
});

const Bar: React.FC<{ w: string; className?: string }> = ({ w, className = '' }) => (
  <span className={`block h-2 rounded-full bg-ld-frost ${className}`} style={{ width: w }} />
);

const LibraryShowcase: React.FC = () => {
  const reduce = !!useReducedMotion();
  const { articles } = useQaLibraryArticles();
  const { categories } = useQaLibraryCategories();
  const label = (id?: string) => categories.find((c) => c.id === id)?.label ?? 'QA Library';
  const featured = articles[0];
  const saved = articles.slice(1, 3);
  const chips = categories.length ? categories.slice(0, 4).map((c) => c.label) : ['Fundamental', 'Test Planning', 'Automation', 'AI in QA'];

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[520px] mx-auto flex flex-col gap-7 py-6 select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      {/* search + categories — left */}
      <motion.div variants={rise(0.05)} className={`relative z-[1] w-[78%] rounded-xl bg-white border border-ld-frost p-3 ${SHADOW}`}>
        <div className="flex items-center gap-2 rounded-lg bg-ld-cloud border border-ld-frost px-2.5 py-2">
          <Search size={13} className="text-ld-fog shrink-0" />
          <span className="text-[11px] text-ld-graphite">boundary value analysis</span>
          <motion.span
            className="w-px h-3.5 bg-ld-violet"
            animate={reduce ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((c, i) => (
            // Own initial/animate (not inherited variants): the chip list is
            // swapped once categories load, and chips mounted after the parent
            // finished animating would otherwise stay stuck at "hidden".
            <motion.span
              key={c}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.35 + i * 0.1 }}
              className={`px-2 py-1 rounded-md text-[9.5px] font-medium ${i === 0 ? 'bg-ld-violet text-white' : 'bg-ld-cloud border border-ld-frost text-ld-slate'}`}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </motion.div>

      {/* featured article — full width */}
      <motion.div variants={rise(0.45, 26)} className={`relative z-[1] w-full rounded-xl bg-white border border-ld-frost overflow-hidden flex items-center gap-3.5 p-3 ${SHADOW}`}>
        {/* 16:9 box matches the article thumbnails, so nothing gets cropped */}
        <div className="w-[44%] aspect-video shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-50 to-ld-lilac">
          {featured?.thumbnailUrl && <img src={featured.thumbnailUrl} alt="" loading="lazy" className="w-full h-full object-contain" />}
        </div>
        <div className="flex-1 min-w-0">
          <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8.5px] font-semibold uppercase tracking-widest">
            {label(featured?.categoryId)}
          </span>
          {featured ? (
            <p className="m-0 mt-1.5 text-[12px] font-semibold text-ld-onyx leading-snug line-clamp-2">{featured.title}</p>
          ) : (
            <span className="block mt-2 space-y-1.5"><Bar w="92%" /><Bar w="64%" /></span>
          )}
          <div className="mt-2 flex items-center gap-2 text-[9px] text-ld-slate">
            {featured?.authorAvatarUrl ? (
              <img src={featured.authorAvatarUrl} alt="" className="w-4 h-4 rounded-full object-cover object-top" />
            ) : (
              <span className="w-4 h-4 rounded-full bg-ld-frost" />
            )}
            <span className="truncate">{featured?.authorName ?? 'Praktisi QA'}</span>
            <span className="ml-auto inline-flex items-center gap-1 shrink-0"><Clock size={9} /> {featured?.readingTimeMinutes ?? 6} mnt</span>
          </div>
          <div className="mt-2.5">
            <div className="flex justify-between text-[8.5px] text-ld-fog"><span>Progress baca</span><span>65%</span></div>
            <div className="mt-1 h-1.5 rounded-full bg-ld-frost overflow-hidden">
              <motion.div variants={grow(0.9, '65%')} className="h-full rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* reading list — right */}
      <motion.div variants={pop(1.4)} className={`relative z-[1] w-[66%] self-end origin-top-right rounded-xl bg-white border border-ld-frost p-3 ${SHADOW}`}>
        <p className="m-0 flex items-center gap-1.5 text-[10px] font-semibold text-ld-onyx">
          <Bookmark size={11} className="text-ld-violet" fill="currentColor" /> Disimpan untuk dibaca
        </p>
        <ul className="m-0 mt-2 p-0 list-none space-y-1.5">
          {[0, 1].map((i) => {
            const a = saved[i];
            return (
              <li key={i} className="flex items-center gap-2 rounded-md bg-ld-cloud px-2 py-1.5">
                <span className="w-10 aspect-video rounded bg-gradient-to-br from-ld-lilac to-emerald-50 overflow-hidden shrink-0">
                  {a?.thumbnailUrl && <img src={a.thumbnailUrl} alt="" loading="lazy" className="w-full h-full object-contain" />}
                </span>
                {a ? <span className="text-[9.5px] text-ld-graphite truncate">{a.title}</span> : <Bar w="70%" />}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default LibraryShowcase;
