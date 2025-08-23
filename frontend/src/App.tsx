import React from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import { ActionProvider } from './contexts/ActionContext';

function App() {
  return (
    <ActionProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </ActionProvider>
  );
}

export default App;
