const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationSchemas, validatePagination, validateId } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');
const { uploadConfigs } = require('../middleware/upload');

// Get all products with filtering and pagination
router.get('/', validationSchemas.search, async (req, res) => {
  try {

    const {
      page = 1,
      limit = 12,
      category,
      material,
      gemstone,
      min_price,
      max_price,
      search,
      sort = 'created_at'
    } = req.query;

    const offset = (page - 1) * limit;

    let query = db('products')
      .select(
        'products.*',
        'categories.name as category_name',
        'categories.slug as category_slug',
        db.raw('(SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as primary_image')
      )
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.is_active', true);

    // Apply filters
    if (category) {
      query = query.where('categories.slug', category);
    }
    if (material) {
      query = query.where('products.material', material);
    }
    if (gemstone) {
      query = query.where('products.gemstone', gemstone);
    }
    if (min_price) {
      query = query.where('products.price', '>=', min_price);
    }
    if (max_price) {
      query = query.where('products.price', '<=', max_price);
    }
    if (search) {
      query = query.where(function() {
        this.where('products.name', 'like', `%${search}%`)
            .orWhere('products.description', 'like', `%${search}%`)
            .orWhere('products.short_description', 'like', `%${search}%`);
      });
    }

    // Apply sorting
    const sortOrder = req.query.order === 'desc' ? 'desc' : 'asc';
    query = query.orderBy(`products.${sort}`, sortOrder);

    // Get total count for pagination
    const totalQuery = query.clone().clearSelect().clearOrder().count('* as total');
    const [{ total }] = await totalQuery;

    // Apply pagination
    const products = await query.limit(limit).offset(offset);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await db('products')
      .select(
        'products.*',
        'categories.name as category_name',
        'categories.slug as category_slug'
      )
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.slug', slug)
      .where('products.is_active', true)
      .first();

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get product images
    const images = await db('product_images')
      .where('product_id', product.id)
      .orderBy('sort_order');

    // Get product reviews
    const reviews = await db('reviews')
      .where('product_id', product.id)
      .where('is_approved', true)
      .orderBy('created_at', 'desc');

    // Increment view count
    await db('products')
      .where('id', product.id)
      .increment('views_count', 1);

    res.json({
      ...product,
      images,
      reviews
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await db('products')
      .select(
        'products.*',
        'categories.name as category_name',
        db.raw('(SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as primary_image')
      )
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.is_featured', true)
      .where('products.is_active', true)
      .orderBy('products.created_at', 'desc')
      .limit(8);

    res.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get related products
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the current product to find related ones
    const currentProduct = await db('products')
      .where('id', id)
      .first();

    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const relatedProducts = await db('products')
      .select(
        'products.*',
        'categories.name as category_name',
        db.raw('(SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as primary_image')
      )
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .where('products.category_id', currentProduct.category_id)
      .where('products.id', '!=', id)
      .where('products.is_active', true)
      .orderBy('products.created_at', 'desc')
      .limit(4);

    res.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
