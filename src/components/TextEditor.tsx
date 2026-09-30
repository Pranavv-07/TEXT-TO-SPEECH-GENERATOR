import React, { useRef } from 'react';
import { FileText, Copy, Trash2, Clipboard, BookOpen, AlertCircle, Check } from 'lucide-react';
import { LanguageConfig } from '../types.ts';

interface TextEditorProps {
  text: string;
  onChange: (value: string) => void;
  selectedLanguage: LanguageConfig;
  onUseSampleText: () => void;
  onClearText: () => void;
  onCopyText: () => void;
  onPasteText: (text: string) => void;
  onImportFile: (content: string, filename: string) => void;
  maxChars?: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChange,
  selectedLanguage,
  onUseSampleText,
  onClearText,
  onCopyText,
  onPasteText,
  onImportFile,
  maxChars = 5000,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute stats
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isOverLimit = charCount > maxChars;
  const isLong = charCount > 500;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please upload a valid .txt text file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onImportFile(content, file.name);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handlePasteClick = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const clipText = await navigator.clipboard.readText();
        if (clipText) {
          onPasteText(clipText);
        }
      } else {
        alert('Clipboard access is restricted by your browser. Please paste directly using Ctrl+V / Cmd+V.');
      }
    } catch (err) {
      alert('Could not read from clipboard. Please paste manually into the editor.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Editor Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Text Content</span>
          </span>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Quick sample insertion */}
          <button
            onClick={onUseSampleText}
            className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-amber-100/50 dark:hover:bg-amber-950/40 transition-colors"
            title="Load authentic sample sentence for this language"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Insert {selectedLanguage.name} Sample</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Import text from a .txt file"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Import .txt</span>
          </button>

          <button
            onClick={handlePasteClick}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5 text-slate-500" />
            <span>Paste</span>
          </button>

          <button
            onClick={onCopyText}
            disabled={!text}
            className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors flex items-center gap-1"
            title="Copy text to clipboard"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy</span>
          </button>

          <button
            onClick={onClearText}
            disabled={!text}
            className="px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-40 transition-colors flex items-center gap-1"
            title="Clear all text"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Text Area */}
      <div className="relative p-4 flex-1 flex flex-col">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter or paste your text here in ${selectedLanguage.name} (${selectedLanguage.nativeName}) or English...`}
          rows={7}
          className="w-full h-full min-h-[180px] sm:min-h-[220px] resize-y bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-base leading-relaxed focus:outline-none font-sans"
        />

        {/* Long text info notice */}
        {isLong && !isOverLimit && (
          <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Long text detected ({charCount} chars). The engine will automatically generate and seamlessly stitch audio sections.
            </span>
          </div>
        )}

        {isOverLimit && (
          <div className="mt-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Character limit exceeded ({charCount} / {maxChars}). Please trim your text to proceed.
            </span>
          </div>
        )}
      </div>

      {/* Counter Footer */}
      <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums">{wordCount} words</span>
          <span>·</span>
          <span className={`font-mono tabular-nums ${isOverLimit ? 'text-rose-600 font-bold' : ''}`}>
            {charCount.toLocaleString()} / {maxChars.toLocaleString()} chars
          </span>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500">
          Target Script: <span className="font-semibold text-slate-600 dark:text-slate-300">{selectedLanguage.nativeName}</span>
        </div>
      </div>
    </div>
  );
};
