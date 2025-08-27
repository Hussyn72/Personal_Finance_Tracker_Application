import React, { useState, useMemo } from 'react';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth, isWithinInterval, eachMonthOfInterval, subMonths } from 'date-fns';
import { Calendar, TrendingUp, TrendingDown, Download, Filter } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports = ({ transactions, categories, budgets }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [chartType, setChartType] = useState('line');

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    if (selectedPeriod === 'year') {
      const start = startOfYear(new Date(selectedYear, 0, 1));
      const end = endOfYear(new Date(selectedYear, 0, 1));
      return transactions.filter(t => {
        const date = new Date(t.date);
        return isWithinInterval(date, { start, end });
      });
    } else {
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      return transactions.filter(t => {
        const date = new Date(t.date);
        return isWithinInterval(date, { start, end });
      });
    }
  }, [transactions, selectedPeriod, selectedYear, selectedMonth]);

  // Monthly trends data
  const monthlyTrendsData = useMemo(() => {
    if (selectedPeriod === 'year') {
      const months = eachMonthOfInterval({
        start: startOfYear(new Date(selectedYear, 0, 1)),
        end: endOfYear(new Date(selectedYear, 0, 1))
      });

      return months.map(month => {
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return isWithinInterval(date, { 
            start: startOfMonth(month), 
            end: endOfMonth(month) 
          });
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          month: format(month, 'MMM'),
          income,
          expenses,
          balance: income - expenses
        };
      });
    } else {
      // Last 12 months for month view
      const months = [];
      for (let i = 11; i >= 0; i--) {
        months.push(subMonths(selectedMonth, i));
      }

      return months.map(month => {
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date);
          return isWithinInterval(date, { 
            start: startOfMonth(month), 
            end: endOfMonth(month) 
          });
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          month: format(month, 'MMM yy'),
          income,
          expenses,
          balance: income - expenses
        };
      });
    }
  }, [transactions, selectedPeriod, selectedYear, selectedMonth]);

  // Category breakdown data
  const categoryData = useMemo(() => {
    const expensesByCategory = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = categories.find(c => c.id === t.categoryId);
        const categoryName = category?.name || 'Uncategorized';
        const categoryColor = category?.color || '#64748b';
        
        if (!acc[categoryName]) {
          acc[categoryName] = { amount: 0, color: categoryColor };
        }
        acc[categoryName].amount += t.amount;
        return acc;
      }, {});

    return Object.entries(expensesByCategory).map(([name, data]) => ({
      name,
      value: data.amount,
      color: data.color
    }));
  }, [filteredTransactions, categories]);

  // Income vs Expenses comparison
  const incomeVsExpenses = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Income', value: income, color: '#10b981' },
      { name: 'Expenses', value: expenses, color: '#ef4444' }
    ];
  }, [filteredTransactions]);

  // Budget vs Actual spending (for current month only)
  const budgetComparison = useMemo(() => {
    if (selectedPeriod === 'month') {
      const currentMonthStart = startOfMonth(selectedMonth);
      const currentMonthEnd = endOfMonth(selectedMonth);
      
      const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return isWithinInterval(date, { start: currentMonthStart, end: currentMonthEnd });
      });

      return budgets.map(budget => {
        const spent = currentMonthTransactions
          .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
          .reduce((sum, t) => sum + t.amount, 0);

        const category = categories.find(c => c.id === budget.categoryId);
        
        return {
          category: category?.name || 'Unknown',
          budgeted: budget.amount,
          actual: spent,
          color: category?.color || '#64748b'
        };
      });
    }
    return [];
  }, [budgets, transactions, categories, selectedMonth, selectedPeriod]);

  const exportData = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount'].join(','),
      ...filteredTransactions.map(t => {
        const category = categories.find(c => c.id === t.categoryId);
        return [
          format(new Date(t.date), 'yyyy-MM-dd'),
          t.type,
          category?.name || 'Uncategorized',
          `"${t.description}"`,
          t.amount
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${selectedPeriod}-${selectedPeriod === 'year' ? selectedYear : format(selectedMonth, 'yyyy-MM')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const renderChart = (data, type) => {
    const chartProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} name="Expenses" />
            <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} name="Balance" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Legend />
            <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
            <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name="Income" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Financial Reports</h2>
          <p className="text-gray-600">Analyze your financial patterns and trends</p>
        </div>
        
        <button
          onClick={exportData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Period:</span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === 'month'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPeriod('year')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === 'year'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Yearly
            </button>
          </div>

          {selectedPeriod === 'year' ? (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          ) : (
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}

          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-sm font-medium text-gray-700">Chart:</span>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
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
              <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
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
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netBalance.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${netBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className={`h-6 w-6 ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trends Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedPeriod === 'year' ? 'Monthly Trends' : '12-Month Trend'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart(monthlyTrendsData, chartType)}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {categoryData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenses} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Bar dataKey="value" fill={(entry) => entry.color}>
                  {incomeVsExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Comparison (Monthly only) */}
        {selectedPeriod === 'month' && budgetComparison.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                  <Bar dataKey="actual" fill="#ef4444" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-left py-2">Category</th>
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map(transaction => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                        <td className="py-2">{transaction.description}</td>
                        <td className="py-2">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category?.color || '#64748b' }}
                            />
                            <span>{category?.name || 'Uncategorized'}</span>
                          </div>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`py-2 text-right font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No transactions found for the selected period</p>
        )}
      </div>
    </div>
  );
};

export default Reports;