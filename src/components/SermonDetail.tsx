import React, { useState, useEffect, useRef } from 'react';
import { Sermon } from '@/types/sermon';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Calendar, Sparkles, RefreshCw, Check, Loader2, Radio } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface SermonDetailProps {
  sermon: Sermon;
  onBack: () => void;
  onSave: (sermon: Sermon, shouldNavigateBack?: boolean) => void;
  onDelete: () => void;
}

const SermonDetail: React.FC<SermonDetailProps> = ({ sermon, onBack, onSave, onDelete }) => {
  const [editedSermon, setEditedSermon] = useState<Sermon>(sermon);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiContent, setAiContent] = useState<string>((sermon as any).ai_content || '');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [isLive, setIsLive] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const focusedField = useRef<string | null>(null);
  const lastLocalSaveAt = useRef<number>(0);
  const lastAppliedUpdatedAt = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`sermon-${sermon.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sermons',
          filter: `id=eq.${sermon.id}`
        },
        (payload: any) => {
          const updated = payload.new;

          const now = Date.now();
          if (now - lastLocalSaveAt.current < 3000) {
            return;
          }

          if (updated.updated_at && updated.updated_at === lastAppliedUpdatedAt.current) {
            return;
          }
          lastAppliedUpdatedAt.current = updated.updated_at || null;

          setEditedSermon(prev => {
            const merged = { ...prev };
            if (focusedField.current !== 'title') merged.title = updated.title ?? prev.title;
            if (focusedField.current !== 'theme') merged.theme = updated.theme ?? prev.theme;
            if (focusedField.current !== 'scripture') merged.scripture = updated.scripture ?? prev.scripture;
            if (focusedField.current !== 'notes') merged.notes = updated.notes ?? prev.notes;
            if (focusedField.current !== 'communicator') merged.communicator = updated.communicator ?? prev.communicator;
            if (focusedField.current !== 'serviceAgenda') merged.serviceAgenda = updated.service_agenda ?? prev.serviceAgenda;
            if (focusedField.current !== 'announcements') merged.announcements = updated.announcements ?? prev.announcements;
            if (focusedField.current !== 'socialMediaPlan') merged.socialMediaPlan = updated.social_media_plan ?? prev.socialMediaPlan;
            if (focusedField.current !== 'brainstorming') {
              merged.customFields = {
                ...prev.customFields,
                brainstorming: updated.custom_fields?.brainstorming ?? prev.customFields?.brainstorming
              };
            }
            if (focusedField.current !== 'bottomLine') {
              merged.customFields = {
                ...merged.customFields,
                bottomLine: updated.custom_fields?.bottomLine ?? prev.customFields?.bottomLine
              };
            }
            (merged as any).ai_content = updated.ai_content ?? (prev as any).ai_content;
            return merged;
          });

          if (updated.ai_content !== undefined) {
            setAiContent(updated.ai_content || '');
          }
        }
      )
      .subscribe((status: string) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sermon.id]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');

    saveTimer.current = setTimeout(async () => {
      try {
        const sermonToSave = {
          ...editedSermon,
          date: editedSermon.date ? (editedSermon.date instanceof Date ? editedSermon.date : new Date(editedSermon.date)) : null
        };
        lastLocalSaveAt.current = Date.now();
        await onSave(sermonToSave, false);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (error) {
        console.error('Autosave error:', error);
        setSaveStatus('idle');
      }
    }, 2000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [editedSermon]);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    setEditedSermon({ ...editedSermon, date: localDate });
  };

  // Clear the sermon's date without deleting the sermon; it becomes "Unscheduled".
  const handleClearDate = () => {
    setEditedSermon({ ...editedSermon, date: null as any });
  };

  // Parse the current sermon date safely; returns null when missing/unparseable
  // so we never feed an Invalid Date to date-fns' format().
  const getSermonDate = (): Date | null => {
    const value = editedSermon.date;
    if (!value) return null;
    const dateObj = value instanceof Date
      ? value
      : new Date(value.toString().split('T')[0] + 'T00:00:00');
    return isNaN(dateObj.getTime()) ? null : dateObj;
  };

  const handleGenerateAI = async () => {
    const title = editedSermon.title || '';
    const scripture = editedSermon.scripture || '';
    const theme = editedSermon.theme || '';

    if (!scripture && !theme && !title) {
      setAiError('Please fill in at least a title, scripture, or theme before generating.');
      return;
    }

    setIsLoadingAI(true);
    setAiError('');
    setAiContent('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, scripture, theme }),
      });

      const data = await response.json();

      if (data?.result) {
        const generated = data.result;
        setAiContent(generated);
        const sermonWithAI = {
          ...editedSermon,
          ai_content: generated,
          date: editedSermon.date ? (editedSermon.date instanceof Date ? editedSermon.date : new Date(editedSermon.date)) : null
        } as any;
        lastLocalSaveAt.current = Date.now();
        await onSave(sermonWithAI, false);
        setEditedSermon(sermonWithAI);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else if (data?.error) {
        setAiError(data.error);
      } else {
        setAiError('No response received. Please try again.');
      }
    } catch (err) {
      console.error('AI generation error:', err);
      setAiError('Something went wrong connecting to the AI. Please try again.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const formatAIContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-green-400 mt-4 mb-1">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.match(/^\d+\.\s\*\*/)) {
        const cleaned = line.replace(/\*\*/g, '');
        return <p key={i} className="font-semibold text-green-300 mt-3 mb-1">{cleaned}</p>;
      }
      if (line.startsWith('- ')) {
        return <p key={i} className="text-gray-300 ml-4">• {line.slice(2)}</p>;
      }
      if (line.trim() === '') {
        return <div key={i} className="h-1" />;
      }
      return <p key={i} className="text-gray-300">{line}</p>;
    });
  };

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">

      {isLive && (
        <div className="flex items-center gap-2 bg-green-950 border border-green-800 rounded-lg px-4 py-2 text-green-400 text-sm">
          <Radio className="h-3 w-3 animate-pulse" />
          Live — changes from your team appear here automatically
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 bg-gray-800 text-green-400 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Series
        </Button>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
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
        </div>
      </div>

      <Card className="bg-gray-950 border border-green-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-400" />
              <CardTitle className="text-green-400">AI Sermon Assistant</CardTitle>
            </div>
            <Button
              onClick={handleGenerateAI}
              disabled={isLoadingAI}
              className="flex items-center gap-2 bg-green-900 hover:bg-green-800 text-white text-sm"
            >
              {isLoadingAI ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {aiContent ? 'Regenerate' : 'Generate Prep Content'}
                </>
              )}
            </Button>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            Hopefully, this will be helpful content and give you a head start preparing this message.
          </p>
        </CardHeader>
        <CardContent>
          {aiError && (
            <p className="text-red-400 text-sm">{aiError}</p>
          )}
          {!aiContent && !isLoadingAI && !aiError && (
            <p className="text-gray-400 text-sm italic">
              Fill in the title, scripture, and theme then click "Generate Prep Content" to get started.
            </p>
          )}
          {isLoadingAI && (
            <div className="space-y-2">
              <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
            </div>
          )}
          {aiContent && !isLoadingAI && (
            <div className="text-sm leading-relaxed space-y-1">
              {formatAIContent(aiContent)}
            </div>
          )}
        </CardContent>
      </Card>

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
                onFocus={() => { focusedField.current = 'title'; }}
                onBlur={() => { focusedField.current = null; }}
                onChange={(e) => setEditedSermon({ ...editedSermon, title: e.target.value })}
                className="bg-black text-white border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="theme" className="text-white">Theme</Label>
              <Input
                id="theme"
                value={editedSermon.theme}
                onFocus={() => { focusedField.current = 'theme'; }}
                onBlur={() => { focusedField.current = null; }}
                onChange={(e) => setEditedSermon({ ...editedSermon, theme: e.target.value })}
                className="bg-black text-white border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="scripture" className="text-white">Scripture</Label>
              <Input
                id="scripture"
                value={editedSermon.scripture}
                onFocus={() => { focusedField.current = 'scripture'; }}
                onBlur={() => { focusedField.current = null; }}
                onChange={(e) => setEditedSermon({ ...editedSermon, scripture: e.target.value })}
                className="bg-black text-white border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-white">Date</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal bg-black text-white border-gray-700 hover:bg-gray-800"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {getSermonDate() ? format(getSermonDate() as Date, 'PPP') : 'Unscheduled'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border-gray-700">
                    <CalendarComponent
                      mode="single"
                      selected={getSermonDate() ?? undefined}
                      onSelect={handleDateChange}
                      initialFocus
                      className="bg-black text-white"
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearDate}
                  disabled={!editedSermon.date}
                  className="bg-black text-white border-gray-700 hover:bg-gray-800"
                >
                  Clear Date
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="communicator" className="text-white">Communicator</Label>
              <Input
                id="communicator"
                value={editedSermon.communicator}
                onFocus={() => { focusedField.current = 'communicator'; }}
                onBlur={() => { focusedField.current = null; }}
                onChange={(e) => setEditedSermon({ ...editedSermon, communicator: e.target.value })}
                placeholder="Who is delivering this sermon?"
                className="bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-white">Brainstorming</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex flex-col flex-1">
              <Label htmlFor="brainstorming" className="text-white mb-2">Ideas & Thoughts</Label>
              <Textarea
                id="brainstorming"
                placeholder="Brainstorm ideas, thoughts, and inspiration for this sermon..."
                className="flex-1 bg-black text-white border-gray-700 placeholder-gray-400"
                value={editedSermon.customFields?.brainstorming || ''}
                onFocus={() => { focusedField.current = 'brainstorming'; }}
                onBlur={() => { focusedField.current = null; }}
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
              onFocus={() => { focusedField.current = 'notes'; }}
              onBlur={() => { focusedField.current = null; }}
              onChange={(e) => setEditedSermon({ ...editedSermon, notes: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bottomLine" className="text-white">Bottom Line</Label>
            <Textarea
              id="bottomLine"
              placeholder="Key takeaway or main message..."
              value={editedSermon.customFields?.bottomLine || ''}
              onFocus={() => { focusedField.current = 'bottomLine'; }}
              onBlur={() => { focusedField.current = null; }}
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
                onFocus={() => { focusedField.current = 'serviceAgenda'; }}
                onBlur={() => { focusedField.current = null; }}
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
                onFocus={() => { focusedField.current = 'announcements'; }}
                onBlur={() => { focusedField.current = null; }}
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
                onFocus={() => { focusedField.current = 'socialMediaPlan'; }}
                onBlur={() => { focusedField.current = null; }}
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
