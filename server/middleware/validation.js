const { body, param, query, validationResult } = require('express-validator');
const validator = require('validator');

// Custom sanitizer for HTML content (server-safe, no DOM/JS)
const sanitizeHtml = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Custom validator for strong passwords
const isStrongPassword = (value) => {
  return validator.isStrongPassword(value, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
};

// Custom validator for safe filenames
const isSafeFilename = (value) => {
  if (!value) return true;
  // Allow only alphanumeric, hyphens, underscores, and dots
  return /^[a-zA-Z0-9._-]+$/.test(value) && !value.includes('..');
};

// Custom validator for URLs
const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Common validation rules
const commonValidations = {
  email: () => body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .custom(isStrongPassword)
    .withMessage('Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol'),

  name: (fieldName) => body(fieldName)
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(`${fieldName} must be between 1 and 100 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${fieldName} can only contain letters, spaces, hyphens, and apostrophes`)
    .customSanitizer(sanitizeHtml),

  id: (paramName = 'id') => param(paramName)
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),

  slug: (fieldName) => body(fieldName)
    .optional()
    .isSlug()
    .withMessage('Slug must be URL-friendly')
    .isLength({ max: 255 })
    .withMessage('Slug must not exceed 255 characters'),

  url: (fieldName) => body(fieldName)
    .optional()
    .custom(isValidUrl)
    .withMessage('Must be a valid HTTP/HTTPS URL')
    .isLength({ max: 500 })
    .withMessage('URL must not exceed 500 characters'),

  text: (fieldName, maxLength = 5000) => body(fieldName)
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${fieldName} must not exceed ${maxLength} characters`)
    .customSanitizer(sanitizeHtml),

  price: body('price')
    .isFloat({ min: 0.01, max: 999999.99 })
    .withMessage('Price must be between 0.01 and 999,999.99')
    .toFloat(),

  quantity: (fieldName) => body(fieldName)
    .isInt({ min: 0, max: 999999 })
    .withMessage(`${fieldName} must be between 0 and 999,999`)
    .toInt(),

  phone: body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
    .customSanitizer(value => value ? validator.escape(value) : value),

  date: (fieldName) => body(fieldName)
    .optional()
    .isISO8601()
    .withMessage(`${fieldName} must be a valid date`)
    .toDate(),

  boolean: (fieldName) => body(fieldName)
    .optional()
    .isBoolean()
    .withMessage(`${fieldName} must be true or false`)
    .toBoolean()
};

// Specific validation schemas
const validationSchemas = {
  // User registration
  userRegistration: [
    commonValidations.email(),
    commonValidations.password,
    commonValidations.name('first_name'),
    commonValidations.name('last_name'),
    commonValidations.phone,
    handleValidationErrors
  ],

  // User login
  userLogin: [
    commonValidations.email(),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  // Password reset
  passwordReset: [
    commonValidations.email(),
    handleValidationErrors
  ],

  // Password change
  passwordChange: [
    body('currentPassword')
      .isLength({ min: 1 })
      .withMessage('Current password is required'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match');
        }
        return true;
      }),
    handleValidationErrors
  ],

  // Product creation/update
  product: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Product name must be between 1 and 255 characters')
      .customSanitizer(sanitizeHtml),
    
    commonValidations.text('description', 5000),
    commonValidations.text('short_description', 500),
    commonValidations.price,
    
    body('sku')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('SKU must not exceed 100 characters')
      .matches(/^[a-zA-Z0-9-_]+$/)
      .withMessage('SKU can only contain letters, numbers, hyphens, and underscores'),
    
    commonValidations.quantity('stock_quantity'),
    
    body('category_id')
      .isInt({ min: 1 })
      .withMessage('Category ID must be a positive integer'),
    
    body('material')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Material must not exceed 100 characters')
      .customSanitizer(sanitizeHtml),
    
    body('gemstone')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Gemstone must not exceed 100 characters')
      .customSanitizer(sanitizeHtml),
    
    body('weight')
      .optional()
      .isFloat({ min: 0, max: 99999.99 })
      .withMessage('Weight must be between 0 and 99,999.99')
      .toFloat(),
    
    body('dimensions')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Dimensions must not exceed 100 characters')
      .customSanitizer(sanitizeHtml),
    
    commonValidations.boolean('is_featured'),
    commonValidations.boolean('is_active'),
    commonValidations.boolean('track_inventory'),
    
    handleValidationErrors
  ],

  // Category creation/update
  category: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Category name must be between 1 and 100 characters')
      .customSanitizer(sanitizeHtml),
    
    commonValidations.slug('slug'),
    commonValidations.text('description', 1000),
    
    body('icon')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Icon must not exceed 50 characters'),
    
    commonValidations.url('image_url'),
    
    body('sort_order')
      .optional()
      .isInt({ min: 0, max: 9999 })
      .withMessage('Sort order must be between 0 and 9999')
      .toInt(),
    
    commonValidations.boolean('is_active'),
    
    handleValidationErrors
  ],

  // Order creation
  order: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    
    body('items.*.product_id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    
    body('items.*.quantity')
      .isInt({ min: 1, max: 999 })
      .withMessage('Quantity must be between 1 and 999'),
    
    body('billing_address.first_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name is required')
      .customSanitizer(sanitizeHtml),
    
    body('billing_address.last_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name is required')
      .customSanitizer(sanitizeHtml),
    
    body('billing_address.address_line_1')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Address is required')
      .customSanitizer(sanitizeHtml),
    
    body('billing_address.city')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('City is required')
      .customSanitizer(sanitizeHtml),
    
    body('billing_address.postal_code')
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Postal code is required')
      .customSanitizer(sanitizeHtml),
    
    body('billing_address.country')
      .trim()
      .isLength({ min: 2, max: 2 })
      .withMessage('Country code must be 2 characters')
      .isAlpha()
      .withMessage('Country code must contain only letters'),
    
    body('shipping_address')
      .optional()
      .custom((value, { req }) => {
        if (value && typeof value === 'object') {
          // Validate shipping address if provided
          return true;
        }
        return true;
      }),
    
    handleValidationErrors
  ],

  // Review creation
  review: [
    body('product_id')
      .isInt({ min: 1 })
      .withMessage('Product ID must be a positive integer'),
    
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    
    body('title')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must not exceed 255 characters')
      .customSanitizer(sanitizeHtml),
    
    commonValidations.text('comment', 2000),
    
    body('customer_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Customer name is required')
      .customSanitizer(sanitizeHtml),
    
    commonValidations.email().withMessage('Customer email is required'),
    
    handleValidationErrors
  ],

  // Contact form
  contact: [
    commonValidations.name('name'),
    commonValidations.email(),
    
    body('subject')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Subject is required and must not exceed 255 characters')
      .customSanitizer(sanitizeHtml),
    
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters')
      .customSanitizer(sanitizeHtml),
    
    handleValidationErrors
  ],

  // Search queries
  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Search query must not exceed 255 characters')
      .customSanitizer(sanitizeHtml),
    
    query('category')
      .optional()
      .isSlug()
      .withMessage('Category must be a valid slug'),
    
    query('min_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number')
      .toFloat(),
    
    query('max_price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number')
      .toFloat(),
    
    query('sort')
      .optional()
      .isIn(['name', 'price', 'created_at', 'rating', 'popularity'])
      .withMessage('Invalid sort option'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc'),
    
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be between 1 and 1000')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    
    handleValidationErrors
  ],

  // File upload validation
  fileUpload: [
    body('alt_text')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Alt text must not exceed 255 characters')
      .customSanitizer(sanitizeHtml),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters')
      .customSanitizer(sanitizeHtml),
    
    handleValidationErrors
  ]
};

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  handleValidationErrors
];

// ID parameter validation
const validateId = (paramName = 'id') => [
  commonValidations.id(paramName),
  handleValidationErrors
];

module.exports = {
  validationSchemas,
  commonValidations,
  validatePagination,
  validateId,
  handleValidationErrors,
  sanitizeHtml,
  isStrongPassword,
  isSafeFilename,
  isValidUrl
};
