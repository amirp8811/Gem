import React, { useEffect } from 'react';
import './JewelryCategories.css';

const JewelryCategories = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="shop" className="jewelry-categories">
      <h2 className="section-title fade-in">Discover Your Attraction</h2>
      <p className="section-subtitle fade-in">Find pieces that pull you in with their natural magnetism</p>
      
      {/* Main Categories */}
      <div className="main-categories">
        <div className="category-card fade-in">
          <div className="category-icon">💍</div>
          <h3>Rings</h3>
          <p>From $25</p>
          <div className="subcategories">
            <span>Engagement</span>
            <span>Wedding Bands</span>
            <span>Promise</span>
            <span>Cocktail</span>
            <span>Stackable</span>
            <span>Statement</span>
            <span>Signet</span>
          </div>
        </div>
        
        <div className="category-card fade-in">
          <div className="category-icon">💎</div>
          <h3>Necklaces</h3>
          <p>From $35</p>
          <div className="subcategories">
            <span>Pendants</span>
            <span>Chains</span>
            <span>Chokers</span>
            <span>Lockets</span>
            <span>Layered</span>
            <span>Statement</span>
            <span>Initial</span>
          </div>
        </div>
        
        <div className="category-card fade-in">
          <div className="category-icon">💫</div>
          <h3>Earrings</h3>
          <p>From $15</p>
          <div className="subcategories">
            <span>Studs</span>
            <span>Hoops</span>
            <span>Drop</span>
            <span>Dangle</span>
            <span>Huggie</span>
            <span>Ear Cuffs</span>
            <span>Threader</span>
          </div>
        </div>
        
        <div className="category-card fade-in">
          <div className="category-icon">💍</div>
          <h3>Bracelets</h3>
          <p>From $20</p>
          <div className="subcategories">
            <span>Bangles</span>
            <span>Chain</span>
            <span>Cuff</span>
            <span>Tennis</span>
            <span>Charm</span>
            <span>Beaded</span>
          </div>
        </div>
        
        <div className="category-card fade-in">
          <div className="category-icon">🕊️</div>
          <h3>Men's Jewelry</h3>
          <p>From $30</p>
          <div className="subcategories">
            <span>Cufflinks</span>
            <span>Tie Bars</span>
            <span>Signet Rings</span>
            <span>Bracelets</span>
            <span>Chains</span>
            <span>Pendants</span>
          </div>
        </div>
        
        <div className="category-card fade-in">
          <div className="category-icon">💠</div>
          <h3>Body Jewelry</h3>
          <p>From $12</p>
          <div className="subcategories">
            <span>Nose Rings</span>
            <span>Belly Rings</span>
            <span>Anklets</span>
            <span>Toe Rings</span>
            <span>Ear Chains</span>
          </div>
        </div>
      </div>
      
      {/* Specialty Categories */}
      <div className="specialty-section">
        <h3 className="specialty-title fade-in">Specialty Collections</h3>
        <div className="specialty-grid">
          <div className="specialty-card fade-in">
            <div className="specialty-icon">🧿</div>
            <h4>Birthstone</h4>
            <p>Your cosmic connection</p>
          </div>
          <div className="specialty-card fade-in">
            <div className="specialty-icon">✨</div>
            <h4>Minimalist</h4>
            <p>Effortless attraction</p>
          </div>
          <div className="specialty-card fade-in">
            <div className="specialty-icon">👑</div>
            <h4>Vintage</h4>
            <p>Timeless magnetism</p>
          </div>
          <div className="specialty-card fade-in">
            <div className="specialty-icon">🌿</div>
            <h4>Sustainable</h4>
            <p>Conscious attraction</p>
          </div>
        </div>
      </div>
      
      {/* Material Categories */}
      <div className="material-section">
        <h3 className="material-title fade-in">Shop by Material</h3>
        <div className="material-grid">
          <div className="material-card fade-in">
            <div className="material-swatch gold"></div>
            <span>Gold</span>
          </div>
          <div className="material-card fade-in">
            <div className="material-swatch silver"></div>
            <span>Silver</span>
          </div>
          <div className="material-card fade-in">
            <div className="material-swatch platinum"></div>
            <span>Platinum</span>
          </div>
          <div className="material-card fade-in">
            <div className="material-swatch diamond"></div>
            <span>Diamond</span>
          </div>
          <div className="material-card fade-in">
            <div className="material-swatch pearl"></div>
            <span>Pearl</span>
          </div>
          <div className="material-card fade-in">
            <div className="material-swatch gemstone"></div>
            <span>Gemstone</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JewelryCategories;
