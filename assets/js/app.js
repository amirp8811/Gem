// 🚀 GRAVITY JEWELRY - OPTIMIZED JAVASCRIPT
// Performance-optimized main application script

class GravityApp {
  constructor() {
    this.API_BASE = '/api';
    this.cart = new Cart();
    this.router = new Router();
    this.performance = new PerformanceOptimizer();
    
    this.init();
  }

  async init() {
    // Initialize performance optimizations
    this.performance.init();
    
    // Initialize router
    this.router.init();
    
    // Initialize cart
    await this.cart.init();
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Initialize intersection observer for animations
    this.initAnimations();
    
    // Initialize service worker for caching
    this.initServiceWorker();
    
    console.log('🌌 Gravity Jewelry App initialized');
  }

  initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy-load');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => {
      img.classList.add('lazy-load');
      imageObserver.observe(img);
    });
  }

  initAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animation = element.dataset.animate;
          element.classList.add(`animate-${animation}`);
        }
      });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => animationObserver.observe(el));
  }

  async initServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  }
}

// Performance Optimizer Class
class PerformanceOptimizer {
  init() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize images
    this.optimizeImages();
    
    // Debounce scroll events
    this.optimizeScrollEvents();
    
    // Monitor performance
    this.monitorPerformance();
  }

  preloadCriticalResources() {
    const criticalResources = [
      '/assets/css/main.css',
      '/api/products?limit=8',
      '/api/categories'
    ];

    criticalResources.forEach(resource => {
      if (resource.startsWith('/api/')) {
        // Preload API data
        fetch(resource).catch(() => {});
      } else {
        // Preload static resources
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'fetch';
        document.head.appendChild(link);
      }
    });
  }

  optimizeImages() {
    // Convert images to WebP if supported
    const supportsWebP = this.supportsWebP();
    
    document.querySelectorAll('img').forEach(img => {
      if (supportsWebP && img.dataset.webp) {
        img.src = img.dataset.webp;
      }
    });
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  }

  optimizeScrollEvents() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Handle scroll events here
          this.updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateScrollPosition() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    // Parallax effect for hero sections
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    parallaxElements.forEach(element => {
      element.style.transform = `translateY(${rate}px)`;
    });
  }

  monitorPerformance() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }
}

// Router Class for SPA Navigation
class Router {
  constructor() {
    this.routes = {
      '/': () => this.loadPage('home'),
      '/products': () => this.loadPage('products'),
      '/categories': () => this.loadPage('categories'),
      '/cart': () => this.loadPage('cart'),
      '/checkout': () => this.loadPage('checkout'),
      '/about': () => this.loadPage('about'),
      '/contact': () => this.loadPage('contact'),
      '/product/:slug': (params) => this.loadPage('product-detail', params)
    };
    
    this.currentPage = null;
  }

  init() {
    // Handle browser navigation
    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });

    // Handle link clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('a[data-route]')) {
        e.preventDefault();
        const path = e.target.getAttribute('href');
        this.navigate(path);
      }
    });

    // Load initial page
    this.handleRoute(window.location.pathname);
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute(path);
  }

  handleRoute(path) {
    const route = this.matchRoute(path);
    if (route) {
      route.handler(route.params);
    } else {
      this.loadPage('404');
    }
  }

  matchRoute(path) {
    for (const [pattern, handler] of Object.entries(this.routes)) {
      const params = this.extractParams(pattern, path);
      if (params !== null) {
        return { handler, params };
      }
    }
    return null;
  }

  extractParams(pattern, path) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) {
      return null;
    }
    
    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    
    return params;
  }

  async loadPage(pageName, params = {}) {
    try {
      // Show loading state
      this.showLoading();
      
      // Load page module
      const pageModule = await import(`/pages/${pageName}.js`);
      const page = new pageModule.default();
      
      // Render page
      await page.render(params);
      
      // Update current page
      this.currentPage = page;
      
      // Hide loading state
      this.hideLoading();
      
      // Update active navigation
      this.updateActiveNav(pageName);
      
    } catch (error) {
      console.error('Failed to load page:', error);
      this.loadErrorPage();
    }
  }

  showLoading() {
    const main = document.getElementById('main-content');
    main.innerHTML = '<div class="loading-container"><div class="loading"></div><p>Loading...</p></div>';
  }

  hideLoading() {
    // Loading will be replaced by page content
  }

  updateActiveNav(pageName) {
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }

  loadErrorPage() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
      <div class="error-page">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" class="btn btn-primary" data-route>Go Home</a>
      </div>
    `;
  }
}

// Cart Management Class
class Cart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.itemCount = 0;
  }

  async init() {
    await this.loadCart();
    this.updateCartUI();
  }

  async loadCart() {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.items = data.cart.items;
          this.total = data.cart.subtotal;
          this.itemCount = data.cart.itemCount;
        }
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }

  async addItem(productId, quantity = 1) {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ product_id: productId, quantity })
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadCart();
        this.showCartNotification('Item added to cart!');
        return true;
      } else {
        this.showCartNotification(data.message, 'error');
        return false;
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      this.showCartNotification('Failed to add item to cart', 'error');
      return false;
    }
  }

  async updateItem(itemId, quantity) {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      return false;
    }
  }

  async removeItem(itemId) {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        await this.loadCart();
        this.showCartNotification('Item removed from cart');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      return false;
    }
  }

  updateCartUI() {
    // Update cart count in header
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = this.itemCount;
      cartCount.style.display = this.itemCount > 0 ? 'inline' : 'none';
    }

    // Update cart total
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
      cartTotal.textContent = `$${this.total.toFixed(2)}`;
    }
  }

  showCartNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `cart-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Utility Functions
const utils = {
  // Debounce function for performance
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll events
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.gravityApp = new GravityApp();
  });
} else {
  window.gravityApp = new GravityApp();
}

// Export for modules
window.utils = utils;
