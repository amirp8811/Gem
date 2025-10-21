const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationSchemas, validatePagination, validateId } = require('../middleware/validation');
const { authenticateAdmin } = require('../middleware/auth');

// Get all categories (public)
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [categories, totalCount] = await Promise.all([
      db('categories')
        .where('is_active', true)
        .orderBy('sort_order', 'asc')
        .orderBy('name', 'asc')
        .limit(limit)
        .offset(offset),
      
      db('categories')
        .where('is_active', true)
        .count('* as count')
        .first()
    ]);

    res.json({
      success: true,
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit)
      }
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories' 
    });
  }
});

// Get single category by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await db('categories')
      .where('slug', slug)
      .where('is_active', true)
      .first();

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    // Get products in this category
    const products = await db('products')
      .select(
        'products.*',
        db.raw('(SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = 1 LIMIT 1) as primary_image')
      )
      .where('category_id', category.id)
      .where('is_active', true)
      .orderBy('created_at', 'desc')
      .limit(20);

    res.json({
      success: true,
      category,
      products
    });
  } catch (error) {
    console.error('Category fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch category' 
    });
  }
});

// Admin routes (require authentication)
router.use(authenticateAdmin);

// Create category (admin only)
router.post('/', validationSchemas.category, async (req, res) => {
  try {
    const categoryData = {
      ...req.body,
      slug: req.body.slug || generateSlug(req.body.name),
      created_at: new Date(),
      updated_at: new Date()
    };

    // Check if slug already exists
    const existingCategory = await db('categories')
      .where('slug', categoryData.slug)
      .first();

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this slug already exists'
      });
    }

    const [categoryId] = await db('categories').insert(categoryData);

    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully',
      categoryId 
    });
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create category' 
    });
  }
});

// Update category (admin only)
router.put('/:id', [...validateId(), ...validationSchemas.category], async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    if (req.body.name && !req.body.slug) {
      updateData.slug = generateSlug(req.body.name);
    }

    // Check if new slug conflicts with existing categories
    if (updateData.slug) {
      const existingCategory = await db('categories')
        .where('slug', updateData.slug)
        .where('id', '!=', id)
        .first();

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this slug already exists'
        });
      }
    }

    const updated = await db('categories')
      .where('id', id)
      .update(updateData);

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Category updated successfully' 
    });
  } catch (error) {
    console.error('Category update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update category' 
    });
  }
});

// Delete category (admin only)
router.delete('/:id', validateId(), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await db('products')
      .where('category_id', id)
      .count('* as count')
      .first();

    if (productCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products'
      });
    }

    const deleted = await db('categories')
      .where('id', id)
      .del();

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Category not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    console.error('Category deletion error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete category' 
    });
  }
});

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
