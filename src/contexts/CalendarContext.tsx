import React, { createContext, useContext, useState } from 'react';
import { CalendarEvent, CalendarContextType } from '@/types/calendar';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const eventId = eventData.seriesId && eventData.type === 'sermon' 
      ? `${eventData.seriesId}-sermon-${eventData.title.replace(/\s+/g, '-').toLowerCase()}`
      : `${eventData.seriesId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Handle date properly to avoid timezone issues
    let dateString: string;
    if (typeof eventData.date === 'string') {
      // If it's already a string, use it as is
      dateString = eventData.date;
    } else {
      // Convert Date to local date string (YYYY-MM-DD format)
      const year = eventData.date.getFullYear();
      const month = String(eventData.date.getMonth() + 1).padStart(2, '0');
      const day = String(eventData.date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }
    
    const newEvent: CalendarEvent = {
      ...eventData,
      id: eventId,
      color: eventData.color || '#6366f1',
      date: dateString
    };
    
    setEvents(prev => {
      // Remove existing event with same ID to avoid duplicates
      const filtered = prev.filter(e => e.id !== eventId);
      return [...filtered, newEvent];
    });
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { 
        ...event, 
        ...updates,
        color: updates.color || event.color || '#6366f1'
      } : event
    ));
  };

  // Function to sync all events from sermon series data
  const syncEventsFromSermons = (sermonSeries: any[]) => {
    const newEvents: CalendarEvent[] = [];
    
    sermonSeries.forEach(series => {
      if (series.sermons) {
        series.sermons.forEach((sermon: any) => {
          if (sermon.date) {
            const eventId = `${series.id}-sermon-${sermon.title.replace(/\s+/g, '-').toLowerCase()}`;
            
            // Handle date properly
            let dateString: string;
            if (typeof sermon.date === 'string') {
              dateString = sermon.date.split('T')[0]; // Take only date part
            } else {
              const date = new Date(sermon.date);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              dateString = `${year}-${month}-${day}`;
            }
            
            newEvents.push({
              id: eventId,
              title: sermon.title,
              subtitle: series.title,
              date: dateString,
              color: series.color || '#6366f1',
              seriesId: series.id,
              sermonId: sermon.id,
              type: 'sermon'
            });
          }
        });
      }
    });
    
    setEvents(newEvents);
  };
  return (
    <CalendarContext.Provider value={{
      events,
      addEvent,
      removeEvent,
      updateEvent,
      syncEventsFromSermons
    }}>
      {children}
    </CalendarContext.Provider>
  );
};