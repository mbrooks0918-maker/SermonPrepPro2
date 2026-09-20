import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Heading1, Heading2, Pilcrow,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Eraser, Printer, Baseline, Highlighter, Download, FileText, FileType
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from '@/components/ui/dropdown-menu';

interface SermonNotesEditorProps {
  value: string;
  onChange: (html: string) => void;
  title?: string;
  defaultFontFamily?: string;
  defaultFontSize?: number;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Treat stored content as HTML only when it actually contains tags; otherwise
// render it as plain text so legacy plain-text notes stay intact and safe.
const looksLikeHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value || '');

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

const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48];

const SermonNotesEditor: React.FC<SermonNotesEditorProps> = ({
  value, onChange, title,
  defaultFontFamily = "Georgia, 'Times New Roman', serif",
  defaultFontSize = 12,
  onFocus, onBlur
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);

  // Prefer inline CSS styling for commands (color/font apply as style attrs).
  useEffect(() => {
    try { document.execCommand('styleWithCSS', false, 'true'); } catch (e) { /* noop */ }
  }, []);

  // Sync incoming value into the editor without stealing the caret while the
  // pastor is typing (also lets live/Realtime updates flow in when unfocused).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const incoming = value || '';
    if (incoming === el.innerHTML) return;
    if (looksLikeHtml(incoming) || incoming === '') {
      el.innerHTML = incoming;
    } else {
      el.textContent = incoming;
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Remember the current selection so toolbar dropdowns / color pickers (which
  // steal focus from the editor) can restore it before applying a command.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const range = savedRange.current;
    if (!range || !el.contains(range.commonAncestorContainer)) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const runCommand = (command: string, arg?: string) => {
    restoreSelection();
    document.execCommand(command, false, arg);
    emitChange();
    saveSelection();
  };

  // execCommand('fontSize') only accepts 1–7, so apply the size, then rewrite
  // the resulting <font size> nodes to the exact pixel size requested.
  const applyFontSize = (px: number) => {
    const el = editorRef.current;
    if (!el) return;
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'false');
    document.execCommand('fontSize', false, '7');
    document.execCommand('styleWithCSS', false, 'true');
    el.querySelectorAll('font[size="7"]').forEach((node) => {
      const font = node as HTMLElement;
      font.removeAttribute('size');
      font.style.fontSize = `${px}px`;
    });
    emitChange();
    saveSelection();
  };

  const docTitle = () => (title && title.trim()) ? title.trim() : 'Sermon Notes';
  const escapeHtml = (s: string) => s.replace(/</g, '&lt;');
  const fileSlug = () =>
    docTitle().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sermon-notes';

  // Shared document HTML used for both printing and Word export.
  const buildDocumentHtml = () => {
    const content = editorRef.current?.innerHTML || '';
    const safeTitle = escapeHtml(docTitle());
    return (
      '<style>' +
      '@page { margin: 1in; }' +
      'body { font-family:' + defaultFontFamily + '; color:#000; line-height:1.6; font-size:' + defaultFontSize + 'pt; }' +
      'h1 { font-size:22pt; margin:0 0 4px; } h2 { font-size:16pt; margin:14px 0 4px; } h3 { font-size:13pt; }' +
      'ul, ol { margin:8px 0 8px 24px; } p { margin:8px 0; }' +
      '.doc-title { border-bottom:1px solid #999; padding-bottom:8px; margin-bottom:16px; }' +
      '</style>' +
      '<h1 class="doc-title">' + safeTitle + '</h1>' +
      content
    );
  };

  // Print (also the reliable path to a high-fidelity PDF via "Save as PDF").
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=850,height=1100');
    if (!win) return;
    win.document.write(
      '<!doctype html><html><head><title>' + escapeHtml(docTitle()) + '</title></head><body>' +
      buildDocumentHtml() +
      '</body></html>'
    );
    win.document.close();
    win.focus();
    win.print();
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Word export: an HTML document Word opens natively, preserving formatting.
  const exportWord = () => {
    const html =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>" +
      escapeHtml(docTitle()) + '</title></head><body>' +
      buildDocumentHtml() +
      '</body></html>';
    triggerDownload(new Blob(['﻿', html], { type: 'application/msword' }), fileSlug() + '.doc');
  };

  type Tool =
    | { kind: 'btn'; icon: React.ComponentType<{ className?: string }>; label: string; command: string; arg?: string }
    | { kind: 'sep' };

  const tools: Tool[] = [
    { kind: 'btn', icon: Bold, label: 'Bold', command: 'bold' },
    { kind: 'btn', icon: Italic, label: 'Italic', command: 'italic' },
    { kind: 'btn', icon: Underline, label: 'Underline', command: 'underline' },
    { kind: 'sep' },
    { kind: 'btn', icon: Heading1, label: 'Heading 1', command: 'formatBlock', arg: 'H1' },
    { kind: 'btn', icon: Heading2, label: 'Heading 2', command: 'formatBlock', arg: 'H2' },
    { kind: 'btn', icon: Pilcrow, label: 'Paragraph', command: 'formatBlock', arg: 'P' },
    { kind: 'sep' },
    { kind: 'btn', icon: List, label: 'Bulleted list', command: 'insertUnorderedList' },
    { kind: 'btn', icon: ListOrdered, label: 'Numbered list', command: 'insertOrderedList' },
    { kind: 'sep' },
    { kind: 'btn', icon: AlignLeft, label: 'Align left', command: 'justifyLeft' },
    { kind: 'btn', icon: AlignCenter, label: 'Align center', command: 'justifyCenter' },
    { kind: 'btn', icon: AlignRight, label: 'Align right', command: 'justifyRight' },
    { kind: 'sep' },
    { kind: 'btn', icon: Undo, label: 'Undo', command: 'undo' },
    { kind: 'btn', icon: Redo, label: 'Redo', command: 'redo' },
    { kind: 'btn', icon: Eraser, label: 'Clear formatting', command: 'removeFormat' },
  ];

  const selectClass =
    'h-8 rounded border border-gray-600 bg-gray-700 px-2 text-sm text-gray-100 focus:outline-none';

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-800 p-2">
        {/* Font family */}
        <select
          title="Font"
          aria-label="Font family"
          className={selectClass}
          onMouseDown={saveSelection}
          onChange={(e) => runCommand('fontName', e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          title="Font size"
          aria-label="Font size"
          className={selectClass}
          onMouseDown={saveSelection}
          onChange={(e) => { applyFontSize(Number(e.target.value)); }}
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Text color */}
        <label
          title="Text color"
          className="flex items-center gap-1 rounded px-1 text-gray-200 hover:bg-gray-700 cursor-pointer"
          onMouseDown={saveSelection}
        >
          <Baseline className="h-4 w-4" />
          <input
            type="color"
            aria-label="Text color"
            defaultValue="#000000"
            className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
            onChange={(e) => runCommand('foreColor', e.target.value)}
          />
        </label>

        {/* Highlight color */}
        <label
          title="Highlight color"
          className="flex items-center gap-1 rounded px-1 text-gray-200 hover:bg-gray-700 cursor-pointer"
          onMouseDown={saveSelection}
        >
          <Highlighter className="h-4 w-4" />
          <input
            type="color"
            aria-label="Highlight color"
            defaultValue="#ffff00"
            className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
            onChange={(e) => runCommand('hiliteColor', e.target.value)}
          />
        </label>

        <span className="mx-1 h-5 w-px bg-gray-600" />

        {tools.map((tool, i) =>
          tool.kind === 'sep' ? (
            <span key={i} className="mx-1 h-5 w-px bg-gray-600" />
          ) : (
            <button
              key={i}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              // Keep the editor selection while clicking a toolbar button.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(tool.command, tool.arg)}
              className="p-2 rounded text-gray-200 hover:bg-gray-700"
            >
              <tool.icon className="h-4 w-4" />
            </button>
          )
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handlePrint}
            className="bg-gray-800 text-gray-100 border-gray-600 hover:bg-gray-700 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                className="bg-green-900 hover:bg-green-800 text-white flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700 text-gray-100">
              <DropdownMenuItem onClick={handlePrint} className="cursor-pointer focus:bg-gray-800">
                <FileType className="h-4 w-4 mr-2" />
                PDF (Save as PDF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportWord} className="cursor-pointer focus:bg-gray-800">
                <FileText className="h-4 w-4 mr-2" />
                Word (.doc)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Document page */}
      <div className="max-h-[75vh] overflow-auto bg-gray-950 p-6 flex justify-center">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          data-placeholder="Start writing your sermon notes..."
          className="sermon-doc bg-white text-black shadow-2xl outline-none"
          style={{
            width: '8.5in',
            maxWidth: '100%',
            minHeight: '11in',
            padding: '1in',
            fontFamily: defaultFontFamily,
            fontSize: `${defaultFontSize}pt`,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}
        />
      </div>
    </div>
  );
};

export default SermonNotesEditor;
