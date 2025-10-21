import React, { useEffect, useRef } from 'react';
import './ParallaxDivider.css';

const ParallaxDivider = () => {
  const dividerRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    const handleParallax = () => {
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      
      if (dividerRef.current && contentRef.current) {
        const rect = dividerRef.current.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementHeight = rect.height;
        
        // Only apply parallax when element is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const speed = 0.3;
          const yPos = (scrolled - elementTop) * speed;
          
          // Background parallax
          dividerRef.current.style.backgroundPosition = `center ${yPos}px`;
          
          // Content parallax (slower)
          const contentSpeed = 0.1;
          const contentYPos = (scrolled - elementTop) * contentSpeed;
          contentRef.current.style.transform = `translateY(${contentYPos}px)`;
          
          // Scale effect based on scroll position
          const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
          const scale = 0.8 + (progress * 0.2);
          contentRef.current.style.transform += ` scale(${scale})`;
          
          // Opacity fade in/out
          const opacity = Math.max(0, Math.min(1, progress * 2 - 0.5));
          contentRef.current.style.opacity = opacity;
        }
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledParallax = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledParallax);
    handleParallax(); // Initial call
    
    return () => window.removeEventListener('scroll', throttledParallax);
  }, []);

  return (
    <section className="parallax-divider" ref={dividerRef}>
      <div className="parallax-overlay"></div>
      <div className="parallax-content" ref={contentRef}>
        <h2>Attraction Without Limits</h2>
        <div className="parallax-accent"></div>
      </div>
    </section>
  );
};

export default ParallaxDivider;
