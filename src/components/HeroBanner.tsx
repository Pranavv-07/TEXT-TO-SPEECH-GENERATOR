import React from 'react';
import { ArrowRight, Sparkles, Headphones, Download, Volume2 } from 'lucide-react';
import { LanguageConfig } from '../types.ts';

interface HeroBannerProps {
  languages: LanguageConfig[];
  onSelectLanguage: (code: string) => void;
  onStartCreating: () => void;
  onExploreVoices: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  languages,
  onSelectLanguage,
  onStartCreating,
  onExploreVoices,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Multi-Provider Indian Text-to-Speech Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.1] font-['Cabinet_Grotesk'] text-balance">
              Give Your Words <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500">a Voice.</span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed text-balance">
              Convert text into natural-sounding speech across Indian languages and download it instantly as MP3. Built with multi-provider flexibility, authentic regional pronunciations, and studio controls.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onStartCreating}
                className="px-6 py-3.5 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>Start Creating</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onExploreVoices}
                className="px-5 py-3.5 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Explore Voices</span>
              </button>
            </div>

            {/* Micro stats / Trust indicators */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>13+ Indian Languages</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Instant MP3 & WAV Downloads</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Male & Female Voice Tones</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl bg-slate-900 aspect-video">
              <img
                src="/src/assets/images/indian_voice_studio_hero_1790777581750.jpg"
                alt="Indian Voice Studio Studio Mic and Acoustic Waveform"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-90 hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  // Fallback container if image cannot load
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-5">
                <p className="text-xs uppercase font-mono tracking-wider text-amber-400">Audio Engineering</p>
                <p className="text-white font-semibold text-sm">Natural Prosody for Indic Scripts</p>
                <p className="text-slate-300 text-xs mt-0.5">Accurate native phonemes for Hindi, Telugu, Tamil, Kannada, and more.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language Quick-Selector Bar */}
        <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Supported Regional Indian Languages
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Click to switch language</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {languages.map((lang) => {
              const isAvailable = lang.providers.google || lang.providers.elevenlabs;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                    isAvailable
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:shadow-xs'
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                  title={`${lang.name} (${lang.nativeName}) - ${isAvailable ? 'Available' : 'Currently Unavailable'}`}
                >
                  <span className="text-sm">{lang.flag}</span>
                  <span className="font-semibold">{lang.name}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">({lang.nativeName})</span>
                  {!isAvailable && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">Soon</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
