import React, { useState, useEffect } from 'react';
import Logo from '../ui/Logo';
import ThemeToggle from '../ui/ThemeToggle';

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-transparent dark:border-b dark:border-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" className="text-blue-600 dark:text-sky-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Blue Horizon
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="hidden sm:block">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex h-2 w-2">
                <div className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  status === 'online' ? 'bg-green-400 opacity-75' : 'bg-red-400 opacity-75'
                }`} />
                <div className={`relative inline-flex rounded-full h-2 w-2 ${
                  status === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
              <span className="capitalize hidden sm:inline">{status}</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
