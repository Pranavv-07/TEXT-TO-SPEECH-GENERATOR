import React from 'react';
import { Sliders, Gauge, Music, Cpu, Info, RefreshCw } from 'lucide-react';
import { ProviderInfo } from '../types.ts';

interface VoiceSettingsProps {
  speed: number;
  onChangeSpeed: (val: number) => void;
  pitch: 'low' | 'normal' | 'high';
  onChangePitch: (val: 'low' | 'normal' | 'high') => void;
  provider: 'google' | 'elevenlabs';
  onChangeProvider: (val: 'google' | 'elevenlabs') => void;
  stability: number;
  onChangeStability: (val: number) => void;
  providers: ProviderInfo[];
  onOpenProviderModal: () => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  speed,
  onChangeSpeed,
  pitch,
  onChangePitch,
  provider,
  onChangeProvider,
  stability,
  onChangeStability,
  providers,
  onOpenProviderModal,
}) => {
  const elevenlabsProvider = providers.find((p) => p.id === 'elevenlabs');
  const googleProvider = providers.find((p) => p.id === 'google');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Speech & Audio Settings
          </h2>
        </div>
        <button
          onClick={() => {
            onChangeSpeed(1.0);
            onChangePitch('normal');
            onChangeStability(0.5);
          }}
          className="text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors"
          title="Reset to default settings"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Provider Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>TTS Engine Provider</span>
          </span>
          <button
            onClick={onOpenProviderModal}
            className="text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
          >
            Configure
          </button>
        </label>

        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onChangeProvider('google')}
            className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-all ${
              provider === 'google'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>Google TTS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
              Free & instant Indian accents
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangeProvider('elevenlabs')}
            className={`py-2 px-3 rounded-lg text-xs font-medium text-left transition-all ${
              provider === 'elevenlabs'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>ElevenLabs</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  elevenlabsProvider?.isReady ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              ></span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
              {elevenlabsProvider?.isReady ? 'AI Multilingual v2' : 'Key required'}
            </div>
          </button>
        </div>

        {provider === 'elevenlabs' && !elevenlabsProvider?.isReady && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">ElevenLabs API key not detected</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-normal">
                To use ElevenLabs voices, add <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">ELEVENLABS_API_KEY</code> in <code className="font-mono">.env</code>. You can switch to Google TTS for instant free generation across all Indian languages.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Speed Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Speaking Speed</span>
          </label>
          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
            {speed.toFixed(2)}x
          </span>
        </div>

        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.05"
          value={speed}
          onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
        />

        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0.5x Slow</span>
          <button
            onClick={() => onChangeSpeed(1.0)}
            className="hover:text-amber-600 font-semibold cursor-pointer"
          >
            1.0x Normal
          </button>
          <span>2.0x Fast</span>
        </div>
      </div>

      {/* Pitch Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Vocal Pitch & Timbre</span>
        </label>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {(['low', 'normal', 'high'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChangePitch(p)}
              className={`py-1.5 text-xs capitalize font-medium rounded-lg transition-all ${
                pitch === p
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ElevenLabs Specific Settings */}
      {provider === 'elevenlabs' && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Voice Stability
            </label>
            <span className="font-mono text-xs font-medium text-slate-500">
              {Math.round(stability * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={stability}
            onChange={(e) => onChangeStability(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>More Expressive</span>
            <span>More Consistent</span>
          </div>
        </div>
      )}
    </div>
  );
};
