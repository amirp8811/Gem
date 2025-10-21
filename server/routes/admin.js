const express = require('express');
const db = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');
const { validationSchemas, validateId } = require('../middleware/validation');
const { uploadConfigs } = require('../middleware/upload');
const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateAdmin);

// Dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    // Get real metrics from database
    const [
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      recentOrders
    ] = await Promise.all([
      // Total revenue
      db('orders')
        .where('status', '!=', 'cancelled')
        .sum('total_amount as total')
        .first(),
      
      // Total orders
      db('orders').count('* as count').first(),
      
      // Total products
      db('products').where('is_active', true).count('* as count').first(),
      
      // Total customers
      db('users').where('role', 'customer').count('* as count').first(),
      
      // Recent orders
      db('orders')
        .select('*')
        .orderBy('created_at', 'desc')
        .limit(10)
    ]);

    // Calculate monthly growth (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      lastMonthRevenue,
      lastMonthOrders,
      lastMonthCustomers
    ] = await Promise.all([
      db('orders')
        .where('created_at', '>=', lastMonth)
        .where('status', '!=', 'cancelled')
        .sum('total_amount as total')
        .first(),
      
      db('orders')
        .where('created_at', '>=', lastMonth)
        .count('* as count')
        .first(),
      
      db('users')
        .where('created_at', '>=', lastMonth)
        .where('role', 'customer')
        .count('* as count')
        .first()
    ]);

    res.json({
      success: true,
      metrics: {
        revenue: {
          total: totalRevenue.total || 0,
          lastMonth: lastMonthRevenue.total || 0,
          growth: calculateGrowth(totalRevenue.total, lastMonthRevenue.total)
        },
        orders: {
          total: totalOrders.count || 0,
          lastMonth: lastMonthOrders.count || 0,
          growth: calculateGrowth(totalOrders.count, lastMonthOrders.count)
        },
        products: {
          total: totalProducts.count || 0
        },
        customers: {
          total: totalCustomers.count || 0,
          lastMonth: lastMonthCustomers.count || 0,
          growth: calculateGrowth(totalCustomers.count, lastMonthCustomers.count)
        }
      },
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load dashboard data' 
    });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = db('orders')
      .select(
        'orders.*',
        'users.first_name',
        'users.last_name',
        'users.email'
      )
      .leftJoin('users', 'orders.user_id', 'users.id')
      .orderBy('orders.created_at', 'desc');

    if (status) {
      query = query.where('orders.status', status);
    }

    const [orders, totalCount] = await Promise.all([
      query.limit(limit).offset(offset),
      db('orders').count('* as count').first()
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Update order status
router.put('/orders/:id/status', [
  ...validateId(),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid status value')
], async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const order = await db('orders').where('id', id).first();
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    await db('orders')
      .where('id', id)
      .update({ 
        status,
        ...(status === 'shipped' && { shipped_at: new Date() }),
        ...(status === 'delivered' && { delivered_at: new Date() })
      });

    res.json({ 
      success: true, 
      message: 'Order status updated successfully' 
    });
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Get all products for admin
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      db('products')
        .select(
          'products.*',
          'categories.name as category_name'
        )
        .leftJoin('categories', 'products.category_id', 'categories.id')
        .orderBy('products.created_at', 'desc')
        .limit(limit)
        .offset(offset),
      
      db('products').count('* as count').first()
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products' 
    });
  }
});

// Create new product
router.post('/products', validationSchemas.product, async (req, res) => {
  try {

    const productData = {
      ...req.body,
      slug: generateSlug(req.body.name),
      created_at: new Date(),
      updated_at: new Date()
    };

    const [productId] = await db('products').insert(productData);

    res.status(201).json({ 
      success: true, 
      message: 'Product created successfully',
      productId 
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create product' 
    });
  }
});

// Update product
router.put('/products/:id', [...validateId(), ...validationSchemas.product], async (req, res) => {
  try {

    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    if (req.body.name) {
      updateData.slug = generateSlug(req.body.name);
    }

    const updated = await db('products')
      .where('id', id)
      .update(updateData);

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product' 
    });
  }
});

// Delete product
router.delete('/products/:id', validateId(), async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await db('products')
      .where('id', id)
      .del();

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product' 
    });
  }
});

// Upload product images
router.post('/products/:id/images', 
  validateId(),
  uploadConfigs.productImages.middleware,
  uploadConfigs.productImages.processing,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify product exists
      const product = await db('products').where('id', id).first();
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (!req.processedFiles || req.processedFiles.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Insert image records
      const imageRecords = req.processedFiles.map((file, index) => ({
        product_id: id,
        image_url: file.url,
        alt_text: req.body.alt_text || `${product.name} - Image ${index + 1}`,
        sort_order: index,
        is_primary: index === 0, // First image is primary
        created_at: new Date(),
        updated_at: new Date()
      }));

      await db('product_images').insert(imageRecords);

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        images: req.processedFiles
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images'
      });
    }
  }
);

// Delete product image
router.delete('/products/:productId/images/:imageId', 
  validateId('productId'),
  validateId('imageId'),
  async (req, res) => {
    try {
      const { productId, imageId } = req.params;

      const deleted = await db('product_images')
        .where('id', imageId)
        .where('product_id', productId)
        .del();

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Image not found'
        });
      }

      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Image deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  }
);

// Helper function to calculate growth percentage
function calculateGrowth(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous * 100).toFixed(1);
}

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

module.exports = router;
