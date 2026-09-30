import React, { useState } from 'react';
import { X, Search, Play, Square, Loader2, User, Sparkles, Check } from 'lucide-react';
import { VoiceOption, LanguageConfig } from '../types.ts';

interface VoiceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: VoiceOption[];
  languages: LanguageConfig[];
  selectedVoiceId: string;
  onSelectVoiceAndLanguage: (voiceId: string, languageCode: string) => void;
  onPlayPreview: (voice: VoiceOption) => Promise<string>;
}

export const VoiceExplorerModal: React.FC<VoiceExplorerModalProps> = ({
  isOpen,
  onClose,
  voices,
  languages,
  selectedVoiceId,
  onSelectVoiceAndLanguage,
  onPlayPreview,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Female' | 'Male'>('All');
  const [langFilter, setLangFilter] = useState<string>('All');
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const filteredVoices = voices.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.languageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.accent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGender = genderFilter === 'All' || v.gender === genderFilter;
    const matchesLang = langFilter === 'All' || v.languageCode === langFilter;

    return matchesSearch && matchesGender && matchesLang;
  });

  const handlePreview = async (voice: VoiceOption) => {
    if (playingVoiceId === voice.id) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      setPlayingVoiceId(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }

    try {
      setLoadingVoiceId(voice.id);
      const url = await onPlayPreview(voice);
      const audio = new Audio(url);
      setCurrentAudio(audio);

      audio.onplay = () => {
        setLoadingVoiceId(null);
        setPlayingVoiceId(voice.id);
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        setCurrentAudio(null);
      };

      audio.onerror = () => {
        setLoadingVoiceId(null);
        setPlayingVoiceId(null);
        setCurrentAudio(null);
      };

      await audio.play();
    } catch (err) {
      setLoadingVoiceId(null);
      setPlayingVoiceId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Cabinet_Grotesk']">
                Indian Voice Gallery
              </h2>
              <p className="text-xs text-slate-500">
                Explore all voice profiles across Indian languages
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (currentAudio) currentAudio.pause();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by voice name, accent, or style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Languages</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name}
                </option>
              ))}
            </select>

            <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-lg">
              {(['All', 'Female', 'Male'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    genderFilter === g
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Voices Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredVoices.map((voice) => {
            const isSelected = voice.id === selectedVoiceId;
            const isLoading = loadingVoiceId === voice.id;
            const isPlaying = playingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className={`p-4 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {voice.name}
                        </span>
                        <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                          {voice.languageName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span>{voice.gender}</span>
                        <span>·</span>
                        <span>{voice.accent}</span>
                        <span>·</span>
                        <span className="uppercase text-[10px] font-mono">{voice.provider}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed italic">
                    "{voice.description}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePreview(voice)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Loading...</span>
                      </>
                    ) : isPlaying ? (
                      <>
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current text-amber-600" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (currentAudio) currentAudio.pause();
                      onSelectVoiceAndLanguage(voice.id, voice.languageCode);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected ? 'Currently Selected' : 'Use this Voice'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredVoices.length === 0 && (
            <div className="col-span-2 py-12 text-center text-xs text-slate-500">
              No voices found matching your search and filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
