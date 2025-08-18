import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Archive } from 'lucide-react';

export type TabType = 'series' | 'calendar' | 'archived';

interface TopTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSeriesTabClick?: () => void;
}

const TopTabs: React.FC<TopTabsProps> = ({ activeTab, onTabChange, onSeriesTabClick }) => {
  const tabs = [
    { id: 'series' as TabType, label: 'Sermon Series', icon: BookOpen },
    { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
    { id: 'archived' as TabType, label: 'Archived Series', icon: Archive },
  ];

  return (
    <div className="border-b bg-background">
      <div className="flex items-center gap-1 py-2 pl-20 pr-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                if (tab.id === 'series' && onSeriesTabClick) {
                  onSeriesTabClick();
                }
                onTabChange(tab.id);
              }}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default TopTabs;