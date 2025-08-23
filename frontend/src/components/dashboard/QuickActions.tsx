import React from 'react';
import { useActions } from '../../contexts/ActionContext';

const QuickActions: React.FC = () => {
  const { handleExportData, handleRefreshData, handleGetQuote, setIsChatOpen } = useActions();

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleExportData}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Export Data
      </button>
      
      <button
        onClick={handleRefreshData}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Refresh
      </button>
      
      <button
        onClick={handleGetQuote}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Get Quote
      </button>
      
      <button
        onClick={() => setIsChatOpen(true)}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Chat
      </button>
    </div>
  );
};

export default QuickActions;
