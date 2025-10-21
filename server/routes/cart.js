const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const { authenticateUser, optionalAuth } = require('../middleware/auth');

// Validation middleware
const validateCartItem = [
  body('product_id')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  
  body('quantity')
    .isInt({ min: 1, max: 999 })
    .withMessage('Quantity must be between 1 and 999'),
  
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

// Get cart contents
router.get('/', optionalAuth, async (req, res) => {
  try {
    let cartItems = [];

    if (req.user) {
      // Authenticated user - get from database
      cartItems = await db('cart_items')
        .select(
          'cart_items.*',
          'products.name',
          'products.price',
          'products.slug',
          'products.stock_quantity',
          db.raw('(SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as image_url')
        )
        .join('products', 'cart_items.product_id', 'products.id')
        .where('cart_items.user_id', req.user.id)
        .where('products.is_active', true);
    } else {
      // Guest user - get from session
      const sessionId = req.sessionID;
      if (sessionId) {
        cartItems = await db('cart_items')
          .select(
            'cart_items.*',
            'products.name',
            'products.price',
            'products.slug',
            'products.stock_quantity',
            db.raw('(SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as image_url')
          )
          .join('products', 'cart_items.product_id', 'products.id')
          .where('cart_items.session_id', sessionId)
          .where('products.is_active', true);
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      cart: {
        items: cartItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        itemCount,
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch cart' 
    });
  }
});

// Add item to cart
router.post('/add', optionalAuth, validateCartItem, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    // Verify product exists and is active
    const product = await db('products')
      .where('id', product_id)
      .where('is_active', true)
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock availability
    if (product.track_inventory && product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const cartData = {
      product_id,
      quantity,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (req.user) {
      cartData.user_id = req.user.id;
      
      // Check if item already exists in cart
      const existingItem = await db('cart_items')
        .where('user_id', req.user.id)
        .where('product_id', product_id)
        .first();

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock for new quantity
        if (product.track_inventory && product.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock for requested quantity'
          });
        }

        await db('cart_items')
          .where('id', existingItem.id)
          .update({ 
            quantity: newQuantity,
            updated_at: new Date()
          });
      } else {
        // Insert new item
        await db('cart_items').insert(cartData);
      }
    } else {
      // Guest user - use session
      cartData.session_id = req.sessionID;
      
      const existingItem = await db('cart_items')
        .where('session_id', req.sessionID)
        .where('product_id', product_id)
        .first();

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.track_inventory && product.stock_quantity < newQuantity) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock for requested quantity'
          });
        }

        await db('cart_items')
          .where('id', existingItem.id)
          .update({ 
            quantity: newQuantity,
            updated_at: new Date()
          });
      } else {
        await db('cart_items').insert(cartData);
      }
    }

    res.json({
      success: true,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add item to cart' 
    });
  }
});

// Update cart item quantity
router.put('/:id', optionalAuth, [
  body('quantity')
    .isInt({ min: 0, max: 999 })
    .withMessage('Quantity must be between 0 and 999'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
], async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Find cart item
    let cartItem;
    if (req.user) {
      cartItem = await db('cart_items')
        .where('id', id)
        .where('user_id', req.user.id)
        .first();
    } else {
      cartItem = await db('cart_items')
        .where('id', id)
        .where('session_id', req.sessionID)
        .first();
    }

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (quantity === 0) {
      // Remove item from cart
      await db('cart_items').where('id', id).del();
      return res.json({
        success: true,
        message: 'Item removed from cart'
      });
    }

    // Check stock availability
    const product = await db('products')
      .where('id', cartItem.product_id)
      .first();

    if (product.track_inventory && product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Update quantity
    await db('cart_items')
      .where('id', id)
      .update({ 
        quantity,
        updated_at: new Date()
      });

    res.json({
      success: true,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Cart update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update cart' 
    });
  }
});

// Remove item from cart
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    let deleted;
    if (req.user) {
      deleted = await db('cart_items')
        .where('id', id)
        .where('user_id', req.user.id)
        .del();
    } else {
      deleted = await db('cart_items')
        .where('id', id)
        .where('session_id', req.sessionID)
        .del();
    }

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Cart item removal error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove item from cart' 
    });
  }
});

// Clear entire cart
router.delete('/', optionalAuth, async (req, res) => {
  try {
    if (req.user) {
      await db('cart_items')
        .where('user_id', req.user.id)
        .del();
    } else {
      await db('cart_items')
        .where('session_id', req.sessionID)
        .del();
    }

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Cart clear error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear cart' 
    });
  }
});

// Merge guest cart with user cart (called after login)
router.post('/merge', authenticateUser, async (req, res) => {
  try {
    const { session_id } = req.body;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    // Get guest cart items
    const guestItems = await db('cart_items')
      .where('session_id', session_id);

    for (const guestItem of guestItems) {
      // Check if user already has this product in cart
      const existingItem = await db('cart_items')
        .where('user_id', req.user.id)
        .where('product_id', guestItem.product_id)
        .first();

      if (existingItem) {
        // Update quantity
        await db('cart_items')
          .where('id', existingItem.id)
          .update({ 
            quantity: existingItem.quantity + guestItem.quantity,
            updated_at: new Date()
          });
      } else {
        // Move guest item to user cart
        await db('cart_items')
          .where('id', guestItem.id)
          .update({
            user_id: req.user.id,
            session_id: null,
            updated_at: new Date()
          });
      }
    }

    // Clean up any remaining guest items
    await db('cart_items')
      .where('session_id', session_id)
      .del();

    res.json({
      success: true,
      message: 'Cart merged successfully'
    });
  } catch (error) {
    console.error('Cart merge error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to merge cart' 
    });
  }
});

module.exports = router;
