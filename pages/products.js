// 🛍️ PRODUCTS PAGE COMPONENT
export default class ProductsPage {
  constructor() {
    this.products = [];
    this.categories = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.filters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: 'name'
    };
    this.loading = false;
  }

  async render(params = {}) {
    const main = document.getElementById('main-content');
    
    // Update filters from URL params
    this.updateFiltersFromParams(params);
    
    // Show loading skeleton
    main.innerHTML = this.getLoadingSkeleton();
    
    try {
      // Load initial data
      await Promise.all([
        this.loadProducts(),
        this.loadCategories()
      ]);
      
      // Render full page
      main.innerHTML = this.getHTML();
      
      // Initialize interactions
      this.initializeInteractions();
      
      // Update page title
      document.title = 'Products - Gravity Jewelry';
      
    } catch (error) {
      console.error('Failed to load products page:', error);
      main.innerHTML = this.getErrorHTML();
    }
  }

  updateFiltersFromParams(params) {
    if (params.category) this.filters.category = params.category;
    if (params.search) this.filters.search = params.search;
    if (params.page) this.currentPage = parseInt(params.page);
  }

  async loadProducts() {
    this.loading = true;
    
    const queryParams = new URLSearchParams({
      page: this.currentPage,
      limit: 12,
      ...this.filters
    });

    const response = await fetch(`/api/products?${queryParams}`);
    const data = await response.json();
    
    if (data.success) {
      this.products = data.products;
      this.totalPages = data.pagination.pages;
    }
    
    this.loading = false;
  }

  async loadCategories() {
    const response = await fetch('/api/categories');
    const data = await response.json();
    
    if (data.success) {
      this.categories = data.categories;
    }
  }

  getLoadingSkeleton() {
    return `
      <div class="products-page">
        <div class="container">
          <div class="page-header">
            <div class="skeleton" style="height: 40px; width: 200px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="height: 20px; width: 400px;"></div>
          </div>
          
          <div class="products-layout">
            <aside class="filters-sidebar">
              <div class="skeleton" style="height: 300px;"></div>
            </aside>
            
            <main class="products-main">
              <div class="products-header">
                <div class="skeleton" style="height: 40px; width: 150px;"></div>
                <div class="skeleton" style="height: 40px; width: 200px;"></div>
              </div>
              
              <div class="products-grid grid grid-3">
                ${Array(9).fill().map(() => `
                  <div class="card">
                    <div class="skeleton card-image"></div>
                    <div class="card-content">
                      <div class="skeleton" style="height: 20px; margin-bottom: 0.5rem;"></div>
                      <div class="skeleton" style="height: 24px; width: 80px;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </main>
          </div>
        </div>
      </div>
    `;
  }

  getHTML() {
    return `
      <div class="products-page">
        <div class="container">
          <!-- Page Header -->
          <div class="page-header" data-animate="fadeIn">
            <h1>Our Products</h1>
            <p>Discover our complete collection of handcrafted jewelry</p>
          </div>

          <div class="products-layout">
            <!-- Filters Sidebar -->
            <aside class="filters-sidebar" data-animate="slideLeft">
              <div class="filters-header">
                <h3>Filters</h3>
                <button class="clear-filters-btn">Clear All</button>
              </div>

              <!-- Search Filter -->
              <div class="filter-group">
                <label for="search-input">Search</label>
                <input type="text" id="search-input" placeholder="Search products..." 
                       value="${this.filters.search}">
              </div>

              <!-- Category Filter -->
              <div class="filter-group">
                <label>Categories</label>
                <div class="category-filters">
                  <label class="filter-checkbox">
                    <input type="radio" name="category" value="" 
                           ${!this.filters.category ? 'checked' : ''}>
                    <span>All Categories</span>
                  </label>
                  ${this.categories.map(category => `
                    <label class="filter-checkbox">
                      <input type="radio" name="category" value="${category.slug}" 
                             ${this.filters.category === category.slug ? 'checked' : ''}>
                      <span>${category.name}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Price Filter -->
              <div class="filter-group">
                <label>Price Range</label>
                <div class="price-inputs">
                  <input type="number" id="min-price" placeholder="Min" 
                         value="${this.filters.minPrice}" min="0">
                  <span>to</span>
                  <input type="number" id="max-price" placeholder="Max" 
                         value="${this.filters.maxPrice}" min="0">
                </div>
                <button class="apply-price-btn btn btn-secondary">Apply</button>
              </div>

              <!-- Material Filter -->
              <div class="filter-group">
                <label>Material</label>
                <select id="material-filter">
                  <option value="">All Materials</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="platinum">Platinum</option>
                  <option value="rose-gold">Rose Gold</option>
                </select>
              </div>
            </aside>

            <!-- Products Main Content -->
            <main class="products-main" data-animate="slideRight">
              <!-- Products Header -->
              <div class="products-header">
                <div class="results-info">
                  <span class="results-count">${this.products.length} products</span>
                </div>
                
                <div class="sort-controls">
                  <label for="sort-select">Sort by:</label>
                  <select id="sort-select">
                    <option value="name" ${this.filters.sort === 'name' ? 'selected' : ''}>Name</option>
                    <option value="price" ${this.filters.sort === 'price' ? 'selected' : ''}>Price: Low to High</option>
                    <option value="-price" ${this.filters.sort === '-price' ? 'selected' : ''}>Price: High to Low</option>
                    <option value="created_at" ${this.filters.sort === 'created_at' ? 'selected' : ''}>Newest</option>
                    <option value="rating" ${this.filters.sort === 'rating' ? 'selected' : ''}>Rating</option>
                  </select>
                </div>

                <div class="view-controls">
                  <button class="view-btn grid-view active" data-view="grid" title="Grid View">
                    <i class="fas fa-th"></i>
                  </button>
                  <button class="view-btn list-view" data-view="list" title="List View">
                    <i class="fas fa-list"></i>
                  </button>
                </div>
              </div>

              <!-- Products Grid -->
              <div class="products-grid grid grid-3" id="products-container">
                ${this.renderProducts()}
              </div>

              <!-- Pagination -->
              ${this.renderPagination()}

              <!-- Load More Button (for infinite scroll) -->
              <div class="load-more-container text-center">
                <button class="load-more-btn btn btn-secondary" 
                        ${this.currentPage >= this.totalPages ? 'style="display: none;"' : ''}>
                  Load More Products
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    `;
  }

  renderProducts() {
    if (this.products.length === 0) {
      return `
        <div class="no-products">
          <i class="fas fa-search"></i>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      `;
    }

    return this.products.map(product => `
      <div class="product-card card" data-product-id="${product.id}">
        <div class="product-image-container">
          <img src="${product.primary_image || '/assets/images/product-placeholder.jpg'}" 
               alt="${product.name}" class="card-image" loading="lazy"
               data-src="${product.primary_image}">
          
          ${product.is_featured ? '<span class="product-badge featured">Featured</span>' : ''}
          ${product.stock_quantity === 0 ? '<span class="product-badge out-of-stock">Out of Stock</span>' : ''}
          
          <div class="product-overlay">
            <button class="btn btn-primary add-to-cart-btn" 
                    data-product-id="${product.id}"
                    ${product.stock_quantity === 0 ? 'disabled' : ''}>
              <i class="fas fa-shopping-cart"></i> 
              ${product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <a href="/product/${product.slug}" class="btn btn-secondary" data-route>
              <i class="fas fa-eye"></i> View Details
            </a>
            <button class="wishlist-btn" data-product-id="${product.id}" title="Add to Wishlist">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
        
        <div class="card-content">
          <h3 class="card-title">
            <a href="/product/${product.slug}" data-route>${product.name}</a>
          </h3>
          
          <div class="product-meta">
            ${product.category_name ? `<span class="product-category">${product.category_name}</span>` : ''}
            ${product.material ? `<span class="product-material">${product.material}</span>` : ''}
          </div>
          
          <div class="product-pricing">
            <span class="card-price">${utils.formatCurrency(product.price)}</span>
            ${product.compare_price && product.compare_price > product.price ? `
              <span class="compare-price">${utils.formatCurrency(product.compare_price)}</span>
              <span class="discount-badge">
                ${Math.round((1 - product.price / product.compare_price) * 100)}% OFF
              </span>
            ` : ''}
          </div>
          
          ${product.rating_average ? `
            <div class="product-rating">
              ${this.renderStars(product.rating_average)}
              <span class="rating-count">(${product.rating_count})</span>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  renderPagination() {
    if (this.totalPages <= 1) return '';

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // Previous button
    if (this.currentPage > 1) {
      pages.push(`
        <button class="pagination-btn" data-page="${this.currentPage - 1}">
          <i class="fas fa-chevron-left"></i>
        </button>
      `);
    }

    // First page
    if (startPage > 1) {
      pages.push(`<button class="pagination-btn" data-page="1">1</button>`);
      if (startPage > 2) {
        pages.push(`<span class="pagination-ellipsis">...</span>`);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                data-page="${i}">${i}</button>
      `);
    }

    // Last page
    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages.push(`<span class="pagination-ellipsis">...</span>`);
      }
      pages.push(`<button class="pagination-btn" data-page="${this.totalPages}">${this.totalPages}</button>`);
    }

    // Next button
    if (this.currentPage < this.totalPages) {
      pages.push(`
        <button class="pagination-btn" data-page="${this.currentPage + 1}">
          <i class="fas fa-chevron-right"></i>
        </button>
      `);
    }

    return `
      <div class="pagination">
        ${pages.join('')}
      </div>
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

  getErrorHTML() {
    return `
      <section class="error-section">
        <div class="container text-center">
          <h1>Failed to Load Products</h1>
          <p>We're having trouble loading the products. Please try again.</p>
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      </section>
    `;
  }

  initializeInteractions() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', utils.debounce((e) => {
        this.filters.search = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      }, 500));
    }

    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(input => {
      input.addEventListener('change', (e) => {
        this.filters.category = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    });

    // Price filter
    const applyPriceBtn = document.querySelector('.apply-price-btn');
    if (applyPriceBtn) {
      applyPriceBtn.addEventListener('click', () => {
        this.filters.minPrice = document.getElementById('min-price').value;
        this.filters.maxPrice = document.getElementById('max-price').value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // Sort control
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // View controls
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.dataset.view;
        const container = document.getElementById('products-container');
        container.className = view === 'list' ? 'products-list' : 'products-grid grid grid-3';
      });
    });

    // Add to cart
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const productId = parseInt(btn.dataset.productId);
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        btn.disabled = true;
        
        const success = await window.gravityApp.cart.addItem(productId, 1);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        if (success) {
          btn.innerHTML = '<i class="fas fa-check"></i> Added!';
          setTimeout(() => btn.innerHTML = originalText, 2000);
        }
      });
    });

    // Pagination
    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = parseInt(btn.dataset.page);
        if (page && page !== this.currentPage) {
          this.currentPage = page;
          this.applyFilters();
        }
      });
    });

    // Load more button
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          await this.loadMoreProducts();
        }
      });
    }

    // Clear filters
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.filters = { category: '', minPrice: '', maxPrice: '', search: '', sort: 'name' };
        this.currentPage = 1;
        this.applyFilters();
      });
    }
  }

  async applyFilters() {
    if (this.loading) return;
    
    // Update URL
    const params = new URLSearchParams(this.filters);
    params.set('page', this.currentPage);
    window.history.replaceState({}, '', `/products?${params}`);
    
    // Show loading state
    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="loading text-center"><div class="loading"></div></div>';
    
    // Load filtered products
    await this.loadProducts();
    
    // Update products display
    container.innerHTML = this.renderProducts();
    
    // Update pagination
    const pagination = document.querySelector('.pagination');
    if (pagination) {
      pagination.outerHTML = this.renderPagination();
    }
    
    // Re-initialize interactions for new elements
    this.initializeInteractions();
  }

  async loadMoreProducts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    await this.loadProducts();
    
    // Append new products
    const container = document.getElementById('products-container');
    container.insertAdjacentHTML('beforeend', this.renderProducts());
    
    // Hide load more button if no more pages
    if (this.currentPage >= this.totalPages) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.innerHTML = 'Load More Products';
    }
  }
}
