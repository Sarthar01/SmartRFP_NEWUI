import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../style/NavBar.css';

interface NavBarProps {
  currentPage: string;
}

const NavBar: React.FC<NavBarProps> = ({ currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" style={{ outline: 'none' }}>
          <span className="logo-text">SmartRFP</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          <ul className="navbar-nav">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.href}
                  className={`nav-link ${currentPage === item.name.toLowerCase() ? 'active' : ''}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Login Button */}
        <div className="navbar-actions">
          <Link to="/login" className="login-btn">
            <span>Login</span>
            <div className="btn-glow"></div>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav">
          {navItems.map((item) => (
            <li key={item.name} className="mobile-nav-item">
              <Link
                to={item.href}
                className={`mobile-nav-link ${currentPage === item.name.toLowerCase() ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li className="mobile-nav-item">
            <Link 
              to="/login" 
              className="mobile-login-btn" 
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;