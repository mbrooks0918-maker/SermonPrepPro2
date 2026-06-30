import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { SermonSeries, Sermon } from '@/types/sermon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Edit, Archive, Trash2, Calendar, Image } from 'lucide-react';
import SermonCard from './SermonCard';
import SermonDetail from './SermonDetail';
import SermonForm from './SermonForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface SeriesDetailProps {
  series: SermonSeries;
  onBack: () => void;
  onUpdateSeries: (series: SermonSeries) => void;
  onEditSeries: () => void;
  fromCalendar?: boolean;
}

const SeriesDetail: React.FC<SeriesDetailProps> = ({ 
  series, 
  onBack, 
  onUpdateSeries, 
  onEditSeries,
  fromCalendar = false 
}) => {
  const { addSermon, updateSermon, deleteSermon, deleteSeries, archiveSeries } = useAppContext();
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [creatingSermon, setCreatingSermon] = useState(false);

  useEffect(() => {
    if ((series as any).selectedSermonId && series.sermons) {
      const sermon = series.sermons.find(s => s.id === (series as any).selectedSermonId);
      if (sermon) {
        setSelectedSermon(sermon);
      }
    }
  }, [series]);

  const getSafeColor = (series: SermonSeries | null | undefined): string => {
    return (series && typeof series === 'object' && series.color) ? series.color : '#6366f1';
  };

  // Safely format a date that may be missing, a string, or unparseable.
  // Returns 'No date set' instead of letting `new Date(...)` render 'Invalid Date'.
  const formatDate = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return 'No date set';
    const date = new Date(value as string | number | Date);
    return isNaN(date.getTime()) ? 'No date set' : date.toLocaleDateString();
  };

  // Series loaded from Supabase carry snake_case `start_date`/`end_date`, while
  // locally-created ones use camelCase — accept either before formatting.
  const startLabel = formatDate((series as any).startDate ?? (series as any).start_date);
  const endLabel = formatDate((series as any).endDate ?? (series as any).end_date);
  const dateRangeLabel =
    startLabel === 'No date set' && endLabel === 'No date set'
      ? 'No date set'
      : `${startLabel} - ${endLabel}`;

  const handleSermonClick = (sermon: Sermon) => {
    setSelectedSermon(sermon);
  };

  const handleBackFromSermon = () => {
    setSelectedSermon(null);
    setEditingSermon(null);
    setCreatingSermon(false);
    if (fromCalendar) {
      onBack();
    }
  };

  const handleSaveSermon = async (sermon: Sermon, shouldNavigateBack: boolean = true) => {
    const isEditing = editingSermon || selectedSermon;

    if (isEditing) {
      await updateSermon(series.id, sermon);
    } else {
      await addSermon(series.id, sermon);
    }

    const updatedSeries = { ...series };
    if (isEditing) {
      updatedSeries.sermons = updatedSeries.sermons.map(s =>
        s.id === sermon.id ? sermon : s
      );
    } else {
      updatedSeries.sermons = [...updatedSeries.sermons, sermon];
    }
    onUpdateSeries(updatedSeries);

    if (shouldNavigateBack) {
      setEditingSermon(null);
      setCreatingSermon(false);
      setSelectedSermon(null);
      if (fromCalendar) {
        onBack();
      }
    }
  };

  const handleDeleteSermon = async (sermon: Sermon) => {
    await deleteSermon(series.id, sermon.id);
    const updatedSeries = {
      ...series,
      sermons: series.sermons.filter(s => s.id !== sermon.id)
    };
    onUpdateSeries(updatedSeries);
    setSelectedSermon(null);
  };

  const handleEditSermon = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setSelectedSermon(null);
  };

  const handleDeleteSeries = async () => {
    await deleteSeries(series.id);
    onBack();
  };

  const handleArchiveSeries = async () => {
    await archiveSeries(series.id);
    onBack();
  };

  if (selectedSermon) {
    return (
      <SermonDetail
        sermon={selectedSermon}
        onBack={handleBackFromSermon}
        onSave={handleSaveSermon}
        onDelete={() => handleDeleteSermon(selectedSermon)}
      />
    );
  }

  if (editingSermon || creatingSermon) {
    return (
      <SermonForm
        sermon={editingSermon}
        seriesId={series.id}
        onSave={handleSaveSermon}
        onCancel={() => {
          setEditingSermon(null);
          setCreatingSermon(false);
        }}
      />
    );
  }

  const safeColor = getSafeColor(series);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {fromCalendar ? 'Back to Calendar' : 'Back to Series'}
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={onEditSeries} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Series
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive Series</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to archive this series? You can restore it later from the archived section.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleArchiveSeries}>Archive</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Series</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this series? This action cannot be undone and will delete all sermons in this series.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteSeries} className="bg-destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              {series.artwork ? (
                <img
                  src={series.artwork}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{series.title}</CardTitle>
              <p className="text-muted-foreground mb-4">{series.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {dateRangeLabel}
                </div>
                <Badge variant="secondary">{series.sermons?.length || 0} sermons</Badge>
                <Badge variant="outline" style={{ borderColor: safeColor, color: safeColor }}>
                  {series.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Sermons</h3>
        <Button onClick={() => setCreatingSermon(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Sermon
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {series.sermons?.map((sermon) => (
          <SermonCard
            key={sermon.id}
            sermon={sermon}
            seriesColor={safeColor}
            onClick={() => handleSermonClick(sermon)}
            onDelete={() => handleDeleteSermon(sermon)}
          />
        ))}
      </div>

      {(!series.sermons || series.sermons.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No sermons in this series yet.</p>
            <Button onClick={() => setCreatingSermon(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Sermon
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeriesDetail;
