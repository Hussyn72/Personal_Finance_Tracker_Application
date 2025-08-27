import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="bg-blue-600 p-3 rounded-xl">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personal Finance Tracker</h1>
              <p className="text-gray-600">Smart financial management made simple</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Take Control of Your{' '}
              <span className="text-blue-600">Financial Future</span>
            </h2>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Track expenses, manage budgets, and gain insights into your spending patterns 
              with our comprehensive financial management platform.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Budgeting</h3>
                <p className="text-gray-600 text-sm">Set and track budgets with intelligent alerts and recommendations.</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mb-4">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                <p className="text-gray-600 text-sm">Visualize your financial data with interactive charts and insights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex items-center justify-center">
          {isLogin ? (
            <LoginForm onToggleForm={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggleForm={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;