const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0.01, 'Budget amount must be greater than 0']
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  alertThresholds: {
    warning: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    },
    critical: {
      type: Number,
      default: 95,
      min: 0,
      max: 100
    }
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    lastWarningAlert: Date,
    lastCriticalAlert: Date,
    lastExceededAlert: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
budgetSchema.index({ user: 1, category: 1, period: 1 });
budgetSchema.index({ user: 1, startDate: 1, endDate: 1 });

// Virtual for remaining budget
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Virtual for percentage used
budgetSchema.virtual('percentageUsed').get(function() {
  return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
});

// Virtual for status
budgetSchema.virtual('status').get(function() {
  const percentage = this.percentageUsed;
  if (percentage >= 100) return 'exceeded';
  if (percentage >= this.alertThresholds.critical) return 'critical';
  if (percentage >= this.alertThresholds.warning) return 'warning';
  return 'good';
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema);