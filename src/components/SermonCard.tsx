import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Sermon } from '@/types/sermon';

interface SermonCardProps {
  sermon: Sermon;
  seriesColor: string;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SermonCard: React.FC<SermonCardProps> = ({ 
  sermon, 
  seriesColor, 
  onClick, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (date: Date | string | null | undefined) => {
    if (date === null || date === undefined || date === '') return 'Unscheduled';

    // Handle date string to prevent timezone issues
    let dateObj: Date;
    if (typeof date === 'string') {
      // Split the date string and create a local date
      const [year, month, day] = date.split('T')[0].split('-');
      dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      dateObj = date;
    }

    // Guard against unparseable values so we never render "Invalid Date".
    if (isNaN(dateObj.getTime())) return 'Unscheduled';

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4" 
      style={{ borderLeftColor: seriesColor }}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
            {sermon.title || 'Untitled Sermon'}
          </CardTitle>
          <Badge variant={sermon.status === 'published' ? 'default' : 'secondary'}>
            {sermon.status || 'draft'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {sermon.scripture || 'No scripture reference'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(sermon.date)}
            </span>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="flex-1 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SermonCard;