import { CalendarProvider } from './contexts/CalendarContext';
import { AppProvider } from './contexts/AppContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './components/theme-provider';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SettingsProvider>
        <CalendarProvider>
          <AppProvider>
            <AppLayout />
          </AppProvider>
        </CalendarProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;