import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import HomeHero from '../components/HomeHero';
import HomeProducts from '../components/HomeProducts';
import HomeJourney from '../components/HomeJourney';
import HomeLibrary from '../components/HomeLibrary';
import HomeSimulatorProjects from '../components/HomeSimulatorProjects';
import HomePricing from '../components/HomePricing';
import HomeFaq from '../components/HomeFaq';
import HomeFinalCta from '../components/HomeFinalCta';

// General Mentor.QA landing ("/"): introduces every product — QA Course,
// QA Simulator, QA Library, Portfolio QA, Mentoring — and routes visitors into each one.
// The mentoring sales page lives at /mentoring.
const HomePage: React.FC = () => {
  const { hash } = useLocation();

  // App's ScrollToTop skips hashed URLs, so in-page anchors (/#program) scroll here.
  // The old "#produk" anchor (before the Produk → Program rename) still resolves.
  // Sections above the target load data late and push it down, so keep
  // re-aligning while the page grows, until the visitor takes over (or 5s).
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1) === 'produk' ? 'program' : hash.slice(1);
    const align = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    const observer = new ResizeObserver(align);
    const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    let start = 0;
    let lastY = window.scrollY;
    const stop = () => {
      window.clearTimeout(start);
      observer.disconnect();
      inputs.forEach((type) => window.removeEventListener(type, stop));
      window.removeEventListener('scroll', onScroll);
    };
    // Dragging the scrollbar fires no input event: scrolling away from the
    // target (never done by our own smooth scroll) means the visitor did it.
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const el = document.getElementById(id);
      if (!el) return;
      const offset = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
      if ((dy < -2 && offset > 2) || (dy > 2 && offset < -2)) stop();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    start = window.setTimeout(() => {
      if (pageRef.current) observer.observe(pageRef.current); // fires once right away
    }, 100);
    const end = window.setTimeout(stop, 5000);
    inputs.forEach((type) => window.addEventListener(type, stop, { passive: true }));
    return () => {
      window.clearTimeout(end);
      stop();
    };
  }, [hash]);

  return (
    <div ref={pageRef} className="w-full bg-ld-canvas">
      <HomeHero />
      {/* overview of the 4-step path first, then each product in depth */}
      <HomeJourney />
      <HomeProducts />
      <HomeSimulatorProjects />
      <HomePricing />
      <HomeLibrary />
      <HomeFaq />
      <HomeFinalCta />
    </div>
  );
};

export default HomePage;
