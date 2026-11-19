import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HomeHero from '../components/HomeHero';
import HomeProducts from '../components/HomeProducts';
import HomeJourney from '../components/HomeJourney';
import HomeLibrary from '../components/HomeLibrary';
import HomeFaq from '../components/HomeFaq';
import HomeFinalCta from '../components/HomeFinalCta';

// General Mentor.QA landing ("/"): introduces every product — QA Simulator,
// QA Library, Portfolio QA, Mentoring — and routes visitors into each one.
// The mentoring sales page lives at /mentoring.
const HomePage: React.FC = () => {
  const { hash } = useLocation();

  // App's ScrollToTop skips hashed URLs, so in-page anchors (/#produk) scroll here.
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 100);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="w-full bg-ld-canvas">
      <HomeHero />
      <HomeProducts />
      <HomeJourney />
      <HomeLibrary />
      <HomeFaq />
      <HomeFinalCta />
    </div>
  );
};

export default HomePage;
