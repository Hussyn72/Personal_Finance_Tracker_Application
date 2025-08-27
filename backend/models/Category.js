const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Category type is required']
  },
  color: {
    type: String,
    required: [true, 'Category color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  icon: {
    type: String,
    default: 'tag'
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  budget: {
    monthly: {
      type: Number,
      min: 0
    },
    yearly: {
      type: Number,
      min: 0
    }
  }
}, {
  timestamps: true
});

// Compound index to ensure unique category names per user and type
categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);