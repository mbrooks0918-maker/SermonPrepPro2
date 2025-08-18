import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CalendarProvider } from './contexts/CalendarContext.tsx'

createRoot(document.getElementById("root")!).render(
  <CalendarProvider>
    <App />
  </CalendarProvider>
);