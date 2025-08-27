const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get user categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    
    const filter = { user: req.user.id, isActive: true };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ name: 1 });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', auth, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('color')
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, type, color, icon, description } = req.body;

    // Check if category with same name and type already exists for user
    const existingCategory = await Category.findOne({
      user: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      type,
      isActive: true
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'Category with this name already exists for this type' 
      });
    }

    const category = new Category({
      user: req.user.id,
      name,
      type,
      color,
      icon: icon || 'tag',
      description: description || ''
    });

    await category.save();

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private
router.put('/:id', auth, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category name must be between 1 and 50 characters'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updates = req.body;

    // Check for duplicate name if name is being updated
    if (updates.name && updates.name !== category.name) {
      const existingCategory = await Category.findOne({
        user: req.user.id,
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        type: category.type,
        isActive: true,
        _id: { $ne: category._id }
      });

      if (existingCategory) {
        return res.status(400).json({ 
          message: 'Category with this name already exists for this type' 
        });
      }
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'type') { // Don't allow type changes
        category[key] = updates[key];
      }
    });

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is being used in transactions
    const transactionCount = await Transaction.countDocuments({
      user: req.user.id,
      category: category._id
    });

    if (transactionCount > 0) {
      // Soft delete - mark as inactive
      category.isActive = false;
      await category.save();
      
      return res.json({ 
        message: 'Category deactivated successfully (has associated transactions)',
        category
      });
    } else {
      // Hard delete if no transactions
      await Category.findByIdAndDelete(category._id);
      return res.json({ message: 'Category deleted successfully' });
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/categories/:id/stats
// @desc    Get category usage statistics
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          category: category._id
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]);

    const result = stats[0] || {
      totalAmount: 0,
      transactionCount: 0,
      avgAmount: 0,
      minAmount: 0,
      maxAmount: 0
    };

    res.json({
      category: {
        id: category._id,
        name: category.name,
        type: category.type,
        color: category.color
      },
      stats: result
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;