import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HomeHero from '../components/HomeHero';
import HomeProducts from '../components/HomeProducts';
import HomeJourney from '../components/HomeJourney';
import HomeLibrary from '../components/HomeLibrary';
import HomeSimulatorProjects from '../components/HomeSimulatorProjects';
import HomePricing from '../components/HomePricing';
import HomeFaq from '../components/HomeFaq';
import HomeFinalCta from '../components/HomeFinalCta';

// General Mentor.QA landing ("/"): introduces every product — QA Simulator,
// QA Library, Portfolio QA, Mentoring — and routes visitors into each one.
// The mentoring sales page lives at /mentoring.
const HomePage: React.FC = () => {
  const { hash } = useLocation();

  // App's ScrollToTop skips hashed URLs, so in-page anchors (/#program) scroll here.
  // The old "#produk" anchor (before the Produk → Program rename) still resolves.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1) === 'produk' ? 'program' : hash.slice(1);
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="w-full bg-ld-canvas">
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
