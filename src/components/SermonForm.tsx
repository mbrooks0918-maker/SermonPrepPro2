import React, { useState } from 'react';
import { Sermon } from '@/types/sermon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCalendar } from '@/contexts/CalendarContext';

interface SermonFormProps {
  sermon?: Sermon;
  onSave: (sermon: Sermon) => void;
  onCancel: () => void;
  seriesId?: string;
  seriesTitle?: string;
  seriesColor?: string;
}

const SermonForm: React.FC<SermonFormProps> = ({ 
  sermon, 
  onSave, 
  onCancel, 
  seriesId, 
  seriesTitle, 
  seriesColor 
}) => {
  const { addEvent, removeEvent, updateEvent, events } = useCalendar();
  const [formData, setFormData] = useState<Partial<Sermon>>({
    title: sermon?.title || '',
    theme: sermon?.theme || '',
    scripture: sermon?.scripture || '',
    date: sermon?.date || new Date(),
    notes: sermon?.notes || '',
    serviceAgenda: sermon?.serviceAgenda || '',
    songs: sermon?.songs || '',
    creativeElements: sermon?.creativeElements || '',
    announcements: sermon?.announcements || '',
    socialMediaPlan: sermon?.socialMediaPlan || '',
    communicator: sermon?.communicator || '',
    status: sermon?.status || 'draft',
    customFields: sermon?.customFields || {}
  });
  const [brainstorming, setBrainstorming] = useState('');
  const [bottomLine, setBottomLine] = useState(sermon?.customFields?.bottomLine || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sermonData: Sermon = {
      id: sermon?.id || Date.now().toString(),
      title: formData.title || 'Untitled Sermon',
      theme: formData.theme || '',
      scripture: formData.scripture || '',
      date: formData.date || new Date(),
      notes: formData.notes || '',
      serviceAgenda: formData.serviceAgenda || '',
      songs: formData.songs || '',
      creativeElements: formData.creativeElements || '',
      announcements: formData.announcements || '',
      socialMediaPlan: formData.socialMediaPlan || '',
      communicator: formData.communicator || '',
      customFields: {
        ...formData.customFields,
        bottomLine: bottomLine
      },
      status: formData.status || 'draft'
    };

    // Handle calendar entry for new sermons
    if (!sermon && seriesId && seriesTitle) {
      addEvent({
        title: seriesTitle,
        subtitle: sermonData.title,
        date: sermonData.date,
        type: 'sermon',
        sermonId: sermonData.id,
        seriesId: seriesId,
        color: seriesColor || '#3b82f6'
      });
    }

    onSave(sermonData);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && date >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setFormData({ ...formData, date });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2 bg-gray-800 text-green-400 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-white">{sermon ? 'Edit Sermon' : 'Create New Sermon'}</h1>
        <div />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-black text-white border-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="theme" className="text-white">Theme</Label>
                <Input
                  id="theme"
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="bg-black text-white border-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="scripture" className="text-white">Scripture</Label>
                <Input
                  id="scripture"
                  value={formData.scripture}
                  onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                  className="bg-black text-white border-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="communicator" className="text-white">Communicator</Label>
                <Input
                  id="communicator"
                  value={formData.communicator}
                  onChange={(e) => setFormData({ ...formData, communicator: e.target.value })}
                  placeholder="Who is delivering this sermon?"
                  className="bg-black text-white border-gray-700 placeholder-gray-400"
                />
              </div>
              <div>
                <Label className="text-white">Sermon Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-black text-white border-gray-700",
                        !formData.date && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border-gray-700">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="bg-black text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Brainstorming</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="brainstorming" className="text-white">Ideas & Thoughts</Label>
                <Textarea
                  id="brainstorming"
                  placeholder="Brainstorm ideas, thoughts, and inspiration for this sermon..."
                  className="min-h-32 bg-black text-white border-gray-700 placeholder-gray-400"
                  value={brainstorming}
                  onChange={(e) => setBrainstorming(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Sermon Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Sermon outline, key points, illustrations..."
                className="min-h-32 bg-black text-white border-gray-700 placeholder-gray-400"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="bottomLine" className="text-white">Bottom Line</Label>
              <Textarea
                id="bottomLine"
                value={bottomLine}
                onChange={(e) => setBottomLine(e.target.value)}
                placeholder="Main takeaway or key message..."
                className="bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700">
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-green-400">
            <Save className="h-4 w-4" />
            {sermon ? 'Update Sermon' : 'Create Sermon'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SermonForm;