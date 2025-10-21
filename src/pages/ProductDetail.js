import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, getProductsByCategory } = useApp();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      // Get related products from same category
      const related = getProductsByCategory(foundProduct.category)
        .filter(p => p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    } else {
      navigate('/shop');
    }
  }, [id, products, navigate, getProductsByCategory]);

  const handleAddToCart = () => {
    if (product && product.inStock) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Show success feedback
      const button = document.querySelector('.add-to-cart-btn');
      const originalText = button.textContent;
      button.textContent = `Added ${quantity} to Cart!`;
      button.style.background = '#10b981';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // Mock additional images for demo
  const productImages = [
    product.image,
    product.image, // In real app, these would be different angles
    product.image,
    product.image
  ];

  return (
    <div className="product-detail-page">
      <div className="product-container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-images">
            <div className="main-image">
              <img src={productImages[selectedImage]} alt={product.name} />
              {!product.inStock && <div className="out-of-stock-overlay">Out of Stock</div>}
            </div>
            <div className="image-thumbnails">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <p className="product-category">{product.category}</p>
              {product.featured && <span className="featured-badge">Featured</span>}
            </div>

            <div className="product-price">
              <span className="current-price">{formatPrice(product.price)}</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-details">
              <h3>Product Details</h3>
              <ul>
                <li><strong>Category:</strong> {product.category}</li>
                <li><strong>Material:</strong> Premium Quality</li>
                <li><strong>Care:</strong> Clean with soft cloth</li>
                <li><strong>Warranty:</strong> 1 Year Limited</li>
              </ul>
            </div>

            <div className="product-actions">
              {product.inStock ? (
                <>
                  <div className="quantity-selector">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="quantity-btn"
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="quantity-btn"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddToCart}
                    className="add-to-cart-btn"
                  >
                    <i className="fas fa-shopping-bag"></i>
                    Add to Cart - {formatPrice(product.price * quantity)}
                  </button>
                </>
              ) : (
                <div className="out-of-stock-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  This item is currently out of stock
                </div>
              )}

              <div className="product-features">
                <div className="feature">
                  <i className="fas fa-shipping-fast"></i>
                  <span>Free Shipping</span>
                </div>
                <div className="feature">
                  <i className="fas fa-undo"></i>
                  <span>30-Day Returns</span>
                </div>
                <div className="feature">
                  <i className="fas fa-certificate"></i>
                  <span>Authenticity Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-grid">
              {relatedProducts.map(relatedProduct => (
                <Link 
                  key={relatedProduct.id} 
                  to={`/product/${relatedProduct.id}`}
                  className="related-product-card"
                >
                  <div className="related-image">
                    <img src={relatedProduct.image} alt={relatedProduct.name} />
                  </div>
                  <div className="related-info">
                    <h4>{relatedProduct.name}</h4>
                    <p className="related-price">{formatPrice(relatedProduct.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
