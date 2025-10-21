import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
  const { getFeaturedProducts, addToCart } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const featuredProducts = getFeaturedProducts();

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

    const section = document.querySelector('.featured-products');
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    
    // Show a brief animation or notification
    const button = e.target;
    const originalText = button.textContent;
    button.textContent = 'Added!';
    button.style.background = '#10b981';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
    }, 1000);
  };

  return (
    <section className="featured-products">
      <div className="container">
        <h2 className={`section-title fade-in ${isVisible ? 'visible' : ''}`}>
          Featured Collection
        </h2>
        <p className={`section-subtitle fade-in ${isVisible ? 'visible' : ''}`}>
          Discover our most coveted pieces with irresistible appeal
        </p>
        
        <div className="products-grid">
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`product-card fade-in ${isVisible ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link to={`/product/${product.id}`} className="product-link">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  <div className="product-overlay">
                    <button 
                      className="quick-add-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      <i className="fas fa-shopping-bag"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">${product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        <div className={`view-all-container fade-in ${isVisible ? 'visible' : ''}`}>
          <Link to="/shop" className="view-all-btn">
            View All Products
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
