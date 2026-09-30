import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Cpu, Key, ExternalLink, RefreshCw } from 'lucide-react';
import { ProviderInfo } from '../types.ts';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: ProviderInfo[];
  onRefreshProviders: () => Promise<void>;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({
  isOpen,
  onClose,
  providers,
  onRefreshProviders,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshProviders();
    setIsRefreshing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Cabinet_Grotesk']">
                TTS Providers & Status
              </h2>
              <p className="text-xs text-slate-500">
                Audio synthesis engine architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          {providers.map((p) => {
            const isEleven = p.id === 'elevenlabs';

            return (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {p.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.isReady
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  {p.isReady ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {p.description}
                </p>

                {isEleven && !p.isReady && (
                  <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300">
                      <Key className="w-3.5 h-3.5" />
                      <span>How to configure ElevenLabs:</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <li>Open the <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded">.env</code> file in the app root.</li>
                      <li>Add your key: <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-amber-700 dark:text-amber-400">ELEVENLABS_API_KEY=your_key_here</code></li>
                      <li>Save and refresh providers below.</li>
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            <span>Check Connections</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
