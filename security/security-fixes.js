// 🔒 SECURITY FIXES FOR GRAVITY JEWELRY MARKETPLACE
// This file contains code examples to fix the identified vulnerabilities

// =============================================================================
// FIX 1: SERVER-SIDE AUTHENTICATION (CRITICAL)
// =============================================================================

// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin login endpoint
router.post('/admin/login', authLimiter, [
  body('username').trim().isLength({ min: 1 }).escape(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input data' 
      });
    }

    const { username, password } = req.body;

    // Get admin user from database
    const admin = await db('users')
      .where({ email: username, role: 'admin', is_active: true })
      .first();

    if (!admin || !await bcrypt.compare(password, admin.password)) {
      // Log failed attempt
      console.log(`Failed admin login attempt for: ${username} from IP: ${req.ip}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        role: admin.role,
        email: admin.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Update last login
    await db('users')
      .where({ id: admin.id })
      .update({ last_login: new Date() });

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// =============================================================================
// FIX 2: AUTHENTICATION MIDDLEWARE (CRITICAL)
// =============================================================================

// server/middleware/auth.js
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied - No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db('users')
      .where({ id: decoded.id, role: 'admin', is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied - Invalid token' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// =============================================================================
// FIX 3: CSRF PROTECTION (HIGH)
// =============================================================================

// server/middleware/csrf.js
const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF token endpoint
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// =============================================================================
// FIX 4: INPUT VALIDATION (HIGH)
// =============================================================================

// server/middleware/validation.js
const { body, param, query } = require('express-validator');
const createDOMPurify = require('isomorphic-dompurify');

// Product validation
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters')
    .customSanitizer(value => createDOMPurify.sanitize(value)),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters')
    .customSanitizer(value => createDOMPurify.sanitize(value)),
  
  body('price')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be a valid amount between 0.01 and 999999.99'),
  
  body('category_id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a valid integer'),
  
  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// =============================================================================
// FIX 5: SECURE FILE UPLOAD (HIGH)
// =============================================================================

// server/middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific image types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// =============================================================================
// FIX 6: SECURITY HEADERS (MEDIUM)
// =============================================================================

// server/middleware/security.js
const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
});

// =============================================================================
// FIX 7: RATE LIMITING (MEDIUM)
// =============================================================================

// server/middleware/rateLimiting.js
const rateLimit = require('express-rate-limit');

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.round(15 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for sensitive operations
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many attempts, please try again later.',
    retryAfter: Math.round(15 * 60 * 1000 / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================================================
// FIX 8: SECURE SESSION MANAGEMENT (MEDIUM)
// =============================================================================

// server/middleware/session.js
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'gravity.sid', // Change default session name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  genid: () => {
    return crypto.randomBytes(32).toString('hex');
  }
};

// =============================================================================
// FIX 9: LOGGING AND MONITORING (INFORMATIONAL)
// =============================================================================

// server/middleware/logging.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'gravity-jewelry' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Security event logging
const logSecurityEvent = (event, details, req) => {
  logger.warn('Security Event', {
    event,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method
  });
};

// =============================================================================
// FIX 10: ERROR HANDLING (MEDIUM)
// =============================================================================

// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Application Error', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }

  // Development error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    stack: err.stack
  });
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

// Apply middleware to Express app
/*
const express = require('express');
const app = express();

// Security headers
app.use(securityHeaders);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', strictLimiter);

// Session management
app.use(sessionConfig);

// CSRF protection for state-changing operations
app.use('/api/admin/', csrfProtection);

// Authentication for admin routes
app.use('/api/admin/', authenticateAdmin);

// File upload with security
app.post('/api/admin/products/:id/images', 
  authenticateAdmin, 
  upload.array('images', 5), 
  validateProduct, 
  productController.uploadImages
);

// Error handling (must be last)
app.use(errorHandler);
*/

module.exports = {
  authenticateAdmin,
  csrfProtection,
  validateProduct,
  upload,
  securityHeaders,
  apiLimiter,
  strictLimiter,
  sessionConfig,
  logger,
  logSecurityEvent,
  errorHandler
};
