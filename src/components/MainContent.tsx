import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SermonSeries } from '@/types/sermon';
import SermonSeriesList from './SermonSeriesList';
import SeriesDetail from './SeriesDetail';
import CalendarView from './CalendarView';
import ArchivedSeriesList from './ArchivedSeriesList';
import SeriesForm from './SeriesForm';
import LoadingSpinner from './LoadingSpinner';

interface MainContentProps {
  activeTab: string;
  resetToSeriesList?: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  const { sermonSeries, updateSeries, addSeries, loading } = useAppContext();
  const [selectedSeries, setSelectedSeries] = useState<SermonSeries | null>(null);
  const [editingSeries, setEditingSeries] = useState<SermonSeries | null>(null);
  const [calendarSermonSelection, setCalendarSermonSelection] = useState<{seriesId: string, sermonId: string} | null>(null);

  // Clear selections when switching tabs
  useEffect(() => {
    if (activeTab === 'calendar') {
      // Don't clear calendar-specific selections
      setSelectedSeries(null);
      setEditingSeries(null);
    } else if (activeTab !== 'series' && activeTab !== 'archived') {
      setSelectedSeries(null);
      setEditingSeries(null);
      setCalendarSermonSelection(null);
    }
  }, [activeTab]);

  const handleSelectSeries = (series: SermonSeries) => {
    console.log('🎯 Selected series:', series);
    setSelectedSeries(series);
    setEditingSeries(null);
    setCalendarSermonSelection(null);
  };

  const handleSelectSermonFromCalendar = (seriesId: string, sermonId: string) => {
    const series = sermonSeries.find(s => s.id === seriesId);
    if (series) {
      const sermon = series.sermons?.find(s => s.id === sermonId);
      if (sermon) {
        console.log('🎯 Selected sermon from calendar:', sermon);
        setCalendarSermonSelection({seriesId, sermonId});
        setSelectedSeries({ ...series, selectedSermonId: sermonId } as SermonSeries & { selectedSermonId: string });
      }
    }
  };

  const handleBackToList = () => {
    console.log('🔙 Going back to list');
    if (calendarSermonSelection) {
      // If we came from calendar, go back to calendar
      setSelectedSeries(null);
      setCalendarSermonSelection(null);
    } else {
      setSelectedSeries(null);
      setEditingSeries(null);
    }
  };

  const handleUpdateSeries = (updatedSeries: SermonSeries) => {
    console.log('🔄 Updating series in MainContent:', updatedSeries);
    updateSeries(updatedSeries);
    setSelectedSeries(updatedSeries);
  };

  const handleEditSeries = () => {
    if (selectedSeries) {
      console.log('✏️ Editing series:', selectedSeries);
      setEditingSeries(selectedSeries);
    }
  };

  const handleSaveSeries = (seriesData: SermonSeries) => {
    console.log('💾 Saving series:', seriesData);
    if (editingSeries) {
      updateSeries(seriesData);
      setSelectedSeries(seriesData);
    } else {
      addSeries(seriesData);
      setSelectedSeries(seriesData);
    }
    setEditingSeries(null);
  };

  const handleCancelEdit = () => {
    console.log('❌ Cancelled series editing');
    setEditingSeries(null);
  };

  // Guard against rendering any detail view before series data has loaded from
  // Supabase. Without this, landing directly on a sermon/series detail while
  // sermonSeries is still empty crashes (e.g. reading `series.artwork` of undefined).
  if (loading) {
    return <LoadingSpinner />;
  }

  // Calendar tab - always show calendar view unless viewing a specific sermon
  if (activeTab === 'calendar') {
    if (calendarSermonSelection && selectedSeries) {
      return (
        <SeriesDetail
          series={selectedSeries}
          onBack={handleBackToList}
          onUpdateSeries={handleUpdateSeries}
          onEditSeries={handleEditSeries}
          fromCalendar={true}
        />
      );
    }
    return <CalendarView onSermonSelect={handleSelectSermonFromCalendar} />;
  }

  // Archived tab
  if (activeTab === 'archived') {
    return (
      <div>
        {selectedSeries && !editingSeries ? (
          <SeriesDetail
            series={selectedSeries}
            onBack={handleBackToList}
            onUpdateSeries={handleUpdateSeries}
            onEditSeries={handleEditSeries}
          />
        ) : editingSeries ? (
          <SeriesForm
            series={editingSeries}
            onSave={handleSaveSeries}
            onCancel={handleCancelEdit}
          />
        ) : (
          <ArchivedSeriesList onSelectSeries={handleSelectSeries} />
        )}
      </div>
    );
  }

  // Main series tab (default)
  if (editingSeries) {
    return (
      <SeriesForm
        series={editingSeries}
        onSave={handleSaveSeries}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (selectedSeries) {
    return (
      <SeriesDetail
        series={selectedSeries}
        onBack={handleBackToList}
        onUpdateSeries={handleUpdateSeries}
        onEditSeries={handleEditSeries}
      />
    );
  }

  return (
    <SermonSeriesList
      onSelectSeries={handleSelectSeries}
    />
  );
};

export default MainContent;