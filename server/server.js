const express = require('express');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const paymentsRoutes = require('./routes/payments');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');
const { securityHeaders, rateLimiters } = require('./middleware/security');
const { csrfProtection, getCsrfToken, csrfErrorHandler } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 5000;

// Session store setup (Redis or Memory)
const useMemoryStore = (process.env.SESSION_STORE || '').toLowerCase() === 'memory';
let sessionStore;
if (useMemoryStore) {
  sessionStore = new session.MemoryStore();
  console.warn('Session store: Using in-memory store (SESSION_STORE=memory). Do not use in production.');
} else {
  const redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379
    },
    password: process.env.REDIS_PASSWORD || undefined
  });
  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message || err);
  });
  // Connect asynchronously (do not block server startup)
  redisClient.connect().catch(() => {
    console.warn('Redis connect failed. Falling back to in-memory session store for this process.');
  });
  sessionStore = new RedisStore({ client: redisClient });
}

// Security middleware
app.use(securityHeaders);

// Cookie parser (required for CSRF)
app.use(cookieParser());

// Rate limiting
app.use('/api/auth', rateLimiters.auth);
app.use('/api/admin/products/*/upload', rateLimiters.upload);
app.use('/api/contact', rateLimiters.contact);
app.use('/api', rateLimiters.api);

// Basic middleware
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', /\.ngrok\.io$/] 
    : ['http://localhost:3000', 'http://127.0.0.1:5500', /\.ngrok\.io$/],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'gravity-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Logging middleware
app.use(logger);

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CSRF token endpoint (must be before CSRF protection)
app.get('/api/csrf-token', getCsrfToken);

// API Routes (public)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentsRoutes);

// CSRF protection for admin routes (state-changing operations)
app.use('/api/admin', csrfProtection);
app.use('/api/admin', adminRoutes);

// Serve frontend files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// CSRF error handling (must be before general error handler)
app.use(csrfErrorHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  redisClient.quit();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  redisClient.quit();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🌌 Gravity Jewelry API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});

// Ensure admin user from .env exists (dev/prod bootstrap)
(async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    const existing = await db('users').where({ email }).first();
    if (!existing) {
      const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 12);
      await db('users').insert({
        email,
        password: hash,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Admin user created from .env');
    } else if (existing.role !== 'admin' || !existing.is_active) {
      await db('users').where({ id: existing.id }).update({ role: 'admin', is_active: true, updated_at: new Date() });
      console.log('✅ Admin user ensured active with admin role');
    }
  } catch (e) {
    console.warn('Admin bootstrap skipped:', e.message || e);
  }
})();
