import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Lightbulb, 
  BarChart3, 
  Settings,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { sidebarOpen, toggleSidebar } = useAppContext();

  const menuItems = [
    { icon: Home, label: 'Dashboard', key: 'dashboard' },
    { icon: BookOpen, label: 'Series', key: 'series' },
    { icon: Calendar, label: 'Calendar', key: 'calendar' },
    { icon: Lightbulb, label: 'Ideas', key: 'ideas' },
    { icon: BarChart3, label: 'Analytics', key: 'analytics' },
    { icon: Settings, label: 'Settings', key: 'settings' },
  ];

  const handleItemClick = (key: string) => {
    if (onTabChange) {
      onTabChange(key);
    }
  };

  return (
    <aside className={cn(
      'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && (
            <h2 className="font-semibold text-lg">Menu</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden md:flex"
          >
            <ChevronLeft className={cn(
              'h-4 w-4 transition-transform',
              !sidebarOpen && 'rotate-180'
            )} />
          </Button>
        </div>
        
        <nav className="flex-1 px-2">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <li key={index}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start',
                      !sidebarOpen && 'px-2'
                    )}
                    onClick={() => handleItemClick(item.key)}
                  >
                    <Icon className="h-4 w-4" />
                    {sidebarOpen && (
                      <span className="ml-2">{item.label}</span>
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;