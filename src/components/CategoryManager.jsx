import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Palette } from 'lucide-react';

const CategoryManager = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#3b82f6'
  });
  const [errors, setErrors] = useState({});

  const predefinedColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e',
    '#64748b', '#374151', '#6b7280', '#9ca3af'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    }

    // Check if category name already exists
    const existingCategory = categories.find(c => 
      c.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      c.type === formData.type &&
      (!editingCategory || c.id !== editingCategory.id)
    );
    
    if (existingCategory) {
      newErrors.name = 'Category name already exists for this type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const categoryData = {
        ...formData,
        name: formData.name.trim()
      };

      if (editingCategory) {
        onUpdateCategory(editingCategory.id, categoryData);
      } else {
        onAddCategory(categoryData);
      }

      setFormData({
        name: '',
        type: 'expense',
        color: '#3b82f6'
      });
      setShowForm(false);
      setEditingCategory(null);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: '#3b82f6'
    });
    setShowForm(false);
    setEditingCategory(null);
    setErrors({});
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Category Manager</h2>
          <p className="text-gray-600">Organize your transactions with custom categories</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        )}
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Color *
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Tag className="h-4 w-4" />
                <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expense Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <Tag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
              <p className="text-sm text-gray-600">{expenseCategories.length} categories</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {expenseCategories.length > 0 ? (
              expenseCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No expense categories yet</p>
            )}
          </div>
        </div>

        {/* Income Categories */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-2 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Income Categories</h3>
              <p className="text-sm text-gray-600">{incomeCategories.length} categories</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {incomeCategories.length > 0 ? (
              incomeCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No income categories yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{expenseCategories.length}</div>
            <div className="text-sm text-gray-600">Expense Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{incomeCategories.length}</div>
            <div className="text-sm text-gray-600">Income Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(categories.map(c => c.color)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Colors</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;