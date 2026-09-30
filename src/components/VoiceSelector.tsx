import React, { useState, useRef } from 'react';
import { Volume2, Play, Square, Loader2, Check, User, Sparkles } from 'lucide-react';
import { VoiceOption } from '../types.ts';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onPlayPreview: (voice: VoiceOption) => Promise<string>; // returns audio url
  selectedLanguageCode: string;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
  onPlayPreview,
  selectedLanguageCode,
}) => {
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter voices for current language or multilingual ElevenLabs
  const matchingVoices = voices.filter(
    (v) =>
      v.languageCode === selectedLanguageCode ||
      (v.provider === 'elevenlabs' && (v.languageCode === selectedLanguageCode || v.languageCode === 'hi'))
  );

  const displayVoices = matchingVoices.length > 0 ? matchingVoices : voices.slice(0, 4);

  const handlePreviewClick = async (e: React.MouseEvent, voice: VoiceOption) => {
    e.stopPropagation();

    // If already playing this voice, stop it
    if (playingVoiceId === voice.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    // Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setLoadingVoiceId(voice.id);
      const audioUrl = await onPlayPreview(voice);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setLoadingVoiceId(null);
        setPlayingVoiceId(voice.id);
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setLoadingVoiceId(null);
        setPlayingVoiceId(null);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('Preview error:', err);
      setLoadingVoiceId(null);
      setPlayingVoiceId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Available Indian Voices ({displayVoices.length})</span>
        </label>
        <span className="text-[11px] text-slate-500">
          Click card to select · Preview to listen
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayVoices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          const isLoadingPreview = loadingVoiceId === voice.id;
          const isPlayingPreview = playingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelectVoice(voice.id)}
              className={`relative rounded-xl p-4 transition-all border text-left cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Header row: Name + Provider Tag */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {voice.name}
                      </span>
                      {voice.isPopular && (
                        <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                          Popular
                        </span>
                      )}
                    </div>
                    {/* Metadata line with typographic separators per anti-pill guidelines */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{voice.gender}</span>
                      <span aria-hidden="true">·</span>
                      <span>{voice.accent}</span>
                      <span aria-hidden="true">·</span>
                      <span className="uppercase text-[10px] font-mono">{voice.provider}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700"></span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed italic">
                  "{voice.description}"
                </p>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => handlePreviewClick(e, voice)}
                  disabled={isLoadingPreview}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isPlayingPreview
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Listen to short sample preview sentence"
                >
                  {isLoadingPreview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Loading...</span>
                    </>
                  ) : isPlayingPreview ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop Preview</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current text-amber-600 dark:text-amber-400" />
                      <span>Preview</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSelectVoice(voice.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'text-amber-700 dark:text-amber-400 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Select Voice'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
