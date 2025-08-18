import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Archive, Trash2, Image } from 'lucide-react';
import { SermonSeries } from '@/types/sermon';
import SeriesForm from './SeriesForm';

interface SermonSeriesListProps {
  onSelectSeries?: (series: SermonSeries) => void;
}

const SermonSeriesList: React.FC<SermonSeriesListProps> = ({ onSelectSeries }) => {
  const { sermonSeries, addSeries, updateSeries, deleteSeries, archiveSeries } = useAppContext();
  // Removed canEdit check - everyone can edit now
  const [showForm, setShowForm] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SermonSeries | null>(null);

  const handleCreateNew = () => {
    setEditingSeries(null);
    setShowForm(true);
  };

  const handleEdit = (series: SermonSeries) => {
    setEditingSeries(series);
    setShowForm(true);
  };

  const handleSave = (seriesData: SermonSeries) => {
    if (editingSeries) {
      updateSeries(seriesData);
    } else {
      addSeries(seriesData);
    }
    setShowForm(false);
    setEditingSeries(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSeries(null);
  };

  const handleDelete = (seriesId: string) => {
    if (confirm('Are you sure you want to delete this series? This action cannot be undone.')) {
      deleteSeries(seriesId);
    }
  };

  const handleArchive = (seriesId: string) => {
    if (confirm('Are you sure you want to archive this series?')) {
      archiveSeries(seriesId);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return isNaN(dateObj.getTime()) ? 'N/A' : dateObj.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const getSafeColor = (series: SermonSeries | null | undefined): string => {
    return (series && typeof series === 'object' && series.color) ? series.color : '#3b82f6';
  };

  if (showForm) {
    return (
      <SeriesForm
        series={editingSeries || undefined}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="flex flex-col items-center justify-center mb-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Sermon Series</h2>
        <Button onClick={handleCreateNew} size="lg" className="bg-gray-800 hover:bg-gray-700 text-green-400">
          <Plus className="h-5 w-5 mr-2" />
          Add New Series
        </Button>
      </div>

      {sermonSeries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Series Yet</h3>
          <p className="text-gray-400 mb-4">Create your first sermon series to get started</p>
          <Button onClick={handleCreateNew} variant="outline" className="bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700">
            <Plus className="h-4 w-4 mr-2" />
            Create First Series
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sermonSeries.map((series) => (
            <Card key={series.id} className="hover:shadow-lg transition-shadow bg-black border-gray-800 overflow-hidden">
              {/* 16:9 Aspect Ratio Thumbnail */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                {series.artwork ? (
                  <img 
                    src={typeof series.artwork === 'string' ? series.artwork : URL.createObjectURL(series.artwork)} 
                    alt={series.title}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    onClick={() => onSelectSeries?.(series)}
                  />
                ) : (
                  <div 
                    className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
                    style={{ backgroundColor: getSafeColor(series) }}
                    onClick={() => onSelectSeries?.(series)}
                  >
                    <Image className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg cursor-pointer text-white" onClick={() => onSelectSeries?.(series)}>
                      {series.title}
                    </CardTitle>
                    <p className="text-sm text-gray-400 capitalize">{series.status}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white mb-3 line-clamp-2 cursor-pointer" onClick={() => onSelectSeries?.(series)}>
                  {series.summary || series.description}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                  <span>{(series.sermons || []).length} sermons</span>
                  <span>
                    {formatDate(series.startDate)} - {formatDate(series.endDate)}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(series);
                    }}
                    className="flex-1 flex flex-col items-center py-3 h-auto bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4 mb-1" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchive(series.id);
                    }}
                    className="flex-1 flex flex-col items-center py-3 h-auto bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700"
                  >
                    <Archive className="h-4 w-4 mb-1" />
                    <span className="text-xs">Archive</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(series.id);
                    }}
                    className="flex-1 flex flex-col items-center py-3 h-auto text-red-400 hover:text-red-300 hover:bg-red-950 bg-gray-800 border-gray-700"
                  >
                    <Trash2 className="h-4 w-4 mb-1" />
                    <span className="text-xs">Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SermonSeriesList;