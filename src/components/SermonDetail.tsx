import React, { useState } from 'react';
import { Sermon } from '@/types/sermon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Trash2, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface SermonDetailProps {
  sermon: Sermon;
  onBack: () => void;
  onSave: (sermon: Sermon) => void;
  onDelete: () => void;
}

const SermonDetail: React.FC<SermonDetailProps> = ({ sermon, onBack, onSave, onDelete }) => {
  const [editedSermon, setEditedSermon] = useState<Sermon>(sermon);
  const [isSaving, setIsSaving] = useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    
    // Create a proper local date to avoid timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setEditedSermon({ ...editedSermon, date: localDate });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Ensure date is properly formatted as a Date object
      const sermonToSave = {
        ...editedSermon,
        date: editedSermon.date instanceof Date ? editedSermon.date : new Date(editedSermon.date)
      };
      
      // Save the sermon and wait for completion
      await onSave(sermonToSave);
      
      // Add a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Close the detail view after saving is complete
      onBack();
      
    } catch (error) {
      console.error('Error saving sermon:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 bg-gray-800 text-green-400 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Series
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={editedSermon.status === 'complete' ? 'default' : 'secondary'} className="bg-gray-800 text-green-400">
            {editedSermon.status}
          </Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="bg-red-900 hover:bg-red-800">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-black border-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete Sermon</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Are you sure you want to delete this sermon? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-900 hover:bg-red-800">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-green-400"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

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
                value={editedSermon.title}
                onChange={(e) => setEditedSermon({ ...editedSermon, title: e.target.value })}
                className="bg-black text-white border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="theme" className="text-white">Theme</Label>
              <Input
                id="theme"
                value={editedSermon.theme}
                onChange={(e) => setEditedSermon({ ...editedSermon, theme: e.target.value })}
                className="bg-black text-white border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="scripture" className="text-white">Scripture</Label>
              <Input
                id="scripture"
                value={editedSermon.scripture}
                onChange={(e) => setEditedSermon({ ...editedSermon, scripture: e.target.value })}
                className="bg-black text-white border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-white">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-black text-white border-gray-700 hover:bg-gray-800"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {editedSermon.date ? format(editedSermon.date instanceof Date ? editedSermon.date : new Date(editedSermon.date.toString().split('T')[0] + 'T00:00:00'), 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-black border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={editedSermon.date ? (editedSermon.date instanceof Date ? editedSermon.date : new Date(editedSermon.date.toString().split('T')[0] + 'T00:00:00')) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                    className="bg-black text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="communicator" className="text-white">Communicator</Label>
              <Input
                id="communicator"
                value={editedSermon.communicator}
                onChange={(e) => setEditedSermon({ ...editedSermon, communicator: e.target.value })}
                placeholder="Who is delivering this sermon?"
                className="bg-black text-white border-gray-700 placeholder-gray-400"
              />
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
                value={editedSermon.customFields?.brainstorming || ''}
                onChange={(e) => setEditedSermon({ 
                  ...editedSermon, 
                  customFields: { 
                    ...editedSermon.customFields, 
                    brainstorming: e.target.value 
                  }
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Sermon Notes - Larger card positioned after communicator */}
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
              className="min-h-48 bg-black text-white border-gray-700 placeholder-gray-400"
              value={editedSermon.notes}
              onChange={(e) => setEditedSermon({ ...editedSermon, notes: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bottomLine" className="text-white">Bottom Line</Label>
            <Textarea
              id="bottomLine"
              placeholder="Key takeaway or main message..."
              value={editedSermon.customFields?.bottomLine || ''}
              onChange={(e) => setEditedSermon({ 
                ...editedSermon, 
                customFields: { 
                  ...editedSermon.customFields, 
                  bottomLine: e.target.value 
                }
              })}
              className="min-h-24 bg-black text-white border-gray-700 placeholder-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Service Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="serviceAgenda" className="text-white">Agenda Items</Label>
              <Textarea
                id="serviceAgenda"
                placeholder="Order of service, timing, special elements..."
                className="min-h-32 bg-black text-white border-gray-700 placeholder-gray-400"
                value={editedSermon.serviceAgenda || ''}
                onChange={(e) => setEditedSermon({ 
                  ...editedSermon, 
                  serviceAgenda: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="announcements" className="text-white">Service Announcements</Label>
              <Textarea
                id="announcements"
                placeholder="Important announcements for this service..."
                className="min-h-32 bg-black text-white border-gray-700 placeholder-gray-400"
                value={editedSermon.announcements || ''}
                onChange={(e) => setEditedSermon({ 
                  ...editedSermon, 
                  announcements: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Social Media Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="socialMediaPlan" className="text-white">Social Media Strategy</Label>
              <Textarea
                id="socialMediaPlan"
                placeholder="Posts, hashtags, promotional content..."
                className="min-h-32 bg-black text-white border-gray-700 placeholder-gray-400"
                value={editedSermon.socialMediaPlan || ''}
                onChange={(e) => setEditedSermon({ 
                  ...editedSermon, 
                  socialMediaPlan: e.target.value
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default SermonDetail;