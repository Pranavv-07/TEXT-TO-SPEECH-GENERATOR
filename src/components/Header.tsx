import React from 'react';
import { Volume2, Sun, Moon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProviderInfo, ThemeMode } from '../types.ts';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  providers: ProviderInfo[];
  onOpenProviderModal: () => void;
  onOpenVoiceGallery: () => void;
  onScrollToStudio: () => void;
  onScrollToHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  providers,
  onOpenProviderModal,
  onOpenVoiceGallery,
  onScrollToStudio,
  onScrollToHistory,
}) => {
  const elevenlabsProvider = providers.find((p) => p.id === 'elevenlabs');
  const googleProvider = providers.find((p) => p.id === 'google');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onScrollToStudio}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-['Cabinet_Grotesk']">
              Indian Voice Studio
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={onScrollToStudio}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Studio
          </button>
          <button
            onClick={onOpenVoiceGallery}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span>Voice Gallery</span>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">
              13+ Langs
            </span>
          </button>
          <button
            onClick={onScrollToHistory}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Recent History
          </button>
          <button
            onClick={onOpenProviderModal}
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            TTS Providers
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProviderModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-amber-300 dark:hover:border-amber-700 transition-colors whitespace-nowrap"
            title="Configure TTS Providers"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Google TTS</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              {elevenlabsProvider?.isReady ? 'ElevenLabs ✓' : 'ElevenLabs +'}
            </span>
          </button>

          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Toggle color theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
