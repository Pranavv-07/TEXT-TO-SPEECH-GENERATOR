import React, { useState } from 'react';
import { History, Play, Pause, Download, Trash2, Clock, Volume2, Sparkles } from 'lucide-react';
import { HistoryItem } from '../types.ts';

interface GenerationHistoryProps {
  history: HistoryItem[];
  onPlayItem: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  currentPlayingUrl: string | null;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  history,
  onPlayItem,
  onDeleteItem,
  onClearHistory,
  currentPlayingUrl,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleDownload = (item: HistoryItem) => {
    const link = document.createElement('a');
    link.href = item.downloadUrl;
    link.setAttribute('download', item.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="history-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Cabinet_Grotesk']">
            Recent Voice Generations ({history.length})
          </h2>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Volume2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No voice generations yet
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enter your text above, choose an Indian language and voice, and click Generate Voice. Your audio will be saved here for instant playback.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {history.map((item) => {
            const isPlaying = currentPlayingUrl === item.audioUrl;

            return (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.languageName}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal">
                      ({item.scriptName})
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      {item.voiceName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-[10px] uppercase font-mono text-slate-400">
                      {item.provider}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    "{item.text}"
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.createdAt}
                    </span>
                    <span>·</span>
                    <span className="font-mono">~{item.durationSeconds}s audio</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPlayItem(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-750'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>Playing</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current text-amber-600 dark:text-amber-400" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Download MP3"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete generation from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
