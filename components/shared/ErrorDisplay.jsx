import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ 
  title = 'Error Loading Data', 
  message = 'Something went wrong. Please try again.',
  onRetry = null 
}) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-gray-400 mb-4">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;