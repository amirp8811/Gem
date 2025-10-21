// 🛒 CART PAGE COMPONENT
export default class CartPage {
  constructor() {
    this.cartItems = [];
    this.subtotal = 0;
    this.shipping = 0;
    this.tax = 0;
    this.total = 0;
  }

  async render() {
    const main = document.getElementById('main-content');
    
    // Show loading skeleton
    main.innerHTML = this.getLoadingSkeleton();
    
    try {
      // Load cart data
      await this.loadCart();
      
      // Render full page
      main.innerHTML = this.getHTML();
      
      // Initialize interactions
      this.initializeInteractions();
      
      // Update page title
      document.title = `Cart (${this.cartItems.length}) - Gravity Jewelry`;
      
    } catch (error) {
      console.error('Failed to load cart page:', error);
      main.innerHTML = this.getErrorHTML();
    }
  }

  async loadCart() {
    const response = await fetch('/api/cart', {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      this.cartItems = data.cart.items;
      this.subtotal = data.cart.subtotal;
      this.calculateTotals();
    }
  }

  calculateTotals() {
    // Calculate shipping (free over $100)
    this.shipping = this.subtotal >= 100 ? 0 : 15;
    
    // Calculate tax (8.5%)
    this.tax = (this.subtotal + this.shipping) * 0.085;
    
    // Calculate total
    this.total = this.subtotal + this.shipping + this.tax;
  }

  getLoadingSkeleton() {
    return `
      <div class="cart-page">
        <div class="container">
          <div class="page-header">
            <div class="skeleton" style="height: 40px; width: 200px; margin-bottom: 1rem;"></div>
          </div>
          
          <div class="cart-layout">
            <div class="cart-items">
              ${Array(3).fill().map(() => `
                <div class="cart-item">
                  <div class="skeleton" style="height: 100px; width: 100px;"></div>
                  <div class="item-details">
                    <div class="skeleton" style="height: 20px; width: 200px; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton" style="height: 16px; width: 100px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="cart-summary">
              <div class="skeleton" style="height: 200px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getHTML() {
    if (this.cartItems.length === 0) {
      return this.getEmptyCartHTML();
    }

    return `
      <div class="cart-page">
        <div class="container">
          <!-- Page Header -->
          <div class="page-header" data-animate="fadeIn">
            <h1>Shopping Cart</h1>
            <p>${this.cartItems.length} item${this.cartItems.length !== 1 ? 's' : ''} in your cart</p>
          </div>

          <div class="cart-layout">
            <!-- Cart Items -->
            <div class="cart-items" data-animate="slideLeft">
              <div class="cart-header">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
              </div>

              ${this.cartItems.map(item => `
                <div class="cart-item" data-item-id="${item.id}">
                  <div class="item-image">
                    <img src="${item.image_url || '/assets/images/product-placeholder.jpg'}" 
                         alt="${item.name}" loading="lazy">
                  </div>
                  
                  <div class="item-details">
                    <h3 class="item-name">
                      <a href="/product/${item.slug}" data-route>${item.name}</a>
                    </h3>
                    <p class="item-sku">SKU: ${item.sku || 'N/A'}</p>
                    ${item.stock_quantity < 5 && item.stock_quantity > 0 ? 
                      `<p class="low-stock-warning">Only ${item.stock_quantity} left in stock</p>` : ''}
                    ${item.stock_quantity === 0 ? 
                      `<p class="out-of-stock-warning">Out of stock</p>` : ''}
                  </div>
                  
                  <div class="item-price">
                    ${utils.formatCurrency(item.price)}
                  </div>
                  
                  <div class="item-quantity">
                    <div class="quantity-controls">
                      <button class="quantity-btn decrease" data-item-id="${item.id}" 
                              ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                      </button>
                      <input type="number" class="quantity-input" value="${item.quantity}" 
                             min="1" max="${item.stock_quantity}" data-item-id="${item.id}">
                      <button class="quantity-btn increase" data-item-id="${item.id}"
                              ${item.quantity >= item.stock_quantity ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div class="item-total">
                    ${utils.formatCurrency(item.price * item.quantity)}
                  </div>
                  
                  <div class="item-actions">
                    <button class="remove-item-btn" data-item-id="${item.id}" 
                            title="Remove from cart">
                      <i class="fas fa-trash"></i>
                    </button>
                    <button class="save-for-later-btn" data-item-id="${item.id}" 
                            title="Save for later">
                      <i class="fas fa-heart"></i>
                    </button>
                  </div>
                </div>
              `).join('')}

              <!-- Cart Actions -->
              <div class="cart-actions">
                <a href="/products" class="btn btn-secondary" data-route>
                  <i class="fas fa-arrow-left"></i> Continue Shopping
                </a>
                <button class="clear-cart-btn btn btn-outline">
                  <i class="fas fa-trash"></i> Clear Cart
                </button>
              </div>
            </div>

            <!-- Cart Summary -->
            <div class="cart-summary" data-animate="slideRight">
              <div class="summary-card">
                <h3>Order Summary</h3>
                
                <div class="summary-line">
                  <span>Subtotal (${this.cartItems.length} items)</span>
                  <span>${utils.formatCurrency(this.subtotal)}</span>
                </div>
                
                <div class="summary-line">
                  <span>Shipping</span>
                  <span>${this.shipping === 0 ? 'FREE' : utils.formatCurrency(this.shipping)}</span>
                </div>
                
                ${this.shipping === 0 ? '' : `
                  <div class="free-shipping-notice">
                    <i class="fas fa-info-circle"></i>
                    Add ${utils.formatCurrency(100 - this.subtotal)} more for free shipping
                  </div>
                `}
                
                <div class="summary-line">
                  <span>Tax</span>
                  <span>${utils.formatCurrency(this.tax)}</span>
                </div>
                
                <hr>
                
                <div class="summary-line total">
                  <span>Total</span>
                  <span>${utils.formatCurrency(this.total)}</span>
                </div>
                
                <div class="checkout-actions">
                  <a href="/checkout" class="btn btn-primary checkout-btn" data-route>
                    <i class="fas fa-lock"></i> Secure Checkout
                  </a>
                  
                  <div class="payment-methods">
                    <span>We accept:</span>
                    <div class="payment-icons">
                      <i class="fab fa-cc-visa"></i>
                      <i class="fab fa-cc-mastercard"></i>
                      <i class="fab fa-cc-amex"></i>
                      <i class="fab fa-cc-paypal"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Promo Code -->
              <div class="promo-code-section">
                <h4>Promo Code</h4>
                <form class="promo-form">
                  <input type="text" placeholder="Enter promo code" class="promo-input">
                  <button type="submit" class="btn btn-secondary">Apply</button>
                </form>
              </div>

              <!-- Security Features -->
              <div class="security-features">
                <div class="security-item">
                  <i class="fas fa-shield-alt"></i>
                  <span>Secure SSL Encryption</span>
                </div>
                <div class="security-item">
                  <i class="fas fa-undo"></i>
                  <span>30-Day Returns</span>
                </div>
                <div class="security-item">
                  <i class="fas fa-shipping-fast"></i>
                  <span>Free Shipping Over $100</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommended Products -->
          <div class="recommended-products" data-animate="slideUp">
            <h2>You Might Also Like</h2>
            <div class="recommended-grid" id="recommended-products">
              <!-- Will be loaded dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getEmptyCartHTML() {
    return `
      <div class="cart-page empty-cart">
        <div class="container">
          <div class="empty-cart-content text-center" data-animate="fadeIn">
            <div class="empty-cart-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h1>Your Cart is Empty</h1>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <div class="empty-cart-actions">
              <a href="/products" class="btn btn-primary" data-route>
                <i class="fas fa-gem"></i> Shop Our Collection
              </a>
              <a href="/categories" class="btn btn-secondary" data-route>
                <i class="fas fa-list"></i> Browse Categories
              </a>
            </div>
          </div>

          <!-- Recently Viewed -->
          <div class="recently-viewed" id="recently-viewed">
            <!-- Will be loaded if available -->
          </div>
        </div>
      </div>
    `;
  }

  getErrorHTML() {
    return `
      <section class="error-section">
        <div class="container text-center">
          <h1>Failed to Load Cart</h1>
          <p>We're having trouble loading your cart. Please try again.</p>
          <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        </div>
      </section>
    `;
  }

  initializeInteractions() {
    // Quantity controls
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const itemId = btn.dataset.itemId;
        const isIncrease = btn.classList.contains('increase');
        const quantityInput = document.querySelector(`input[data-item-id="${itemId}"]`);
        
        let newQuantity = parseInt(quantityInput.value);
        newQuantity = isIncrease ? newQuantity + 1 : newQuantity - 1;
        
        if (newQuantity < 1) return;
        
        await this.updateQuantity(itemId, newQuantity);
      });
    });

    // Quantity input direct change
    document.querySelectorAll('.quantity-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const itemId = input.dataset.itemId;
        const newQuantity = parseInt(input.value);
        
        if (newQuantity < 1) {
          input.value = 1;
          return;
        }
        
        await this.updateQuantity(itemId, newQuantity);
      });
    });

    // Remove item buttons
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const itemId = btn.dataset.itemId;
        
        if (confirm('Are you sure you want to remove this item from your cart?')) {
          await this.removeItem(itemId);
        }
      });
    });

    // Clear cart button
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear your entire cart?')) {
          await this.clearCart();
        }
      });
    }

    // Promo code form
    const promoForm = document.querySelector('.promo-form');
    if (promoForm) {
      promoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const promoCode = promoForm.querySelector('.promo-input').value.trim();
        
        if (promoCode) {
          await this.applyPromoCode(promoCode);
        }
      });
    }

    // Load recommended products
    this.loadRecommendedProducts();
  }

  async updateQuantity(itemId, quantity) {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();
      
      if (data.success) {
        // Reload cart to get updated totals
        await this.loadCart();
        
        // Update the display
        this.updateCartDisplay();
        
        // Update global cart
        await window.gravityApp.cart.loadCart();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Failed to update quantity. Please try again.');
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
        // Remove item from display
        const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemElement) {
          itemElement.remove();
        }
        
        // Reload cart
        await this.loadCart();
        
        // Update display or show empty cart
        if (this.cartItems.length === 0) {
          const main = document.getElementById('main-content');
          main.innerHTML = this.getEmptyCartHTML();
        } else {
          this.updateCartDisplay();
        }
        
        // Update global cart
        await window.gravityApp.cart.loadCart();
        
        // Show notification
        window.gravityApp.cart.showCartNotification('Item removed from cart');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Failed to remove item. Please try again.');
    }
  }

  async clearCart() {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success) {
        // Show empty cart
        const main = document.getElementById('main-content');
        main.innerHTML = this.getEmptyCartHTML();
        
        // Update global cart
        await window.gravityApp.cart.loadCart();
        
        // Show notification
        window.gravityApp.cart.showCartNotification('Cart cleared');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  }

  async applyPromoCode(code) {
    try {
      const response = await fetch('/api/cart/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      
      if (data.success) {
        // Reload cart with discount applied
        await this.loadCart();
        this.updateCartDisplay();
        
        alert(`Promo code applied! You saved ${utils.formatCurrency(data.discount)}`);
      } else {
        alert(data.message || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Failed to apply promo code:', error);
      alert('Failed to apply promo code. Please try again.');
    }
  }

  updateCartDisplay() {
    // Update summary totals
    document.querySelector('.summary-line .total span:last-child').textContent = 
      utils.formatCurrency(this.total);
    
    // Update item totals
    this.cartItems.forEach(item => {
      const itemElement = document.querySelector(`[data-item-id="${item.id}"]`);
      if (itemElement) {
        const totalElement = itemElement.querySelector('.item-total');
        totalElement.textContent = utils.formatCurrency(item.price * item.quantity);
      }
    });
  }

  async loadRecommendedProducts() {
    try {
      const response = await fetch('/api/products?limit=4&featured=true');
      const data = await response.json();
      
      if (data.success && data.products.length > 0) {
        const container = document.getElementById('recommended-products');
        if (container) {
          container.innerHTML = `
            <div class="grid grid-4">
              ${data.products.map(product => `
                <div class="product-card card">
                  <div class="product-image-container">
                    <img src="${product.primary_image || '/assets/images/product-placeholder.jpg'}" 
                         alt="${product.name}" class="card-image" loading="lazy">
                    <div class="product-overlay">
                      <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div class="card-content">
                    <h3 class="card-title">${product.name}</h3>
                    <p class="card-price">${utils.formatCurrency(product.price)}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
          
          // Add event listeners for new add to cart buttons
          container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const productId = parseInt(btn.dataset.productId);
              await window.gravityApp.cart.addItem(productId, 1);
            });
          });
        }
      }
    } catch (error) {
      console.error('Failed to load recommended products:', error);
    }
  }
}
