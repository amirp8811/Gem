import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const heroRef = useRef();
  const contentRef = useRef();
  const [navVisible, setNavVisible] = useState(true);
  const [navMinimized, setNavMinimized] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    // Enhanced parallax scrolling
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      const rate2 = scrolled * -0.3;
      const rate3 = scrolled * -0.8;
      const rate4 = scrolled * 0.2;

      // Auto-hide navigation based on scroll position
      if (scrolled > 200) {
        setNavVisible(false);
        setNavMinimized(true);
      } else if (scrolled > 100) {
        setNavVisible(true);
        setNavMinimized(true);
      } else {
        setNavVisible(true);
        setNavMinimized(false);
      }

      // Parallax for different elements
      if (contentRef.current) {
        contentRef.current.style.transform = `translateY(${rate}px)`;
      }

      // Background parallax
      if (heroRef.current) {
        heroRef.current.style.backgroundPosition = `center ${rate4}px`;
      }

      // Fade out effect as user scrolls
      const opacity = Math.max(0, 1 - scrolled / window.innerHeight);
      if (heroRef.current) {
        heroRef.current.style.opacity = opacity;
      }
    };

    // Show navigation on mouse movement near top
    const handleMouseMove = (e) => {
      if (e.clientY < 100 && !navVisible) {
        setNavVisible(true);
        setNavMinimized(false);
        
        // Auto-hide after 3 seconds of inactivity
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          setNavMinimized(true);
        }, 3000);
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleParallax);

    // Initial call
    handleParallax();

    return () => {
      window.removeEventListener('scroll', handleParallax);
    };
  }, []);

  return (
    <section id="home" className="hero-new" ref={heroRef}>
      {/* Water Video Background */}
      <div className="water-background">
        <video
          className="water-video"
          src="/water.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>

      {/* Clean Hero Section - No decorative elements */}

      <nav className={`hero-nav ${!navVisible ? 'hidden' : ''} ${navMinimized ? 'minimized' : ''}`}>
        <div className="hero-nav">
        <div className="nav-brand">
        </div>
        <div className="nav-links">
          <Link to="/shop">Collections</Link>
          <Link to="/about">About us</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <button className="menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="hero-content-new" ref={contentRef}>
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="title-main">Gravity</span>
            <span className="title-registered">®</span>
          </h1>
          <h2 className="hero-subtitle">
            Personalised
            <br />
            Jewellery
          </h2>
          <p className="hero-description">
            More elegance, luxury and timeless beauty!
          </p>

          <div className="hero-actions">
            <Link to="/shop" className="btn-primary">All Collections</Link>
            <Link to="/about" className="btn-secondary">Our Story</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
