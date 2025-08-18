import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Moon, Sun } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useTheme } from './theme-provider';

const Header: React.FC = () => {
  const { toggleSidebar } = useAppContext();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-center flex-1">
          SermonPrep Pro
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;