import React, { useState } from 'react';
import { Sermon, SermonSeries } from '@/types/sermon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, ArrowLeft, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCalendar } from '@/contexts/CalendarContext';

interface CreateSermonFormProps {
  series: SermonSeries;
  onSave: (sermon: Sermon) => void;
  onCancel: () => void;
}

const CreateSermonForm: React.FC<CreateSermonFormProps> = ({ series, onSave, onCancel }) => {
  const { addEvent } = useCalendar();
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    text: '',
    teacher: '',
    date: new Date(),
    notes: '',
    bottomLine: '',
    mediaFiles: [] as File[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sermon: Sermon = {
      id: Date.now().toString(),
      title: formData.title,
      theme: formData.theme,
      scripture: formData.text,
      date: formData.date,
      notes: formData.notes,
      serviceAgenda: '',
      songs: '',
      creativeElements: '',
      announcements: '',
      socialMediaPlan: '',
      communicator: formData.teacher,
      customFields: {
        bottomLine: formData.bottomLine,
        mediaFiles: formData.mediaFiles.map(f => f.name)
      },
      status: 'draft'
    };

    // Add to calendar with series artwork
    addEvent({
      title: series.title,
      subtitle: formData.title,
      date: formData.date,
      type: 'sermon',
      sermonId: sermon.id,
      seriesId: series.id,
      color: series.color
    });

    onSave(sermon);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} className="flex items-center gap-2 bg-gray-800 text-green-400 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Series
        </Button>
        <h1 className="text-2xl font-bold text-white">Create Sermon for "{series.title}"</h1>
        <div />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Sermon Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white font-medium">Sermon Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1 bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            
            <div>
              <Label htmlFor="theme" className="text-white font-medium">Theme</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="e.g., Love, Faith, Hope"
                className="mt-1 bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="text" className="text-white font-medium">Scripture Text</Label>
              <Input
                id="text"
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                placeholder="e.g., John 3:16-17"
                className="mt-1 bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="teacher" className="text-white font-medium">Who's Teaching</Label>
              <Input
                id="teacher"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                placeholder="Speaker name"
                className="mt-1 bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <Label className="text-white font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-black text-white border-gray-700",
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
                    onSelect={(date) => date && setFormData({ ...formData, date })}
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
            <CardTitle className="text-white">Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-white font-medium">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Sermon notes, outline, key points..."
                className="min-h-32 mt-1 bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="bottomLine" className="text-white font-medium">Bottom Line</Label>
              <Textarea
                id="bottomLine"
                value={formData.bottomLine}
                onChange={(e) => setFormData({ ...formData, bottomLine: e.target.value })}
                placeholder="Main takeaway or key message..."
                rows={3}
                className="mt-1 bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Media Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="media" className="text-white font-medium">Upload Multiple Files</Label>
              <Input
                id="media"
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileUpload}
                className="cursor-pointer mt-1 bg-black text-white border-gray-700"
              />
            </div>

            {formData.mediaFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-white font-medium">Uploaded Files ({formData.mediaFiles.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.mediaFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded border border-gray-800">
                      <span className="text-sm truncate flex-1 text-white">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700">
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-green-400">
            <Save className="h-4 w-4" />
            Create Sermon
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSermonForm;