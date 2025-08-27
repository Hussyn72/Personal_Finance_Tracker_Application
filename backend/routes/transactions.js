const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/transactions
// @desc    Get user transactions with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      type,
      category,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = { user: req.user.id };
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('category', 'name color type')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: skip + transactions.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be valid')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, amount, description, category, date, tags, paymentMethod, notes } = req.body;

    // Verify category belongs to user and matches transaction type
    const categoryDoc = await Category.findOne({ 
      _id: category, 
      user: req.user.id,
      type: type,
      isActive: true
    });

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category for this transaction type' });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type,
      amount: parseFloat(amount),
      description,
      category,
      date: date ? new Date(date) : new Date(),
      tags: tags || [],
      paymentMethod: paymentMethod || 'other',
      notes: notes || ''
    });

    await transaction.save();
    await transaction.populate('category', 'name color type');

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update a transaction
// @access  Private
router.put('/:id', auth, [
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updates = req.body;
    
    // If category is being updated, verify it
    if (updates.category) {
      const categoryDoc = await Category.findOne({ 
        _id: updates.category, 
        user: req.user.id,
        type: updates.type || transaction.type,
        isActive: true
      });

      if (!categoryDoc) {
        return res.status(400).json({ message: 'Invalid category for this transaction type' });
      }
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        transaction[key] = updates[key];
      }
    });

    await transaction.save();
    await transaction.populate('category', 'name color type');

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/stats
// @desc    Get transaction statistics
// @access  Private
router.get('/stats', auth, [
  query('startDate').optional().isISO8601().withMessage('Start date must be valid'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid')
], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { user: req.user.id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const result = {
      income: { total: 0, count: 0, avgAmount: 0 },
      expense: { total: 0, count: 0, avgAmount: 0 }
    };

    stats.forEach(stat => {
      result[stat._id] = {
        total: stat.total,
        count: stat.count,
        avgAmount: stat.avgAmount
      };
    });

    result.balance = result.income.total - result.expense.total;
    result.totalTransactions = result.income.count + result.expense.count;

    res.json(result);
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;