import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div
          className={`${sizeClasses[size]} border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4`}
        ></div>
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;