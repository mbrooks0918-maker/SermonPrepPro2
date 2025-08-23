// components/AppLayout.tsx
import React, { useState } from "react";
import Header from "./Header";
import TopTabs, { TabType } from "./TopTabs";
import MainContent from "./MainContent";

const AppLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("series");
  const [resetKey, setResetKey] = useState<number>(0);

  const handleSeriesTabClick = () => {
    setActiveTab("series");
    setResetKey((prev) => prev + 1); // reset the main list
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TopTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSeriesTabClick={handleSeriesTabClick}
      />
      {/* no sidebar — just full-width main */}
      <main className="h-[calc(100vh-8rem)] overflow-auto">
        <MainContent key={resetKey} activeTab={activeTab} />
      </main>
    </div>
  );
};

export default AppLayout;
