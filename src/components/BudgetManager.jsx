import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const BudgetManager = ({ budgets, categories, transactions, onAddBudget, onUpdateBudget, onDeleteBudget }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly'
  });
  const [errors, setErrors] = useState({});

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
  });

  const budgetStatus = budgets.map(budget => {
    const spent = currentMonthTransactions
      .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const category = categories.find(c => c.id === budget.categoryId);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      spent,
      remaining: budget.amount - spent,
      percentage,
      categoryName: category?.name || 'Unknown',
      categoryColor: category?.color || '#64748b',
      status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
    };
  });

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

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find(b => 
      b.categoryId === parseInt(formData.categoryId) && 
      (!editingBudget || b.id !== editingBudget.id)
    );
    
    if (existingBudget) {
      newErrors.categoryId = 'Budget already exists for this category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId)
      };

      if (editingBudget) {
        onUpdateBudget(editingBudget.id, budgetData);
      } else {
        onAddBudget(budgetData);
      }

      setFormData({
        categoryId: '',
        amount: '',
        period: 'monthly'
      });
      setShowForm(false);
      setEditingBudget(null);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId.toString(),
      amount: budget.amount.toString(),
      period: budget.period || 'monthly'
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly'
    });
    setShowForm(false);
    setEditingBudget(null);
    setErrors({});
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const availableCategories = expenseCategories.filter(cat => 
    !budgets.some(b => b.categoryId === cat.id && (!editingBudget || b.id !== editingBudget.id))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Budget Manager</h2>
          <p className="text-gray-600">Set and track your spending limits for {format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Budget</span>
          </button>
        )}
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBudget ? 'Edit Budget' : 'Create New Budget'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.categoryId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {availableCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  {editingBudget && (
                    <option value={editingBudget.categoryId}>
                      {categories.find(c => c.id === editingBudget.categoryId)?.name}
                    </option>
                  )}
                </select>
                {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={`block w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
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
                <Target className="h-4 w-4" />
                <span>{editingBudget ? 'Update Budget' : 'Create Budget'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      <div className="space-y-4">
        {budgetStatus.length > 0 ? (
          budgetStatus.map((budget) => (
            <div key={budget.id} className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: budget.categoryColor }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{budget.categoryName}</h3>
                    <p className="text-sm text-gray-600">Monthly Budget</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {budget.status === 'good' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {budget.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                  {budget.status === 'over' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  
                  <span className={`font-semibold ${
                    budget.status === 'over' ? 'text-red-600' : 
                    budget.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    ₹{budget.spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}
                  </span>
                  
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(budget.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    budget.status === 'over' ? 'bg-red-500' : 
                    budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {budget.percentage.toFixed(1)}% used
                </span>
                <span className={`font-medium ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.abs(budget.remaining).toFixed(2)} {budget.remaining >= 0 ? 'remaining' : 'over budget'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-6">Create your first budget to start tracking your spending</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Budget</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManager;