import React from 'react';
import { Volume2, Heart, Shield, FileText } from 'lucide-react';
import { LanguageConfig, ProviderInfo } from '../types.ts';

interface FooterProps {
  languages: LanguageConfig[];
  providers: ProviderInfo[];
  onSelectLanguage: (code: string) => void;
  onOpenProviderModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  languages,
  providers,
  onSelectLanguage,
  onOpenProviderModal,
}) => {
  const elevenReady = providers.find((p) => p.id === 'elevenlabs')?.isReady;

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white font-['Cabinet_Grotesk']">
                Indian Voice Studio
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              High-fidelity Text-to-Speech platform dedicated to authentic Indian languages, dialects, and regional accents. Convert scripts into natural-sounding speech with instant MP3 downloads.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
              <span>Speech Engines:</span>
              <button
                onClick={onOpenProviderModal}
                className="font-medium text-amber-700 dark:text-amber-400 hover:underline"
              >
                Google TTS {elevenReady ? '+ ElevenLabs (Connected)' : '+ ElevenLabs (Configurable)'}
              </button>
            </div>
          </div>

          {/* Languages quick directory */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Languages
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              {languages.slice(0, 10).map((l) => (
                <button
                  key={l.code}
                  onClick={() => onSelectLanguage(l.code)}
                  className="text-left hover:text-amber-600 dark:hover:text-amber-400 transition-colors py-0.5 truncate"
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Standards & Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Studio Architecture
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Zero Server Tracking & Private</span>
              </li>
              <li className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Standard MP3 & WAV Audio</span>
              </li>
              <li>
                <button
                  onClick={onOpenProviderModal}
                  className="hover:text-amber-600 transition-colors"
                >
                  Configure API Keys (.env)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Indian Voice Studio. Turn your text into natural Indian voices.</p>
          <p className="flex items-center gap-1">
            Engineered for Indic Languages with care
          </p>
        </div>
      </div>
    </footer>
  );
};
