const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  },
  // Custom error handler
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    // Check multiple sources for CSRF token
    return req.body._csrf ||
           req.query._csrf ||
           req.headers['x-csrf-token'] ||
           req.headers['x-xsrf-token'];
  }
});

// Rate limiting for CSRF token requests
const csrfTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 token requests per windowMs
  message: {
    success: false,
    message: 'Too many CSRF token requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF token endpoint
const getCsrfToken = [csrfTokenLimiter, csrfProtection, (req, res) => {
  res.json({ 
    success: true,
    csrfToken: req.csrfToken(),
    expires: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
  });
}];

// CSRF error handler
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // Log CSRF attack attempt
    console.warn('CSRF Attack Attempt:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  next(err);
};

module.exports = {
  csrfProtection,
  getCsrfToken,
  csrfErrorHandler
};
