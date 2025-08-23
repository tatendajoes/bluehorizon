import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActionContextType {
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  handleGetQuote: () => void;
  handleExportData: () => void;
  handleRefreshData: () => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const useActions = () => {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error('useActions must be used within an ActionProvider');
  }
  return context;
};

interface ActionProviderProps {
  children: ReactNode;
}

export const ActionProvider: React.FC<ActionProviderProps> = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleGetQuote = () => {
    // Centralized quote handling logic
    console.log('Getting quote for water quality services...');
    // You can add actual quote logic here (API call, form submission, etc.)
    alert('Quote request submitted! Our team will contact you within 24 hours.');
  };

  const handleExportData = () => {
    // Centralized export handling logic
    console.log('Exporting water quality data...');
    // You can add actual export logic here (CSV download, PDF generation, etc.)
    alert('Data export started! Check your downloads folder.');
  };

  const handleRefreshData = () => {
    // Centralized refresh handling logic
    console.log('Refreshing water quality data...');
    // You can add actual refresh logic here (API call, cache invalidation, etc.)
    alert('Data refreshed successfully!');
  };

  const value: ActionContextType = {
    isChatOpen,
    setIsChatOpen,
    handleGetQuote,
    handleExportData,
    handleRefreshData,
  };

  return (
    <ActionContext.Provider value={value}>
      {children}
    </ActionContext.Provider>
  );
};
