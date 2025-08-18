export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  date: Date | string;
  type: 'sermon' | 'event';
  sermonId?: string;
  seriesId?: string;
  color?: string;
}

export interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  syncEventsFromSermons: (sermonSeries: any[]) => void;
}