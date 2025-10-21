import React, { useEffect, useState, useRef } from 'react';
import './About.css';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const aboutRef = useRef();
  const contentRef = useRef();
  const imageRef = useRef();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    }, observerOptions);

    // Parallax scroll effect
    const handleParallax = () => {
      if (aboutRef.current && contentRef.current && imageRef.current) {
        const rect = aboutRef.current.getBoundingClientRect();
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Only apply parallax when element is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
          
          // Subtle content parallax
          const contentOffset = (progress - 0.5) * 50;
          contentRef.current.style.transform = `translateY(${contentOffset}px)`;
          
          // Image parallax (opposite direction)
          const imageOffset = (progress - 0.5) * -30;
          imageRef.current.style.transform = `translateY(${imageOffset}px) scale(${1 + progress * 0.05})`;
        }
      }
    };

    // Throttled scroll handler
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

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    window.addEventListener('scroll', throttledParallax);
    handleParallax(); // Initial call

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', throttledParallax);
    };
  }, []);

  return (
    <section id="about" className="about" ref={aboutRef}>
      <div className={`about-content fade-in ${isVisible ? 'visible' : ''}`} ref={contentRef}>
        <h2>The Pull of Authentic Beauty</h2>
        <p>
          Like gravity itself, true beauty is a natural force that draws us in. 
          Our marketplace curates pieces with that irresistible magnetic quality - 
          jewellery that speaks to you before you even realise why.
        </p>
        <p>
          Every piece in our collection has been chosen for its gravitational pull - 
          that indefinable quality that makes you stop, look, and feel instantly connected.
        </p>
      </div>
      <div className={`about-image fade-in ${isVisible ? 'visible' : ''}`} ref={imageRef}>
        <img 
          src="https://images.unsplash.com/photo-1556228724-4c1b4a9a5a87?auto=format&fit=crop&w=800&q=80" 
          alt="Jewellery Craftsmanship" 
        />
      </div>
    </section>
  );
};

export default About;
