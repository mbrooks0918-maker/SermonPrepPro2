import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import TopTabs, { TabType } from './TopTabs';
import MainContent from './MainContent';
import { useAppContext } from '@/contexts/AppContext';

interface AppLayoutState {
  resetMainContent: number;
}

const AppLayout: React.FC = () => {
  const { sidebarOpen } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabType>('series');
  const [resetKey, setResetKey] = useState<number>(0);

  const handleSidebarTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  const handleSeriesTabClick = () => {
    // Reset to main series list when Sermon Series tab is clicked
    setActiveTab('series');
    setResetKey(prev => prev + 1); // Force MainContent to reset
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TopTabs activeTab={activeTab} onTabChange={setActiveTab} onSeriesTabClick={handleSeriesTabClick} />
      <div className="flex h-[calc(100vh-8rem)]">
        <Sidebar activeTab={activeTab} onTabChange={handleSidebarTabChange} />
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}>
          <MainContent key={resetKey} activeTab={activeTab} />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;