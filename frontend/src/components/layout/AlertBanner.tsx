import React, { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'error' | 'warning';
  message: string;
  parameter: 'pH' | 'Turbidity' | 'TDS';
}

const AlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate alerts - in real app, this would come from water data
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        message: 'pH levels approaching critical range',
        parameter: 'pH'
      },
      {
        id: '2',
        type: 'error',
        message: 'Turbidity exceeds safety threshold',
        parameter: 'Turbidity'
      }
    ];

    if (mockAlerts.length > 0) {
      setAlerts(mockAlerts);
      setIsVisible(true);
    }
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    if (alerts.length <= 1) {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-red-800">
              Blue Horizon Alerts
            </span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-400 hover:text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-2 space-y-2">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3 rounded-md ${
                alert.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  alert.type === 'error' 
                    ? 'bg-red-200 text-red-800' 
                    : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {alert.parameter}
                </span>
                <span className={`text-sm ${
                  alert.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {alert.message}
                </span>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
