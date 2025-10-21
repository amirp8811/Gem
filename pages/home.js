// 🏠 HOME PAGE COMPONENT
export default class HomePage {
  constructor() {
    this.products = [];
    this.categories = [];
  }

  async render() {
    const main = document.getElementById('main-content');
    
    // Show loading skeleton
    main.innerHTML = this.getLoadingSkeleton();
    
    try {
      // Load data in parallel
      const [productsData, categoriesData] = await Promise.all([
        this.loadFeaturedProducts(),
        this.loadCategories()
      ]);
      
      this.products = productsData;
      this.categories = categoriesData;
      
      // Render full page
      main.innerHTML = this.getHTML();
      
      // Initialize page interactions
      this.initializeInteractions();
      
      // Update page title
      document.title = 'Gravity Jewelry - Luxury Handcrafted Jewelry';
      
    } catch (error) {
      console.error('Failed to load home page:', error);
      main.innerHTML = this.getErrorHTML();
    }
  }

  async loadFeaturedProducts() {
    const response = await fetch('/api/products?featured=true&limit=8');
    const data = await response.json();
    return data.success ? data.products : [];
  }

  async loadCategories() {
    const response = await fetch('/api/categories?limit=6');
    const data = await response.json();
    return data.success ? data.categories : [];
  }

  getLoadingSkeleton() {
    return `
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <div class="skeleton" style="height: 60px; width: 400px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 24px; width: 600px; margin-bottom: 2rem;"></div>
            <div class="skeleton" style="height: 50px; width: 200px;"></div>
          </div>
        </div>
      </section>
      
      <section class="featured-products">
        <div class="container">
          <div class="skeleton" style="height: 40px; width: 300px; margin-bottom: 2rem;"></div>
          <div class="grid grid-4">
            ${Array(4).fill().map(() => `
              <div class="card">
                <div class="skeleton card-image"></div>
                <div class="card-content">
                  <div class="skeleton" style="height: 20px; margin-bottom: 0.5rem;"></div>
                  <div class="skeleton" style="height: 24px; width: 80px;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  getHTML() {
    return `
      <!-- Hero Section -->
      <section class="hero" data-animate="fadeIn">
        <div class="hero-background" data-parallax></div>
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Timeless Elegance</h1>
            <p class="hero-subtitle">Discover our exquisite collection of handcrafted jewelry that captures the essence of sophistication and grace.</p>
            <div class="hero-actions">
              <a href="/products" class="btn btn-primary" data-route>Shop Collection</a>
              <a href="/about" class="btn btn-secondary" data-route>Our Story</a>
            </div>
          </div>
          <div class="hero-image">
            <canvas id="ring-canvas"></canvas>
            <img src="/assets/images/hero-jewelry.jpg" alt="Luxury jewelry collection" loading="eager" style="display: none;">
          </div>
        </div>
      </section>

      <!-- Featured Categories -->
      <section class="featured-categories" data-animate="slideUp">
        <div class="container">
          <h2 class="section-title text-center">Shop by Category</h2>
          <div class="categories-grid grid grid-3">
            ${this.categories.map(category => `
              <a href="/categories/${category.slug}" class="category-card card" data-route>
                <img src="${category.image_url || '/assets/images/category-placeholder.jpg'}" 
                     alt="${category.name}" class="card-image" loading="lazy">
                <div class="card-content">
                  <h3 class="card-title">${category.name}</h3>
                  <p class="category-description">${category.description || ''}</p>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="featured-products" data-animate="slideUp">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Featured Products</h2>
            <a href="/products" class="view-all-link" data-route>View All Products</a>
          </div>
          <div class="products-grid grid grid-4">
            ${this.products.map(product => `
              <div class="product-card card" data-product-id="${product.id}">
                <div class="product-image-container">
                  <img src="${product.primary_image || '/assets/images/product-placeholder.jpg'}" 
                       alt="${product.name}" class="card-image" loading="lazy">
                  <div class="product-overlay">
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                      <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <a href="/product/${product.slug}" class="btn btn-secondary" data-route>
                      View Details
                    </a>
                  </div>
                </div>
                <div class="card-content">
                  <h3 class="card-title">${product.name}</h3>
                  <p class="card-price">${utils.formatCurrency(product.price)}</p>
                  ${product.rating_average ? `
                    <div class="product-rating">
                      ${this.renderStars(product.rating_average)}
                      <span class="rating-count">(${product.rating_count})</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Why Choose Us -->
      <section class="why-choose-us" data-animate="slideUp">
        <div class="container">
          <h2 class="section-title text-center">Why Choose Gravity Jewelry</h2>
          <div class="features-grid grid grid-3">
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-gem"></i>
              </div>
              <h3>Premium Quality</h3>
              <p>Each piece is crafted with the finest materials and attention to detail.</p>
            </div>
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-shipping-fast"></i>
              </div>
              <h3>Fast Shipping</h3>
              <p>Free worldwide shipping on orders over $100 with express delivery options.</p>
            </div>
            <div class="feature-card text-center">
              <div class="feature-icon">
                <i class="fas fa-shield-alt"></i>
              </div>
              <h3>Lifetime Warranty</h3>
              <p>All our jewelry comes with a lifetime warranty against manufacturing defects.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter Signup -->
      <section class="newsletter-signup" data-animate="fadeIn">
        <div class="container">
          <div class="newsletter-content text-center">
            <h2>Stay in Touch</h2>
            <p>Be the first to know about new collections and exclusive offers.</p>
            <form class="newsletter-form inline-form">
              <input type="email" placeholder="Enter your email" required>
              <button type="submit" class="btn btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  getErrorHTML() {
    return `
      <section class="error-section">
        <div class="container text-center">
          <h1>Oops! Something went wrong</h1>
          <p>We're having trouble loading the page. Please try again.</p>
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      </section>
    `;
  }

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
      <div class="stars">
        ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
        ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
        ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
      </div>
    `;
  }

  initializeInteractions() {
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.productId);
        
        // Show loading state
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        btn.disabled = true;
        
        // Add to cart
        const success = await window.gravityApp.cart.addItem(productId, 1);
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        if (success) {
          btn.innerHTML = '<i class="fas fa-check"></i> Added!';
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        }
      });
    });

    // Newsletter signup
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        
        try {
          const response = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          
          if (response.ok) {
            newsletterForm.innerHTML = '<p class="success-message">Thank you for subscribing!</p>';
          } else {
            throw new Error('Subscription failed');
          }
        } catch (error) {
          console.error('Newsletter subscription failed:', error);
          alert('Failed to subscribe. Please try again.');
        }
      });
    }

    // Parallax effect for hero
    const heroBackground = document.querySelector('[data-parallax]');
    if (heroBackground) {
      window.addEventListener('scroll', utils.throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
      }, 10));
    }
  }

  initRing3D() {
    const canvas = document.getElementById('ring-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load MTL and OBJ
    const mtlLoader = new THREE.MTLLoader();
    const objLoader = new THREE.OBJLoader();

    mtlLoader.load('/ring/model.mtl', (materials) => {
      materials.preload();
      objLoader.setMaterials(materials);
      objLoader.load('/ring/model.obj', (object) => {
        object.scale.set(0.5, 0.5, 0.5);
        object.position.set(0, 0, 0);
        scene.add(object);

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          const scrolled = window.pageYOffset;
          object.rotation.y = scrolled * 0.01;
          object.rotation.x = Math.sin(scrolled * 0.005) * 0.2;
          renderer.render(scene, camera);
        };
        animate();
      }, undefined, (error) => {
        console.error('Error loading OBJ:', error);
      });
    }, undefined, (error) => {
      console.error('Error loading MTL:', error);
    });

    // Camera position
    camera.position.z = 5;

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
  }
}
