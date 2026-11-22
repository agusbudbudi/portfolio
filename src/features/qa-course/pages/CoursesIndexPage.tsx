import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '../../../components/common/Seo';
import type { QaCourseSummary } from '../../../types/qaCourse';
import { fetchCourses } from '../lib/courseApi';
import CourseHeroSection from '../components/landing/CourseHeroSection';
import {
  CourseCompareSection, CourseFaqSection, CourseFinalCtaSection, CourseHowItWorksSection, CourseListSection,
} from '../components/landing/CourseSections';
import { FAQ_ITEMS } from '../components/landing/content';
import { pageSeo, SITE_URL } from '../../../lib/pageSeo';

const SEO = pageSeo('/courses');

type ListState = { courses: QaCourseSummary[] | null; error: string | null };

// Landing page for QA Course: same section rhythm as /qa-simulator (hero,
// blue list band, how it works, FAQ, dark CTA) so the two products feel
// like siblings.
const CoursesIndexPage: React.FC = () => {
  const { hash } = useLocation();
  const [list, setList] = useState<ListState>({ courses: null, error: null });

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((courses) => { if (!cancelled) setList({ courses, error: null }); })
      .catch((e: unknown) => { if (!cancelled) setList({ courses: null, error: e instanceof Error ? e.message : 'Gagal memuat course.' }); });
    return () => { cancelled = true; };
  }, []);

  // Deep links like /courses#course or /courses#faq.
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 100);
    return () => window.clearTimeout(t);
  }, [hash]);

  // One course: send "Mulai" straight to it; otherwise to the list.
  const first = list.courses?.[0];
  const startHref = list.courses?.length === 1 && first ? `/courses/${first.slug}` : '#course';

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'QA Course',
      itemListElement: (list.courses ?? []).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Course',
          name: c.title,
          description: c.description,
          url: `${SITE_URL}/courses/${c.slug}`,
          inLanguage: 'id',
          isAccessibleForFree: true,
          provider: { '@type': 'Organization', name: 'Mentor.QA', url: SITE_URL },
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <div className="w-full bg-ld-canvas font-ld-sans">
      <Seo {...SEO} jsonLd={jsonLd} />
      <CourseHeroSection courses={list.courses} />
      <CourseListSection courses={list.courses} error={list.error} />
      <CourseHowItWorksSection />
      <CourseCompareSection />
      <CourseFaqSection />
      <CourseFinalCtaSection startHref={startHref} />
    </div>
  );
};

export default CoursesIndexPage;
