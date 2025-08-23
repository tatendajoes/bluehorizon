import React from 'react';
import WaterTrends from './WaterTrends';
import WaterStatus from './WaterStatus';
import QuickActions from './QuickActions';
import YourChatComponent from '../chat/YourChatComponent';
import PageTransition from '../ui/PageTransition';

const Dashboard: React.FC = () => {
  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Blue Horizon Dashboard</h2>
          <QuickActions />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <WaterTrends deviceId="WQ-001" />
          </div>
          <div className="space-y-4">
            <WaterStatus />
            <YourChatComponent />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
