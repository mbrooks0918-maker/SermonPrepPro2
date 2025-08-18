import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SermonSeries } from '@/types/sermon';
import { ArrowLeft, X, Image, Video, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SeriesFormProps {
  series?: SermonSeries;
  onSave: (series: SermonSeries) => void;
  onCancel: () => void;
}

const SeriesForm: React.FC<SeriesFormProps> = ({ series, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    color: '#3b82f6',
    status: 'planning' as const,
    artworkUrl: '' as string,
    bumperVideoUrl: '' as string
  });
  const [uploading, setUploading] = useState({ artwork: false, video: false });

  useEffect(() => {
    if (series) {
      setFormData({
        title: series.title,
        description: series.description,
        summary: series.summary,
        color: series.color,
        status: series.status,
        artworkUrl: typeof series.artwork === 'string' ? series.artwork : '',
        bumperVideoUrl: typeof series.bumperVideo === 'string' ? series.bumperVideo : ''
      });
    }
  }, [series]);

  const uploadFile = async (file: File, type: 'artwork' | 'video'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('series-media')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('series-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'artwork' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [type]: true }));

    const publicUrl = await uploadFile(file, type);
    
    if (publicUrl) {
      if (type === 'artwork') {
        setFormData(prev => ({ ...prev, artworkUrl: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, bumperVideoUrl: publicUrl }));
      }
    }

    setUploading(prev => ({ ...prev, [type]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 28);
    
    const seriesData: SermonSeries = {
      id: series?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      summary: formData.summary,
      color: formData.color,
      startDate: today,
      endDate: endDate,
      sermons: series?.sermons || [],
      collaborators: series?.collaborators || [],
      status: formData.status,
      artwork: formData.artworkUrl || null,
      bumperVideo: formData.bumperVideoUrl || null
    };
    
    onSave(seriesData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const removeFile = (type: 'artwork' | 'video') => {
    if (type === 'artwork') {
      setFormData(prev => ({ ...prev, artworkUrl: '' }));
    } else {
      setFormData(prev => ({ ...prev, bumperVideoUrl: '' }));
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onCancel} className="bg-gray-800 text-green-400 hover:bg-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-center flex-1 text-white">
          {series ? 'Edit Series' : 'Add New Series'}
        </h2>
      </div>

      <Card className="max-w-4xl mx-auto bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="text-center text-white">Series Information</CardTitle>
        </CardHeader>
        <CardContent className="bg-black">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-medium">Series Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter series title"
                  required
                  className="bg-black text-white border-gray-700 placeholder-gray-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white font-medium">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger className="bg-black text-white border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border-gray-700">
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-medium">Series Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed description of the series"
                rows={4}
                required
                className="bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-white font-medium">Duration</Label>
              <Input
                id="summary"
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Brief summary for cards and lists"
                className="bg-black text-white border-gray-700 placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color" className="text-white font-medium">Theme Color</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="bg-black border-gray-700"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white font-medium">Series Artwork</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                  {formData.artworkUrl ? (
                    <div className="relative">
                      <img src={formData.artworkUrl} alt="Artwork" className="w-full h-32 object-cover rounded" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('artwork')}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="artwork" className="cursor-pointer">
                          <span className="text-green-400 hover:text-green-300">
                            {uploading.artwork ? 'Uploading...' : 'Upload artwork'}
                          </span>
                          <input
                            id="artwork"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'artwork')}
                            disabled={uploading.artwork}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white font-medium">Bumper Video</Label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                  {formData.bumperVideoUrl ? (
                    <div className="relative">
                      <video src={formData.bumperVideoUrl} className="w-full h-32 object-cover rounded" controls />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('video')}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="bumperVideo" className="cursor-pointer">
                          <span className="text-green-400 hover:text-green-300">
                            {uploading.video ? 'Uploading...' : 'Upload video'}
                          </span>
                          <input
                            id="bumperVideo"
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'video')}
                            disabled={uploading.video}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-green-400"
                disabled={uploading.artwork || uploading.video}
              >
                {series ? 'Update Series' : 'Create Series'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="bg-gray-800 text-green-400 border-gray-700 hover:bg-gray-700">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeriesForm;