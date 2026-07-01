import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

import PortfolioNavbar from './components/portfolio/Layout/Navbar';
import PortfolioFooter from './components/portfolio/Layout/Footer';
import MentoringNavbar from './components/portfolio/Layout/MentoringNavbar';
import MentoringFooter from './components/portfolio/Layout/MentoringFooter';
import PortfolioHome from './pages/portfolio/Home';
import PortfolioAbout from './pages/portfolio/About';
import PortfolioProjects from './pages/portfolio/Projects';
import PortfolioCertifications from './pages/portfolio/Certifications';
import PortfolioBookingPage from './pages/portfolio/Mentoring/BookingPage';
import MentoringPage from './pages/portfolio/Mentoring/MentoringPage';

interface LayoutProps {
  children: React.ReactNode;
}

const PortfolioLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      <PortfolioNavbar />
      <main className="flex-grow pt-[70px]">
        {children}
      </main>
      <PortfolioFooter />
    </div>
  );
};

const MentoringLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      <MentoringNavbar />
      <main className="flex-grow pt-[70px]">
        {children}
      </main>
      <MentoringFooter />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MentoringLayout><MentoringPage /></MentoringLayout>} />
          <Route path="/portfolio" element={<PortfolioLayout><PortfolioHome /></PortfolioLayout>} />
          <Route path="/portfolio/about" element={<PortfolioLayout><PortfolioAbout /></PortfolioLayout>} />
          <Route path="/portfolio/projects" element={<PortfolioLayout><PortfolioProjects /></PortfolioLayout>} />
          <Route path="/portfolio/certifications" element={<PortfolioLayout><PortfolioCertifications /></PortfolioLayout>} />
          <Route path="/portfolio/mentoring/booking" element={<MentoringLayout><PortfolioBookingPage /></MentoringLayout>} />
          <Route path="/mentoring" element={<MentoringLayout><MentoringPage /></MentoringLayout>} />
          <Route path="/mentoring/booking" element={<MentoringLayout><PortfolioBookingPage /></MentoringLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
