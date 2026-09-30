import React, { useState } from 'react';
import { Globe2, Search, Check, AlertTriangle } from 'lucide-react';
import { LanguageConfig } from '../types.ts';

interface LanguageSelectorProps {
  languages: LanguageConfig[];
  selectedCode: string;
  onSelect: (code: string) => void;
  selectedProvider: 'google' | 'elevenlabs';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  selectedCode,
  onSelect,
  selectedProvider,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = languages.find((l) => l.code === selectedCode) || languages[0];
  const isSelectedAvailable = selectedLanguage.providers[selectedProvider];

  const filteredLanguages = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Globe2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Select Indian Language</span>
        </label>
        <span className="text-[11px] font-medium text-slate-500">
          {languages.length} Languages
        </span>
      </div>

      {/* Main Select Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left flex items-center justify-between shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-xl">{selectedLanguage.flag}</span>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {selectedLanguage.name}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {selectedLanguage.nativeName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSelectedAvailable ? (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                ✓ Available
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                ⚠ Unavailable
              </span>
            )}
            <span className="text-slate-400 text-xs">▼</span>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden max-h-72 flex flex-col">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Hindi, Telugu, Tamil..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
              {filteredLanguages.map((lang) => {
                const isAvailable = lang.providers[selectedProvider];
                const isCurrent = lang.code === selectedCode;

                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelect(lang.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-3 py-2 text-left rounded-lg flex items-center justify-between text-xs transition-colors ${
                      isCurrent
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white mr-1.5">
                          {lang.name}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                          ({lang.nativeName})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAvailable ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Available
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          Unavailable
                        </span>
                      )}
                      {isCurrent && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                    </div>
                  </button>
                );
              })}

              {filteredLanguages.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No languages found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Unavailable Warning if user selected Odia or Assamese */}
      {!isSelectedAvailable && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              This language is currently unavailable with the selected voice provider.
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              Please choose another Indian language (such as Hindi, Telugu, Tamil, Kannada, or Bengali) to generate voice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
