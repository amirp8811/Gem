import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link to="/about">About</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/contact">Contact</Link>
        <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Gravity. All rights reserved. • Feel the attraction.</p>
      </div>
    </footer>
  );
};

export default Footer;
