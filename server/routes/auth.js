const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const router = express.Router();

// Rate limiting for auth endpoints
const isProd = process.env.NODE_ENV === 'production';
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProd ? 5 : 50, // relax in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !isProd && (req.ip === '::1' || req.ip === '127.0.0.1'),
});

// Admin login endpoint
router.post('/admin/login', authLimiter, [
  body('username').trim().isEmail().normalizeEmail(),
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
    let admin = null;
    try {
      admin = await db('users')
        .where({ email: username, role: 'admin', is_active: true })
        .first();
    } catch (e) {
      // DB unavailable – fall through to env-based dev login below
    }

    let valid = false;
    if (admin && admin.password) {
      valid = await bcrypt.compare(password, admin.password);
    }

    // Dev fallback: allow env ADMIN_EMAIL/ADMIN_PASSWORD when DB is unavailable or user missing
    if (!valid) {
      const envEmail = process.env.ADMIN_EMAIL;
      const envPass = process.env.ADMIN_PASSWORD;
      if (!isProd && envEmail && envPass && username === envEmail && password === envPass) {
        admin = { id: -1, email: envEmail, role: 'admin' };
        valid = true;
      }
    }

    if (!valid) {
      console.log(`Failed admin login attempt for: ${username} from IP: ${req.ip}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
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

// Admin logout endpoint
router.post('/admin/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify admin session
router.get('/verify', async (req, res) => {
  try {
    const token = req.cookies.adminToken;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db('users')
      .where({ id: decoded.id, role: 'admin', is_active: true })
      .first();

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
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
});

module.exports = router;
