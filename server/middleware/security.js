const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Comprehensive security headers
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", // Required for inline styles
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts - remove in production
        "https://js.stripe.com"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:",
        "https://images.unsplash.com" // For demo images
      ],
      connectSrc: [
        "'self'", 
        "https://api.stripe.com",
        "https://checkout.stripe.com"
      ],
      frameSrc: [
        "https://js.stripe.com",
        "https://hooks.stripe.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      childSrc: ["'none'"],
      workerSrc: ["'none'"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    },
    reportOnly: false
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-Frame-Options
  frameguard: { 
    action: 'deny' 
  },

  // X-XSS-Protection
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: { 
    policy: 'strict-origin-when-cross-origin' 
  },

  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: false,

  // X-Download-Options
  ieNoOpen: true,

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: { 
    allow: false 
  },

  // Expect-CT
  expectCt: {
    maxAge: 86400, // 24 hours
    enforce: process.env.NODE_ENV === 'production'
  }
});

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      retryAfter: Math.round(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests in counting
    skipSuccessfulRequests: false,
    // Skip failed requests in counting
    skipFailedRequests: false,
    // Custom key generator (can be used for user-based limiting)
    keyGenerator: (req) => {
      return req.ip;
    }
  });
};

// Different rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiting
  api: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many API requests from this IP, please try again later.'
  ),

  // Strict rate limiting for authentication
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts per window
    'Too many authentication attempts, please try again later.'
  ),

  // File upload rate limiting
  upload: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    20, // 20 uploads per hour
    'Too many file uploads, please try again later.'
  ),

  // Password reset rate limiting
  passwordReset: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3, // 3 attempts per hour
    'Too many password reset attempts, please try again later.'
  ),

  // Contact form rate limiting
  contact: createRateLimiter(
    60 * 60 * 1000, // 1 hour
    5, // 5 messages per hour
    'Too many contact form submissions, please try again later.'
  )
};

// Security middleware for sensitive operations
const sensitiveOperationSecurity = (req, res, next) => {
  // Add additional headers for sensitive operations
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
};

// IP whitelist middleware (for admin operations)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && allowedIPs.length > 0) {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!allowedIPs.includes(clientIP)) {
        console.warn('Blocked IP attempt:', {
          ip: clientIP,
          url: req.originalUrl,
          userAgent: req.get('User-Agent'),
          timestamp: new Date().toISOString()
        });
        
        return res.status(403).json({
          success: false,
          message: 'Access denied from this IP address'
        });
      }
    }
    
    next();
  };
};

// Security event logger
const logSecurityEvent = (event, details, req) => {
  console.warn('Security Event:', {
    event,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.get('Origin'),
      referer: req.get('Referer'),
      'x-forwarded-for': req.get('X-Forwarded-For')
    }
  });
};

module.exports = {
  securityHeaders,
  rateLimiters,
  sensitiveOperationSecurity,
  ipWhitelist,
  logSecurityEvent
};
