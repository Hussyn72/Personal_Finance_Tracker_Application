import React from 'react';
import { DollarSign } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 animate-pulse">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Setting up your financial dashboard</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;