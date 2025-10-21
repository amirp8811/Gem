// ℹ️ ABOUT PAGE COMPONENT
export default class AboutPage {
  async render() {
    const main = document.getElementById('main-content');
    
    main.innerHTML = this.getHTML();
    this.initializeInteractions();
    
    // Update page title
    document.title = 'About Us - Gravity Jewelry';
  }

  getHTML() {
    return `
      <div class="about-page">
        <!-- Hero Section -->
        <section class="about-hero" data-animate="fadeIn">
          <div class="container">
            <div class="hero-content">
              <h1>Our Story</h1>
              <p class="hero-subtitle">Crafting timeless elegance since 1995</p>
            </div>
          </div>
        </section>

        <!-- Our Story -->
        <section class="our-story" data-animate="slideUp">
          <div class="container">
            <div class="story-content grid grid-2">
              <div class="story-text">
                <h2>The Gravity Legacy</h2>
                <p>Founded in 1995 by master jeweler Elena Gravity, our brand has been synonymous with exceptional craftsmanship and timeless design for over two decades.</p>
                <p>What started as a small workshop in the heart of the jewelry district has grown into a globally recognized brand, yet we've never lost sight of our core values: quality, authenticity, and the belief that every piece of jewelry tells a story.</p>
                <p>Each piece in our collection is meticulously handcrafted by skilled artisans who share our passion for excellence. We source only the finest materials and employ traditional techniques passed down through generations.</p>
              </div>
              <div class="story-image">
                <img src="/assets/images/about-story.jpg" alt="Elena Gravity in her workshop" loading="lazy">
              </div>
            </div>
          </div>
        </section>

        <!-- Values -->
        <section class="our-values" data-animate="slideUp">
          <div class="container">
            <h2 class="text-center">Our Values</h2>
            <div class="values-grid grid grid-3">
              <div class="value-card text-center">
                <div class="value-icon">
                  <i class="fas fa-gem"></i>
                </div>
                <h3>Quality First</h3>
                <p>We never compromise on quality. Every piece undergoes rigorous quality control to ensure it meets our exacting standards.</p>
              </div>
              <div class="value-card text-center">
                <div class="value-icon">
                  <i class="fas fa-leaf"></i>
                </div>
                <h3>Sustainability</h3>
                <p>We're committed to ethical sourcing and sustainable practices, ensuring our beautiful jewelry doesn't come at the cost of our planet.</p>
              </div>
              <div class="value-card text-center">
                <div class="value-icon">
                  <i class="fas fa-heart"></i>
                </div>
                <h3>Customer Care</h3>
                <p>Your satisfaction is our priority. We provide exceptional service and support throughout your jewelry journey with us.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Team -->
        <section class="our-team" data-animate="slideUp">
          <div class="container">
            <h2 class="text-center">Meet Our Team</h2>
            <div class="team-grid grid grid-3">
              <div class="team-member">
                <img src="/assets/images/team-elena.jpg" alt="Elena Gravity" loading="lazy">
                <h3>Elena Gravity</h3>
                <p class="role">Founder & Master Jeweler</p>
                <p>With over 30 years of experience, Elena's vision and expertise continue to guide our brand's direction.</p>
              </div>
              <div class="team-member">
                <img src="/assets/images/team-marcus.jpg" alt="Marcus Chen" loading="lazy">
                <h3>Marcus Chen</h3>
                <p class="role">Head of Design</p>
                <p>Marcus brings contemporary flair to our classic designs, ensuring each piece resonates with modern sensibilities.</p>
              </div>
              <div class="team-member">
                <img src="/assets/images/team-sophia.jpg" alt="Sophia Rodriguez" loading="lazy">
                <h3>Sophia Rodriguez</h3>
                <p class="role">Quality Assurance Director</p>
                <p>Sophia ensures every piece that leaves our workshop meets the highest standards of craftsmanship and beauty.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Certifications -->
        <section class="certifications" data-animate="slideUp">
          <div class="container">
            <h2 class="text-center">Certifications & Awards</h2>
            <div class="certifications-grid grid grid-4">
              <div class="certification">
                <img src="/assets/images/cert-responsible-jewelry.png" alt="Responsible Jewelry Council" loading="lazy">
                <h4>Responsible Jewelry Council</h4>
              </div>
              <div class="certification">
                <img src="/assets/images/cert-kimberley.png" alt="Kimberley Process" loading="lazy">
                <h4>Kimberley Process Certified</h4>
              </div>
              <div class="certification">
                <img src="/assets/images/cert-fairmined.png" alt="Fairmined Gold" loading="lazy">
                <h4>Fairmined Gold Partner</h4>
              </div>
              <div class="certification">
                <img src="/assets/images/cert-jewelry-award.png" alt="Jewelry Excellence Award" loading="lazy">
                <h4>Excellence in Jewelry 2024</h4>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="about-cta" data-animate="fadeIn">
          <div class="container text-center">
            <h2>Experience the Gravity Difference</h2>
            <p>Discover our collection of handcrafted jewelry that tells your unique story.</p>
            <div class="cta-actions">
              <a href="/products" class="btn btn-primary" data-route>Shop Collection</a>
              <a href="/contact" class="btn btn-secondary" data-route>Get in Touch</a>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  initializeInteractions() {
    // Add any specific interactions for the about page
    console.log('About page interactions initialized');
  }
}
