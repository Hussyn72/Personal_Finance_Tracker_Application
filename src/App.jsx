import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Settings, LogOut, User } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import BudgetManager from './components/BudgetManager';
import Reports from './components/Reports';
import CategoryManager from './components/CategoryManager';
import LoadingSpinner from './components/LoadingSpinner';

const TABS = {
  DASHBOARD: 'dashboard',
  ADD_TRANSACTION: 'add-transaction',
  BUDGETS: 'budgets',
  REPORTS: 'reports',
  CATEGORIES: 'categories'
};

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: 'Food & Dining', type: 'expense', color: '#ef4444' },
    { id: 2, name: 'Transportation', type: 'expense', color: '#f97316' },
    { id: 3, name: 'Shopping', type: 'expense', color: '#eab308' },
    { id: 4, name: 'Entertainment', type: 'expense', color: '#22c55e' },
    { id: 5, name: 'Bills & Utilities', type: 'expense', color: '#3b82f6' },
    { id: 6, name: 'Healthcare', type: 'expense', color: '#8b5cf6' },
    { id: 7, name: 'Salary', type: 'income', color: '#10b981' },
    { id: 8, name: 'Freelance', type: 'income', color: '#06b6d4' },
    { id: 9, name: 'Investment', type: 'income', color: '#8b5cf6' }
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financeTracker_transactions');
    const savedBudgets = localStorage.getItem('financeTracker_budgets');
    const savedCategories = localStorage.getItem('financeTracker_categories');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('financeTracker_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('financeTracker_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('financeTracker_categories', JSON.stringify(categories));
  }, [categories]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date(transaction.date).toISOString()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id, updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...updatedTransaction, id } : t)
    );
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addBudget = (budget) => {
    const newBudget = {
      ...budget,
      id: Date.now()
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const updateBudget = (id, updatedBudget) => {
    setBudgets(prev => 
      prev.map(b => b.id === id ? { ...updatedBudget, id } : b)
    );
  };

  const deleteBudget = (id) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const addCategory = (category) => {
    const newCategory = {
      ...category,
      id: Date.now()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id, updatedCategory) => {
    setCategories(prev => 
      prev.map(c => c.id === id ? { ...updatedCategory, id } : c)
    );
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const navItems = [
    { id: TABS.DASHBOARD, label: 'Dashboard', icon: TrendingUp },
    { id: TABS.ADD_TRANSACTION, label: 'Add Transaction', icon: PlusCircle },
    { id: TABS.BUDGETS, label: 'Budgets', icon: DollarSign },
    { id: TABS.REPORTS, label: 'Reports', icon: PieChart },
    { id: TABS.CATEGORIES, label: 'Categories', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case TABS.DASHBOARD:
        return (
          <Dashboard 
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            onEditTransaction={updateTransaction}
            onDeleteTransaction={deleteTransaction}
          />
        );
      case TABS.ADD_TRANSACTION:
        return (
          <TransactionForm
            categories={categories}
            onAddTransaction={addTransaction}
            onBack={() => setActiveTab(TABS.DASHBOARD)}
          />
        );
      case TABS.BUDGETS:
        return (
          <BudgetManager
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            onAddBudget={addBudget}
            onUpdateBudget={updateBudget}
            onDeleteBudget={deleteBudget}
          />
        );
      case TABS.REPORTS:
        return (
          <Reports
            transactions={transactions}
            categories={categories}
            budgets={budgets}
          />
        );
      case TABS.CATEGORIES:
        return (
          <CategoryManager
            categories={categories}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Personal Finance Tracker</h1>
                <p className="text-sm text-gray-600">Manage your money with confidence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === item.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;