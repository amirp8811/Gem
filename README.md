# LuxeCraft Jewelry - React Website

A modern jewelry website built with React.js featuring parallax scrolling, liquid glass design, and smooth animations.

## Features

- **Light Theme Design**: Clean, elegant light color scheme
- **Parallax Scrolling**: Smooth parallax effects on images and sections
- **Liquid Glass Morphism**: Modern glass-like UI elements with blur effects
- **Responsive Design**: Works perfectly on all devices
- **Smooth Animations**: Framer Motion powered animations
- **Interactive Elements**: Custom cursor and hover effects
- **Stock Jewelry Images**: High-quality Unsplash images

## Prerequisites

Before running this project, make sure you have Node.js installed on your system:

1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Verify installation by running:
   ```
   node --version
   npm --version
   ```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/
│   ├── Navbar.js & Navbar.css
│   ├── Hero.js & Hero.css
│   ├── Collections.js & Collections.css
│   ├── About.js & About.css
│   ├── Contact.js & Contact.css
│   ├── Footer.js & Footer.css
│   └── CustomCursor.js & CustomCursor.css
├── App.js
├── App.css
├── index.js
└── index.css
```

## Technologies Used

- **React 18**: Modern React with hooks
- **Framer Motion**: Animation library
- **React Intersection Observer**: Scroll-triggered animations
- **CSS3**: Advanced styling with glass morphism
- **Unsplash Images**: High-quality stock photography

## Customization

### Colors
Update the CSS variables in `src/index.css`:
```css
:root {
    --accent-color: #c6a64d; /* Change to your brand color */
    --text-color: #111111;
    --muted-text: #555555;
    --background: #f7f7f7;
}
```

### Images
Replace the Unsplash URLs in the components with your own jewelry images.

### Content
Update the text content in each component file to match your jewelry brand.

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance Notes

- Images are loaded from Unsplash CDN for demo purposes
- For production, consider hosting images locally
- The site uses modern CSS features like backdrop-filter

## License

MIT License - feel free to use this project for your jewelry business!

## Database Setup and Backend Infrastructure

### Overview

The LuxeCraft Jewelry website uses a comprehensive backend infrastructure to manage data and provide a seamless user experience. The database setup is designed to be scalable and secure.

### Database Schema

The database schema consists of the following tables:

- **users**: Customer and admin accounts with roles
- **categories**: Product categories (Rings, Necklaces, Earrings, etc.)
- **products**: Complete product catalog with specifications
- **product_images**: Multiple images per product with primary image
- **orders**: Order management with status tracking
- **order_items**: Individual line items within orders
- **cart_items**: Shopping cart functionality for users
- **reviews**: Product reviews and ratings system
- **site_settings**: Configurable site settings and branding

### API Endpoints

The API provides the following endpoints for data management:

- **Products**
  ```
  GET    /api/products              # List products with filtering & pagination
  GET    /api/products/:slug        # Get single product details
  GET    /api/products/featured/list # Get featured products
  GET    /api/products/:id/related  # Get related products
  ```

- **Categories**
  ```
  GET    /api/categories            # List all categories
  GET    /api/categories/:slug      # Get category with products
  ```

- **Shopping Cart**
  ```
  POST   /api/cart/add             # Add item to cart
  GET    /api/cart                 # Get cart contents
  PUT    /api/cart/:id             # Update cart item
  DELETE /api/cart/:id             # Remove cart item
  ```

- **Orders**
  ```
  POST   /api/orders               # Create new order
  GET    /api/orders               # Get user orders
  GET    /api/orders/:id           # Get order details
  PUT    /api/orders/:id/status    # Update order status (admin)
  ```

- **Authentication**
  ```
  POST   /api/auth/register        # User registration
  POST   /api/auth/login           # User login
  POST   /api/auth/logout          # User logout
  GET    /api/auth/profile         # Get user profile
  ```

### Security Features

- **JWT Authentication**: Secure token-based auth
- **Session Management**: Redis-backed with auto-timeout
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Comprehensive sanitization
- **CORS Protection**: Configured security policies
- **Helmet Security**: Security headers and CSP
- **Password Hashing**: bcrypt encryption
- **Activity Monitoring**: Admin panel security

### Deployment

- **Production Setup**
  1. **Environment Configuration**
  ```bash
  NODE_ENV=production
  DB_HOST=your-production-db-host
  STRIPE_SECRET_KEY=sk_live_your_live_key
  JWT_SECRET=your-super-secure-jwt-secret
  ```
  2. **Database Migration**
  ```bash
  npm run migrate
  ```
  3. **Start Production Server**
  ```bash
  npm start
  ```

- **Docker Deployment**
  ```bash
  docker build -t gravity-jewelry .
  docker run -p 5000:5000 --env-file .env gravity-jewelry
  ```

### Development

- **Available Scripts**
  ```bash
  npm run dev         # Start development server with nodemon
  npm run start       # Start production server
  npm run setup-db    # Initialize database and run migrations
  npm run seed-db     # Populate database with sample data
  npm run migrate     # Run database migrations
  npm run rollback    # Rollback last migration
  npm test           # Run test suite
  ```

- **Project Structure**
  ```
  gravity-jewelry-marketplace/
  ├── server/
  │   ├── config/          # Database and app configuration
  │   ├── migrations/      # Database schema migrations
  │   ├── seeds/          # Sample data for development
  │   ├── routes/         # API route handlers
  │   ├── middleware/     # Custom middleware
  │   ├── scripts/        # Setup and utility scripts
  │   └── server.js       # Main application entry point
  ├── admin.html          # Admin panel interface
  ├── index.html          # Main website
  └── README.md          # This file
  ```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

MIT License - see [LICENSE](LICENSE) file for details.

### Support

- **Email**: support@gravity-jewelry.com
- **Documentation**: [API Docs](docs/api.md)
- **Issues**: [GitHub Issues](issues)
- **Discord**: [Community Chat](discord-link)

---

**Made with 💎 by the Gravity Team**!
