import React, { createContext, useContext, useState, useEffect } from 'react';
import { SermonIdea, SermonSeries, Sermon } from '@/types/sermon';
import { sermonSeriesService, sermonService } from '@/lib/supabase';
import { useCalendar } from '@/contexts/CalendarContext';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  sermonIdeas: SermonIdea[];
  sermonSeries: SermonSeries[];
  archivedSeries: SermonSeries[];
  loading: boolean;
  addSeries: (series: SermonSeries) => Promise<void>;
  updateSeries: (series: SermonSeries) => Promise<void>;
  deleteSeries: (seriesId: string) => Promise<void>;
  archiveSeries: (seriesId: string) => Promise<void>;
  unarchiveSeries: (seriesId: string) => Promise<void>;
  addSermon: (seriesId: string, sermon: Sermon) => Promise<void>;
  updateSermon: (seriesId: string, sermon: Sermon) => Promise<void>;
  deleteSermon: (seriesId: string, sermonId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

// Generate UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addEvent, removeEvent, updateEvent } = useCalendar();
  
  const [sermonIdeas] = useState<SermonIdea[]>([{
    id: generateUUID(),
    title: 'Faith in Uncertain Times',
    description: 'Exploring how to maintain faith when facing life\'s uncertainties.',
    scriptures: ['Hebrews 11:1', 'Romans 8:28'],
    tags: ['faith', 'trust'],
    createdAt: new Date(),
    updatedAt: new Date()
  }]);

  const [sermonSeries, setSermonSeries] = useState<SermonSeries[]>([]);
  const [archivedSeries, setArchivedSeries] = useState<SermonSeries[]>([]);
  const syncSermonsToCalendar = (series: SermonSeries[]) => {
    // Use the new syncEventsFromSermons method instead of individual addEvent calls
    // This ensures calendar is always in sync with the latest sermon data
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allSeries = await sermonSeriesService.getAll();
        
        // Separate active and archived series
        const activeSeries = allSeries.filter(s => s.status !== 'archived');
        const archived = allSeries.filter(s => s.status === 'archived');
        
        // Load sermons for each series
        const seriesWithSermons = await Promise.all(
          activeSeries.map(async (series) => {
            const sermons = await sermonService.getBySeriesId(series.id);
            return { ...series, sermons };
          })
        );
        
        const archivedWithSermons = await Promise.all(
          archived.map(async (series) => {
            const sermons = await sermonService.getBySeriesId(series.id);
            return { ...series, sermons };
          })
        );
        
        setSermonSeries(seriesWithSermons);
        setArchivedSeries(archivedWithSermons);
        
        // Sync only active series to calendar (exclude archived)
        syncSermonsToCalendar(seriesWithSermons);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const addSeries = async (series: SermonSeries) => {
    try {
      const seriesWithUUID = { ...series, id: generateUUID() };
      const newSeries = await sermonSeriesService.create(seriesWithUUID);
      const seriesWithSermons = { ...newSeries, sermons: [] };
      setSermonSeries(prev => [...prev, seriesWithSermons]);
    } catch (error) {
      console.error('Error adding series:', error);
      throw error;
    }
  };

  // A date value counts only if present and parseable.
  const hasValidDate = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    return !isNaN(new Date(value).getTime());
  };

  const updateSeries = async (updatedSeries: SermonSeries) => {
    try {
      const existingSeries = sermonSeries.find(s => s.id === updatedSeries.id) ||
                            archivedSeries.find(s => s.id === updatedSeries.id);
      if (!existingSeries) {
        throw new Error('Series not found');
      }

      await sermonSeriesService.update(updatedSeries.id, updatedSeries);

      // When the series is saved as Unscheduled (both dates null/empty), clear
      // the date on every sermon in it too. Only do this when BOTH dates are
      // absent — a series with valid dates leaves its sermons untouched.
      const start = (updatedSeries as any).startDate ?? (updatedSeries as any).start_date;
      const end = (updatedSeries as any).endDate ?? (updatedSeries as any).end_date;
      const markedUnscheduled = !hasValidDate(start) && !hasValidDate(end);

      let nextSeries = updatedSeries;
      if (markedUnscheduled) {
        const seriesSermons = existingSeries.sermons || [];
        const hasDatedSermon = seriesSermons.some(s => hasValidDate((s as any).date));
        if (hasDatedSermon) {
          await sermonService.clearDatesBySeriesId(updatedSeries.id);
          // Mirror the cleared dates in local state so the UI updates immediately.
          nextSeries = {
            ...updatedSeries,
            sermons: seriesSermons.map(s => ({ ...s, date: null as any }))
          };
        }
      }

      setSermonSeries(prev => prev.map(s => s.id === nextSeries.id ? nextSeries : s));
      setArchivedSeries(prev => prev.map(s => s.id === nextSeries.id ? nextSeries : s));
    } catch (error) {
      console.error('Error updating series:', error);
      throw error;
    }
  };

  const deleteSeries = async (seriesId: string) => {
    try {
      await sermonSeriesService.delete(seriesId);
      setSermonSeries(prev => prev.filter(s => s.id !== seriesId));
      setArchivedSeries(prev => prev.filter(s => s.id !== seriesId));
    } catch (error) {
      console.error('Error deleting series:', error);
      setSermonSeries(prev => prev.filter(s => s.id !== seriesId));
    }
  };

  const archiveSeries = async (seriesId: string) => {
    try {
      await sermonSeriesService.update(seriesId, { status: 'archived' });
      const series = sermonSeries.find(s => s.id === seriesId);
      if (series) {
        setSermonSeries(prev => prev.filter(s => s.id !== seriesId));
        setArchivedSeries(prev => [...prev, { ...series, status: 'archived' }]);
      }
    } catch (error) {
      console.error('Error archiving series:', error);
    }
  };

  const unarchiveSeries = async (seriesId: string) => {
    try {
      await sermonSeriesService.update(seriesId, { status: 'active' });
      const series = archivedSeries.find(s => s.id === seriesId);
      if (series) {
        setArchivedSeries(prev => prev.filter(s => s.id !== seriesId));
        setSermonSeries(prev => [...prev, { ...series, status: 'active' }]);
      }
    } catch (error) {
      console.error('Error unarchiving series:', error);
    }
  };

  const addSermon = async (seriesId: string, sermon: Sermon) => {
    try {
      const existingSeries = sermonSeries.find(s => s.id === seriesId);
      if (!existingSeries) {
        throw new Error('Series not found');
      }
      
      const sermonWithUUID = { ...sermon, id: generateUUID() };
      const newSermon = await sermonService.create({ ...sermonWithUUID, series_id: seriesId });
      
      setSermonSeries(prev => prev.map(s => 
        s.id === seriesId 
          ? { ...s, sermons: [...(s.sermons || []), newSermon] }
          : s
      ));
      
      if (newSermon.date) {
        addEvent({
          title: newSermon.title,
          subtitle: existingSeries.title,
          date: newSermon.date,
          color: existingSeries.color || '#6366f1',
          seriesId: seriesId,
          sermonId: newSermon.id,
          type: 'sermon'
        });
      }
    } catch (error) {
      console.error('Error adding sermon:', error);
      throw error;
    }
  };

  const updateSermon = async (seriesId: string, updatedSermon: Sermon) => {
    try {
      // Update in database first
      await sermonService.update(updatedSermon.id, updatedSermon);
      
      // Update local state for both active and archived series
      setSermonSeries(prev => prev.map(s => 
        s.id === seriesId 
          ? { ...s, sermons: (s.sermons || []).map(sermon => sermon.id === updatedSermon.id ? updatedSermon : sermon) }
          : s
      ));
      
      setArchivedSeries(prev => prev.map(s => 
        s.id === seriesId 
          ? { ...s, sermons: (s.sermons || []).map(sermon => sermon.id === updatedSermon.id ? updatedSermon : sermon) }
          : s
      ));
      
      // Update calendar event
      const series = sermonSeries.find(s => s.id === seriesId) || archivedSeries.find(s => s.id === seriesId);
      if (series && updatedSermon.date) {
        updateEvent(`${seriesId}-sermon-${updatedSermon.title.replace(/\s+/g, '-').toLowerCase()}`, {
          title: updatedSermon.title,
          subtitle: series.title,
          date: updatedSermon.date,
          color: series.color || '#6366f1'
        });
      }
    } catch (error) {
      console.error('Error updating sermon:', error);
      throw error; // Re-throw to allow proper error handling in components
    }
  };

  const deleteSermon = async (seriesId: string, sermonId: string) => {
    try {
      await sermonService.delete(sermonId);
      setSermonSeries(prev => prev.map(s => 
        s.id === seriesId 
          ? { ...s, sermons: (s.sermons || []).filter(sermon => sermon.id !== sermonId) }
          : s
      ));
      
      const sermon = sermonSeries.find(s => s.id === seriesId)?.sermons?.find(ser => ser.id === sermonId);
      if (sermon) {
        removeEvent(`${seriesId}-sermon-${sermon.title.replace(/\s+/g, '-').toLowerCase()}`);
      }
    } catch (error) {
      console.error('Error deleting sermon:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        sermonIdeas,
        sermonSeries,
        archivedSeries,
        loading,
        addSeries,
        updateSeries,
        deleteSeries,
        archiveSeries,
        unarchiveSeries,
        addSermon,
        updateSermon,
        deleteSermon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};