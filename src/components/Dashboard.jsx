import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Target, Edit2, Trash2, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = ({ transactions, budgets, categories, onEditTransaction, onDeleteTransaction }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const currentMonth = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return isWithinInterval(transactionDate, { start, end });
    });
  }, [transactions, selectedMonth]);

  const stats = useMemo(() => {
    const totalIncome = currentMonth
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = currentMonth
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    
    return { totalIncome, totalExpenses, balance };
  }, [currentMonth]);

  const categoryData = useMemo(() => {
    const expensesByCategory = currentMonth
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = categories.find(c => c.id === t.categoryId);
        const categoryName = category?.name || 'Uncategorized';
        const categoryColor = category?.color || '#64748b';
        
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {});

    return Object.entries(expensesByCategory).map(([name, value]) => {
      const category = categories.find(c => c.name === name);
      return {
        name,
        value,
        color: category?.color || '#64748b'
      };
    });
  }, [currentMonth, categories]);

  const monthlyTrends = useMemo(() => {
    const last6Months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start, end });
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      last6Months.push({
        month: format(monthDate, 'MMM yyyy'),
        income,
        expenses,
        balance: income - expenses
      });
    }
    
    return last6Months;
  }, [transactions]);

  const budgetStatus = useMemo(() => {
    return budgets.map(budget => {
      const spent = currentMonth
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
  }, [budgets, currentMonth, categories]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [transactions]);

  return (
    <div className="space-y-8">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Your financial overview for {format(selectedMonth, 'MMMM yyyy')}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <input
            type="month"
            value={format(selectedMonth, 'yyyy-MM')}
            onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">₹{stats.totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">₹{stats.totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{stats.balance.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stats.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-2xl font-bold text-blue-600">{budgets.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expenses this month
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">6-Month Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget Status and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Budget Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Status</h3>
          <div className="space-y-4">
            {budgetStatus.length > 0 ? (
              budgetStatus.map((budget) => (
                <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{budget.categoryName}</span>
                    <span className={`text-sm font-medium ${
                      budget.status === 'over' ? 'text-red-600' : 
                      budget.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      ₹{budget.spent.toFixed(2)} / ₹{budget.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        budget.status === 'over' ? 'bg-red-500' : 
                        budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{budget.percentage.toFixed(1)}% used</span>
                    <span>₹{budget.remaining.toFixed(2)} remaining</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No budgets created yet</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color || '#64748b' }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-600">
                          {category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onEditTransaction(transaction.id, transaction)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(transaction.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;