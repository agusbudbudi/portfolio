import React from 'react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import CourseJourneyIllustration from '../CourseJourneyIllustration';

// ARCHIVED (2026-11-23): the original /courses/:slug hero, replaced by the
// photo hero in CourseDetailPage. Not rendered anywhere; kept so it can be
// restored. To restore: in CourseDetailPage, render
// <CourseDetailHeroLegacy>{heroCopy}</CourseDetailHeroLegacy> in place of the
// photo hero block.
//
// Layout: lilac gradient band, hero copy left (children), the course journey
// illustration right with a pixel mosaic behind its top-right corner (same
// composition as the QA Simulator / Mentoring hero art).
const CourseDetailHeroLegacy: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-ld-lilac via-ld-cloud to-white">
    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-8 md:pb-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
      <div className="lg:col-span-7 min-w-0">
        {children}
      </div>
      <div className="lg:col-span-5 relative pt-6 lg:pt-4">
        <PixelMosaic
          variant="blue"
          className="!hidden sm:!grid absolute -top-2 -right-2 lg:-right-8"
          style={{ width: 'min(62%, 280px)' }}
        />
        <div className="relative">
          <CourseJourneyIllustration />
        </div>
      </div>
    </div>
  </div>
);

export default CourseDetailHeroLegacy;
