import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SermonSeries } from '@/types/sermon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RotateCcw, Trash2, Eye, Image } from 'lucide-react';

interface ArchivedSeriesListProps {
  onSelectSeries: (series: SermonSeries) => void;
}

const ArchivedSeriesList: React.FC<ArchivedSeriesListProps> = ({ onSelectSeries }) => {
  const { archivedSeries, unarchiveSeries, deleteSeries } = useAppContext();
  const [deleteSeriesId, setDeleteSeriesId] = useState<string | null>(null);

  const handleUnarchive = (seriesId: string) => {
    unarchiveSeries(seriesId);
  };

  const handleDelete = (seriesId: string) => {
    deleteSeries(seriesId);
    setDeleteSeriesId(null);
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

  if (archivedSeries.length === 0) {
    return (
      <div className="p-6 bg-black min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-white">Archived Series</h2>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Archived Series</h3>
          <p className="text-gray-400">Series you archive will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-white">Archived Series</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivedSeries.map((series) => (
          <Card key={series.id} className="hover:shadow-lg transition-shadow bg-black border-gray-800 overflow-hidden">
            {/* 16:9 Aspect Ratio Thumbnail */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              {series.artwork ? (
                <img 
                  src={typeof series.artwork === 'string' ? series.artwork : URL.createObjectURL(series.artwork)} 
                  alt={series.title}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  onClick={() => onSelectSeries(series)}
                />
              ) : (
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: series.color || '#3b82f6' }}
                  onClick={() => onSelectSeries(series)}
                >
                  <Image className="h-16 w-16 text-white opacity-50" />
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg cursor-pointer text-white" onClick={() => onSelectSeries(series)}>
                    {series.title}
                  </CardTitle>
                  <p className="text-sm text-gray-400 capitalize">{series.status}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white mb-3 line-clamp-2 cursor-pointer" onClick={() => onSelectSeries(series)}>
                {series.summary || series.description}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                <span>{series.sermons.length} sermons</span>
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
                    onSelectSeries(series);
                  }}
                  className="flex-1 flex flex-col items-center py-3 h-auto bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700"
                >
                  <Eye className="h-4 w-4 mb-1" />
                  <span className="text-xs">View</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnarchive(series.id);
                  }}
                  className="flex-1 flex flex-col items-center py-3 h-auto bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700"
                >
                  <RotateCcw className="h-4 w-4 mb-1" />
                  <span className="text-xs">Unarchive</span>
                </Button>
                
                <AlertDialog open={deleteSeriesId === series.id} onOpenChange={(open) => !open && setDeleteSeriesId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteSeriesId(series.id);
                      }}
                      className="flex-1 flex flex-col items-center py-3 h-auto text-red-400 hover:text-red-300 hover:bg-red-950 bg-gray-800 border-gray-700"
                    >
                      <Trash2 className="h-4 w-4 mb-1" />
                      <span className="text-xs">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black border-gray-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Series</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-400">
                        Are you sure you want to permanently delete "{series.title}"? This action cannot be undone and will delete all sermons in this series.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(series.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArchivedSeriesList;