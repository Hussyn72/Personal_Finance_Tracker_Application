const express = require('express');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/summary
// @desc    Get financial summary
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = { user: req.user.id };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
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

    summary.forEach(item => {
      result[item._id] = {
        total: item.total,
        count: item.count,
        avgAmount: item.avgAmount
      };
    });

    result.balance = result.income.total - result.expense.total;
    result.totalTransactions = result.income.count + result.expense.count;

    res.json(result);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/category-breakdown
// @desc    Get expense breakdown by category
// @access  Private
router.get('/category-breakdown', auth, async (req, res) => {
  try {
    const { startDate, endDate, type = 'expense' } = req.query;
    
    const filter = { user: req.user.id, type };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$category',
          name: { $first: '$categoryInfo.name' },
          color: { $first: '$categoryInfo.color' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(breakdown);
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/monthly-trends
// @desc    Get monthly financial trends
// @access  Private
router.get('/monthly-trends', auth, async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const trends = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$total', 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$total', 0]
            }
          },
          incomeCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'income'] }, '$count', 0]
            }
          },
          expenseCount: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', 'expense'] }, '$count', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing months with zero values
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const result = monthNames.map((month, index) => {
      const monthData = trends.find(t => t._id === index + 1);
      return {
        month,
        income: monthData?.income || 0,
        expense: monthData?.expense || 0,
        balance: (monthData?.income || 0) - (monthData?.expense || 0),
        incomeCount: monthData?.incomeCount || 0,
        expenseCount: monthData?.expenseCount || 0
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;