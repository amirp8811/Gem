import React, { useState, useEffect } from 'react';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);

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

    const newsletterSection = document.querySelector('.newsletter');
    if (newsletterSection) {
      observer.observe(newsletterSection);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

  return (
    <section id="contact" className="newsletter">
      <h2 className={`fade-in ${isVisible ? 'visible' : ''}`}>Feel the Pull</h2>
      <p className={`fade-in ${isVisible ? 'visible' : ''}`}>
        Join our orbit and be the first to discover pieces with irresistible magnetism
      </p>
      <form 
        className={`newsletter-form fade-in ${isVisible ? 'visible' : ''}`}
        onSubmit={handleSubmit}
      >
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
};

export default Newsletter;
