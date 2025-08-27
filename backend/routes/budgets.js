const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/budgets
// @desc    Get user budgets
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { period, active } = req.query;
    
    const filter = { user: req.user.id };
    if (period) filter.period = period;
    if (active !== undefined) filter.isActive = active === 'true';

    const budgets = await Budget.find(filter)
      .populate('category', 'name color type')
      .sort({ createdAt: -1 });

    res.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', auth, [
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Budget amount must be greater than 0'),
  body('period')
    .isIn(['weekly', 'monthly', 'yearly'])
    .withMessage('Period must be weekly, monthly, or yearly'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be valid'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category, amount, period, startDate, endDate, alertThresholds, notes } = req.body;

    // Verify category belongs to user and is expense type
    const categoryDoc = await Category.findOne({ 
      _id: category, 
      user: req.user.id,
      type: 'expense',
      isActive: true
    });

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid expense category' });
    }

    // Check if budget already exists for this category and period
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      period,
      isActive: true,
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        }
      ]
    });

    if (existingBudget) {
      return res.status(400).json({ 
        message: 'Budget already exists for this category and period' 
      });
    }

    const budget = new Budget({
      user: req.user.id,
      category,
      amount: parseFloat(amount),
      period,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      alertThresholds: alertThresholds || { warning: 80, critical: 95 },
      notes: notes || ''
    });

    await budget.save();
    await budget.populate('category', 'name color type');

    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', auth, [
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Budget amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const updates = req.body;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'category' && key !== 'period') {
        budget[key] = updates[key];
      }
    });

    await budget.save();
    await budget.populate('category', 'name color type');

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;