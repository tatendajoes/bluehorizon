import React, { useState, useEffect } from 'react';
import Logo from '../ui/Logo';

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" className="text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Blue Horizon
            </h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="text-sm text-gray-600">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 capitalize">{status}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
