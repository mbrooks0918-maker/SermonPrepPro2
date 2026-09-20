import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Palette, FileText, User, RotateCcw } from 'lucide-react';

const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'Georgia', value: "Georgia, 'Times New Roman', serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { label: 'Garamond', value: "Garamond, 'Times New Roman', serif" },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
];

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24];

const ACCENT_PRESETS = ['#16a34a', '#2563eb', '#7c3aed', '#db2777', '#ea580c', '#0891b2'];

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetAIInstructions, resetAll } = useSettings();

  const selectClass =
    'h-10 w-full rounded-md border border-gray-700 bg-black px-3 text-sm text-white focus:outline-none';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={resetAll}
          className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset all to defaults
        </Button>
      </div>

      {/* AI Assistant Instructions */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Sparkles className="h-5 w-5" />
              AI Assistant Instructions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={resetAIInstructions}
              className="bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore default
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            These instructions are sent to the AI every time you click “Generate Prep Content”.
            Tailor the voice, theology, preaching style, and output to your preference. Use{' '}
            <code className="text-green-400">{'{{title}}'}</code>,{' '}
            <code className="text-green-400">{'{{scripture}}'}</code>, and{' '}
            <code className="text-green-400">{'{{theme}}'}</code> as placeholders — they’re filled in
            from each sermon automatically.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.aiInstructions}
            onChange={(e) => updateSettings({ aiInstructions: e.target.value })}
            className="min-h-[420px] bg-black text-white border-gray-700 font-mono text-sm leading-relaxed"
            spellCheck={false}
          />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            Accent color for primary buttons, active tabs, and highlights.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label="Accent color"
              value={settings.accentColor || '#16a34a'}
              onChange={(e) => updateSettings({ accentColor: e.target.value })}
              className="h-10 w-14 cursor-pointer rounded border border-gray-700 bg-transparent p-1"
            />
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => updateSettings({ accentColor: c })}
                  className="h-8 w-8 rounded-full border-2 border-gray-700"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSettings({ accentColor: '' })}
              className="ml-auto bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700"
            >
              Use default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes editor defaults */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <FileText className="h-5 w-5" />
            Sermon Notes Editor
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            Default font and size for the notes document.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Default font</Label>
            <select
              className={selectClass}
              value={settings.notesFontFamily}
              onChange={(e) => updateSettings({ notesFontFamily: e.target.value })}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.label} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white">Default size (pt)</Label>
            <select
              className={selectClass}
              value={settings.notesFontSize}
              onChange={(e) => updateSettings({ notesFontSize: Number(e.target.value) })}
            >
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sermon defaults */}
      <Card className="bg-black border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <User className="h-5 w-5" />
            Sermon Defaults
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            Prefilled when creating a new sermon.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label className="text-white">Default communicator</Label>
            <Input
              value={settings.defaultCommunicator}
              onChange={(e) => updateSettings({ defaultCommunicator: e.target.value })}
              placeholder="e.g. Pastor's name"
              className="bg-black text-white border-gray-700 placeholder-gray-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
