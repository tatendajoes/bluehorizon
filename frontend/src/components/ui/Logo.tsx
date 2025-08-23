import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circular background */}
        <circle 
          cx="12" 
          cy="12" 
          r="11" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="white"
        />
        
        {/* Water droplet */}
        <path 
          d="M12 4C12 4 14 6.5 14 9C14 11.5 12 13 12 13C12 13 10 11.5 10 9C10 6.5 12 4Z" 
          fill="currentColor"
        />
        
        {/* Water waves */}
        <path 
          d="M6 16C6 16 8 17.5 12 17.5C16 17.5 18 16 18 16" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <path 
          d="M7 18.5C7 18.5 9 20 12 20C15 20 17 18.5 17 18.5" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <path 
          d="M8 21C8 21 9.5 22 12 22C14.5 22 16 21 16 21" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default Logo;
