// 📞 CONTACT PAGE COMPONENT
export default class ContactPage {
  constructor() {
    this.formSubmitted = false;
  }

  async render() {
    const main = document.getElementById('main-content');
    
    main.innerHTML = this.getHTML();
    this.initializeInteractions();
    
    // Update page title
    document.title = 'Contact Us - Gravity Jewelry';
  }

  getHTML() {
    return `
      <div class="contact-page">
        <!-- Page Header -->
        <section class="contact-header" data-animate="fadeIn">
          <div class="container">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Get in touch with our team.</p>
          </div>
        </section>

        <div class="container">
          <div class="contact-layout">
            <!-- Contact Form -->
            <div class="contact-form-section" data-animate="slideLeft">
              <h2>Send us a Message</h2>
              <form class="contact-form" id="contact-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">First Name *</label>
                    <input type="text" id="firstName" name="firstName" required>
                  </div>
                  <div class="form-group">
                    <label for="lastName">Last Name *</label>
                    <input type="text" id="lastName" name="lastName" required>
                  </div>
                </div>
                
                <div class="form-group">
                  <label for="email">Email Address *</label>
                  <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input type="tel" id="phone" name="phone">
                </div>
                
                <div class="form-group">
                  <label for="subject">Subject *</label>
                  <select id="subject" name="subject" required>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Support</option>
                    <option value="product">Product Question</option>
                    <option value="custom">Custom Design</option>
                    <option value="repair">Repair Services</option>
                    <option value="wholesale">Wholesale Inquiry</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="message">Message *</label>
                  <textarea id="message" name="message" rows="6" required 
                            placeholder="Tell us how we can help you..."></textarea>
                </div>
                
                <div class="form-group checkbox-group">
                  <label class="checkbox-label">
                    <input type="checkbox" id="newsletter" name="newsletter">
                    <span class="checkmark"></span>
                    Subscribe to our newsletter for exclusive offers and updates
                  </label>
                </div>
                
                <button type="submit" class="btn btn-primary submit-btn">
                  <span class="btn-text">Send Message</span>
                  <span class="btn-loading hidden">
                    <i class="fas fa-spinner fa-spin"></i> Sending...
                  </span>
                </button>
              </form>
              
              <div class="form-success hidden" id="form-success">
                <div class="success-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <h3>Message Sent Successfully!</h3>
                <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="contact-info-section" data-animate="slideRight">
              <h2>Get in Touch</h2>
              
              <div class="contact-methods">
                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div class="method-details">
                    <h4>Visit Our Showroom</h4>
                    <p>123 Jewelry District<br>
                    New York, NY 10013<br>
                    United States</p>
                  </div>
                </div>
                
                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-phone"></i>
                  </div>
                  <div class="method-details">
                    <h4>Call Us</h4>
                    <p><a href="tel:+1234567890">+1 (234) 567-890</a><br>
                    Monday - Friday: 9AM - 6PM EST<br>
                    Saturday: 10AM - 4PM EST</p>
                  </div>
                </div>
                
                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div class="method-details">
                    <h4>Email Us</h4>
                    <p><a href="mailto:info@gravity-jewelry.com">info@gravity-jewelry.com</a><br>
                    <a href="mailto:support@gravity-jewelry.com">support@gravity-jewelry.com</a><br>
                    We respond within 24 hours</p>
                  </div>
                </div>
                
                <div class="contact-method">
                  <div class="method-icon">
                    <i class="fas fa-comments"></i>
                  </div>
                  <div class="method-details">
                    <h4>Live Chat</h4>
                    <p>Available Monday - Friday<br>
                    9AM - 6PM EST<br>
                    <button class="btn btn-secondary start-chat-btn">Start Chat</button></p>
                  </div>
                </div>
              </div>

              <!-- Business Hours -->
              <div class="business-hours">
                <h3>Business Hours</h3>
                <div class="hours-list">
                  <div class="hours-item">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div class="hours-item">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div class="hours-item">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              <!-- Social Media -->
              <div class="social-media">
                <h3>Follow Us</h3>
                <div class="social-links">
                  <a href="#" class="social-link" aria-label="Facebook">
                    <i class="fab fa-facebook"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Twitter">
                    <i class="fab fa-twitter"></i>
                  </a>
                  <a href="#" class="social-link" aria-label="Pinterest">
                    <i class="fab fa-pinterest"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Section -->
        <section class="map-section" data-animate="slideUp">
          <div class="container">
            <h2 class="text-center">Find Our Showroom</h2>
            <div class="map-container">
              <div class="map-placeholder">
                <div class="map-content">
                  <i class="fas fa-map-marked-alt"></i>
                  <h3>Interactive Map</h3>
                  <p>123 Jewelry District, New York, NY 10013</p>
                  <button class="btn btn-primary get-directions-btn">Get Directions</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section class="faq-section" data-animate="slideUp">
          <div class="container">
            <h2 class="text-center">Frequently Asked Questions</h2>
            <div class="faq-list">
              <div class="faq-item">
                <button class="faq-question">
                  <span>What are your shipping options?</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer">
                  <p>We offer free standard shipping on orders over $100. Express shipping options are available for faster delivery. International shipping is available to most countries.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <button class="faq-question">
                  <span>Do you offer custom jewelry design?</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer">
                  <p>Yes! Our master jewelers can create custom pieces tailored to your specifications. Contact us to discuss your vision and we'll provide a consultation.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <button class="faq-question">
                  <span>What is your return policy?</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer">
                  <p>We offer a 30-day return policy for unworn items in original condition. Custom pieces are final sale unless there's a manufacturing defect.</p>
                </div>
              </div>
              
              <div class="faq-item">
                <button class="faq-question">
                  <span>Do you provide jewelry repair services?</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="faq-answer">
                  <p>Yes, we offer comprehensive repair services for all types of jewelry, whether purchased from us or elsewhere. Contact us for a repair estimate.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  initializeInteractions() {
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // FAQ accordion
    document.querySelectorAll('.faq-question').forEach(question => {
      question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isOpen = faqItem.classList.contains('open');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
          item.classList.remove('open');
        });
        
        // Open clicked item if it wasn't already open
        if (!isOpen) {
          faqItem.classList.add('open');
        }
      });
    });

    // Start chat button
    const startChatBtn = document.querySelector('.start-chat-btn');
    if (startChatBtn) {
      startChatBtn.addEventListener('click', () => {
        // Integrate with your chat system
        alert('Chat feature coming soon! Please use email or phone for now.');
      });
    }

    // Get directions button
    const getDirectionsBtn = document.querySelector('.get-directions-btn');
    if (getDirectionsBtn) {
      getDirectionsBtn.addEventListener('click', () => {
        const address = '123 Jewelry District, New York, NY 10013';
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(mapsUrl, '_blank');
      });
    }

    // Form validation
    this.setupFormValidation();
  }

  setupFormValidation() {
    const form = document.getElementById('contact-form');
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    this.clearFieldError(field);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }

    // Email validation
    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email address';
      }
    }

    // Phone validation
    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        isValid = false;
        errorMessage = 'Please enter a valid phone number';
      }
    }

    // Message length validation
    if (field.name === 'message' && value && value.length < 10) {
      isValid = false;
      errorMessage = 'Message must be at least 10 characters long';
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentElement.querySelector('.field-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'field-error';
      field.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (this.formSubmitted) return;

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Validate all fields
    const inputs = form.querySelectorAll('input, textarea, select');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    submitBtn.disabled = true;
    this.formSubmitted = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message
        form.classList.add('hidden');
        document.getElementById('form-success').classList.remove('hidden');
        
        // Track form submission
        if (window.gtag) {
          window.gtag('event', 'form_submit', {
            event_category: 'Contact',
            event_label: data.subject
          });
        }
      } else {
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('Failed to send message. Please try again or contact us directly.');
      
      // Reset button state
      btnText.classList.remove('hidden');
      btnLoading.classList.add('hidden');
      submitBtn.disabled = false;
      this.formSubmitted = false;
    }
  }
}
