import { useLocation } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <footer className={isHomePage ? 'footer-blue' : ''}>
      <div className="container">
        <p>
          &copy; {new Date().getFullYear()} | Crafted with <span className="footer-passion">⚡ Passion</span> by Agus Budiman |
          QA Engineer Portfolio
        </p>
      </div>
    </footer>
  );
};

export default Footer;
