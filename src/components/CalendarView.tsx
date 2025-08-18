import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useCalendar } from '@/contexts/CalendarContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  onSermonSelect?: (seriesId: string, sermonId: string) => void;
}
const CalendarView: React.FC<CalendarViewProps> = ({ onSermonSelect }) => {
  const { sermonSeries } = useAppContext();
  const { events, syncEventsFromSermons } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sync calendar events with latest sermon data when component mounts or sermonSeries changes
  React.useEffect(() => {
    syncEventsFromSermons(sermonSeries);
  }, [sermonSeries, syncEventsFromSermons]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const currentDay = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const getEventForDate = (date: Date) => {
    // Create local date string for comparison (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    
    return events.find(event => {
      // Compare with event date string directly
      return event.date === localDateString;
    });
  };

  const getSeriesArtwork = (seriesId: string) => {
    const series = sermonSeries.find(s => s.id === seriesId);
    if (series?.artwork) {
      return typeof series.artwork === 'string' ? series.artwork : URL.createObjectURL(series.artwork);
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-center flex-1 flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6" />
          Calendar
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold min-w-[200px] text-center">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-7 gap-2 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const event = getEventForDate(day);
              const isCurrentMonth = day.getMonth() === month;
              const isToday = day.toDateString() === new Date().toDateString();
              const seriesArtwork = event?.seriesId ? getSeriesArtwork(event.seriesId) : null;
              const eventColor = event?.color || '#6366f1';
              
              return (
                <div
                  key={index}
                  className={`
                    min-h-[100px] p-2 border rounded-lg transition-colors cursor-pointer
                    ${isCurrentMonth ? 'bg-background' : 'bg-muted/50'}
                    ${isToday ? 'ring-2 ring-primary' : ''}
                    ${event ? 'hover:shadow-md hover:bg-accent/50' : ''}
                  `}
                  onClick={() => event?.seriesId && event?.sermonId && onSermonSelect?.(event.seriesId, event.sermonId)}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  {event && (
                    <div className="space-y-1">
                      <div className="flex justify-center mb-1">
                         <div className="w-16 h-9 bg-muted rounded flex items-center justify-center overflow-hidden" style={{ aspectRatio: '16/9' }}>
                          {seriesArtwork ? (
                            <img 
                              src={seriesArtwork} 
                              alt="Series artwork"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-center">
                        <div className="font-medium truncate text-xs" title={event.title}>
                          {event.title}
                        </div>
                        <div className="text-muted-foreground truncate text-xs" title={event.subtitle}>
                          {event.subtitle}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs mt-1 scale-75"
                          style={{ backgroundColor: eventColor + '20', color: eventColor }}
                        >
                          Sermon
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;