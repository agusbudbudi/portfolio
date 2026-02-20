import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <header className={isMenuOpen ? 'menu-open' : ''}>
      <nav className="container">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-container">
            <img src="/img/profile/logo-portfolio.png" alt="Logo" className="logo-img" />
            <span className="nav-status-dot"></span>
          </div>
          Agus.<span>QA</span>
        </Link>

        <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

        <div className="nav-wrapper">
          <ul className={`nav-center ${isMenuOpen ? 'mobile-active' : ''}`}>
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                About & Experience
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                Projects
              </NavLink>
            </li>
            <li>
              <NavLink to="/certifications" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
                Certifications
              </NavLink>
            </li>
          </ul>

          <div className="nav-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
