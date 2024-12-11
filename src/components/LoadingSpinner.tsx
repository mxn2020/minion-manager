import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  trackColor?: string;
  spinColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  trackColor = 'border-gray-200',
  spinColor = 'border-blue-500'
}) => {
  // Using standard Tailwind size classes
  const sizeClasses = {
    xs: 'w-4 h-4 border-2',
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-6'
  };

  const containerSizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`relative ${containerSizeClasses[size]}`}>
        <div className={`absolute ${sizeClasses[size]} ${trackColor} rounded-full`}></div>
        <div className={`absolute ${sizeClasses[size]} ${spinColor} rounded-full border-t-transparent animate-spin`}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;