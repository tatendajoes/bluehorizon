import React from 'react';
import { useActions } from '../../contexts/ActionContext';
import { Download, RefreshCw, FileText, MessageCircle } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { handleExportData, handleRefreshData, handleGetQuote, setIsChatOpen } = useActions();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleExportData}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        title="Export water quality data"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </button>
      
      <button
        onClick={handleRefreshData}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        title="Refresh data"
      >
        <RefreshCw className="h-4 w-4" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
      
      <button
        onClick={handleGetQuote}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        title="Get a quote for services"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Quote</span>
      </button>
      
      <button
        onClick={() => setIsChatOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors dark:bg-green-500 dark:hover:bg-green-600"
        title="Open chat assistant"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Chat</span>
      </button>
    </div>
  );
};

export default QuickActions;
