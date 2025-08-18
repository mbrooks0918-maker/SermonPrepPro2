import { CalendarProvider } from './contexts/CalendarContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './components/theme-provider';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <CalendarProvider>
        <AppProvider>
          <AppLayout />
        </AppProvider>
      </CalendarProvider>
    </ThemeProvider>
  );
}

export default App;