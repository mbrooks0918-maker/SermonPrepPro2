import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold, Italic, Underline, Heading1, Heading2, Pilcrow,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Eraser, Printer
} from 'lucide-react';

interface SermonNotesEditorProps {
  value: string;
  onChange: (html: string) => void;
  title?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Treat stored content as HTML only when it actually contains tags; otherwise
// render it as plain text so legacy plain-text notes stay intact and safe.
const looksLikeHtml = (value: string) => /<[a-z][\s\S]*>/i.test(value || '');

const SermonNotesEditor: React.FC<SermonNotesEditorProps> = ({
  value, onChange, title, onFocus, onBlur
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync incoming value into the editor without stealing the caret while the
  // pastor is typing (also lets live/Realtime updates flow in when unfocused).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const incoming = value || '';
    const current = el.innerHTML;
    if (incoming === current) return;
    if (looksLikeHtml(incoming) || incoming === '') {
      el.innerHTML = incoming;
    } else {
      el.textContent = incoming;
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const handlePrint = () => {
    const content = editorRef.current?.innerHTML || '';
    const safeTitle = (title || 'Sermon Notes').replace(/</g, '&lt;');
    const win = window.open('', '_blank', 'width=850,height=1100');
    if (!win) return;
    win.document.write(
      '<!doctype html><html><head><title>' + safeTitle + '</title>' +
      '<style>' +
      '@page { margin: 1in; }' +
      "body { font-family: Georgia, 'Times New Roman', serif; color:#000; line-height:1.6; font-size:12pt; }" +
      'h1 { font-size:22pt; margin:0 0 4px; } h2 { font-size:16pt; margin:14px 0 4px; } h3 { font-size:13pt; }' +
      'ul, ol { margin:8px 0 8px 24px; } p { margin:8px 0; }' +
      '.doc-title { border-bottom:1px solid #999; padding-bottom:8px; margin-bottom:16px; }' +
      '</style></head><body>' +
      '<h1 class="doc-title">' + safeTitle + '</h1>' +
      content +
      '</body></html>'
    );
    win.document.close();
    win.focus();
    win.print();
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

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-800 p-2">
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
              onClick={() => exec(tool.command, tool.arg)}
              className="p-2 rounded text-gray-200 hover:bg-gray-700"
            >
              <tool.icon className="h-4 w-4" />
            </button>
          )
        )}
        <div className="ml-auto">
          <Button
            type="button"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handlePrint}
            className="bg-green-900 hover:bg-green-800 text-white flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
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
          data-placeholder="Start writing your sermon notes..."
          className="sermon-doc bg-white text-black shadow-2xl outline-none"
          style={{
            width: '8.5in',
            maxWidth: '100%',
            minHeight: '11in',
            padding: '1in',
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '12pt',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}
        />
      </div>
    </div>
  );
};

export default SermonNotesEditor;
