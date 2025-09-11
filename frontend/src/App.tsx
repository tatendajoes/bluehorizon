import React from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import WaterTipsRail from './components/dashboard/WaterTipsRail';
import { ActionProvider } from './contexts/ActionContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <ActionProvider>
        <Layout>
          <Dashboard />
          <WaterTipsRail />
        </Layout>
      </ActionProvider>
    </ThemeProvider>
  );
}

export default App;
