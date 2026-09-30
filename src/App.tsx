/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, Play, Volume2, ArrowRight } from 'lucide-react';
import {
  VoiceOption,
  LanguageConfig,
  ProviderInfo,
  SpeechResult,
  HistoryItem,
  ThemeMode,
} from './types.ts';
import { SUPPORTED_LANGUAGES, GOOGLE_VOICES } from './server/voiceConfig.ts';
import { Header } from './components/Header.tsx';
import { HeroBanner } from './components/HeroBanner.tsx';
import { TextEditor } from './components/TextEditor.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { VoiceSelector } from './components/VoiceSelector.tsx';
import { VoiceSettings } from './components/VoiceSettings.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { GenerationHistory } from './components/GenerationHistory.tsx';
import { ProviderModal } from './components/ProviderModal.tsx';
import { VoiceExplorerModal } from './components/VoiceExplorerModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import { Footer } from './components/Footer.tsx';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('ivs_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ivs_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Language & Voices
  const [languages, setLanguages] = useState<LanguageConfig[]>(SUPPORTED_LANGUAGES);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>('hi');
  const [voices, setVoices] = useState<VoiceOption[]>(GOOGLE_VOICES);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('google-hi-ananya');

  // Input & Generation settings
  const [text, setText] = useState<string>(
    'नमस्ते! यह इंडियन वॉइस स्टूडियो है। आप अपनी लिखी हुई सामग्री को प्राकृतिक आवाज़ में बदल सकते हैं।'
  );
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<'low' | 'normal' | 'high'>('normal');
  const [provider, setProvider] = useState<'google' | 'elevenlabs'>('google');
  const [stability, setStability] = useState<number>(0.5);

  // Status & providers
  const [providers, setProviders] = useState<ProviderInfo[]>([
    {
      id: 'google',
      name: 'Google TTS',
      status: 'available',
      isReady: true,
      badge: 'Available',
      description: 'Instant neural speech engine with Indian regional accents. Free & ready.',
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      status: 'not_configured',
      isReady: false,
      badge: 'Configurable',
      description: 'Requires ELEVENLABS_API_KEY in .env for ultra-realistic AI voice synthesis.',
    },
  ]);

  // Loading & generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Generating your voice...');
  const [currentResult, setCurrentResult] = useState<SpeechResult | null>(null);

  // History state
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('ivs_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // History inline playback audio
  const [currentPlayingHistoryUrl, setCurrentPlayingHistoryUrl] = useState<string | null>(null);
  const historyAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modals & toasts
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [isVoiceGalleryOpen, setIsVoiceGalleryOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch providers and voices from backend on mount
  const fetchProvidersAndVoices = async () => {
    try {
      const [provRes, voiceRes] = await Promise.all([
        fetch('/api/providers'),
        fetch('/api/voices'),
      ]);

      if (provRes.ok) {
        const provData = await provRes.json();
        if (provData.providers) {
          setProviders(provData.providers);
        }
      }

      if (voiceRes.ok) {
        const voiceData = await voiceRes.json();
        if (voiceData.voices && voiceData.voices.length > 0) {
          setVoices(voiceData.voices);
        }
      }
    } catch (err) {
      console.warn('Backend load warning, using embedded voice definitions:', err);
    }
  };

  useEffect(() => {
    fetchProvidersAndVoices();
  }, []);

  // Update selected voice when language changes
  const handleSelectLanguage = (langCode: string) => {
    setSelectedLanguageCode(langCode);
    const langConfig = languages.find((l) => l.code === langCode);

    // Pick first voice matching language
    const firstMatchingVoice = voices.find(
      (v) =>
        v.languageCode === langCode &&
        (provider === 'elevenlabs' ? v.provider === 'elevenlabs' : v.provider === 'google')
    ) || voices.find((v) => v.languageCode === langCode);

    if (firstMatchingVoice) {
      setSelectedVoiceId(firstMatchingVoice.id);
    }

    if (langConfig) {
      addToast('info', `Switched language to ${langConfig.name} (${langConfig.nativeName})`);
    }
  };

  // Quick sample insertion
  const handleUseSampleText = () => {
    const langConfig = languages.find((l) => l.code === selectedLanguageCode);
    if (langConfig?.sampleText) {
      setText(langConfig.sampleText);
      addToast('success', `Loaded sample text for ${langConfig.name}!`);
    }
  };

  const handleClearText = () => {
    setText('');
    addToast('info', 'Text cleared.');
  };

  const handleCopyText = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      addToast('success', 'Text copied to clipboard!');
    } catch {
      addToast('info', 'Text selected for copy.');
    }
  };

  const handlePasteText = (pasted: string) => {
    setText((prev) => (prev ? `${prev}\n${pasted}` : pasted));
    addToast('success', 'Text pasted from clipboard!');
  };

  const handleImportFile = (content: string, filename: string) => {
    setText(content);
    addToast('success', `Imported "${filename}" successfully!`);
  };

  // Inline voice preview handler
  const handlePlayPreview = async (voice: VoiceOption): Promise<string> => {
    const res = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice_id: voice.id,
        language: voice.languageCode,
        sample_text: voice.samplePreview,
        provider: voice.provider,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to generate voice preview');
    }

    return data.audioUrl;
  };

  // Main Voice Generation handler
  const handleGenerateVoice = async () => {
    if (!text || !text.trim()) {
      addToast('error', 'Please enter some text before generating audio.');
      return;
    }

    if (text.length > 5000) {
      addToast('error', 'Your text is too long. Please shorten it to under 5,000 characters.');
      return;
    }

    const currentLang = languages.find((l) => l.code === selectedLanguageCode);
    if (currentLang && !currentLang.providers[provider]) {
      addToast(
        'warning',
        `This language (${currentLang.name}) is currently unavailable with ${provider === 'elevenlabs' ? 'ElevenLabs' : 'Google TTS'}.`
      );
      return;
    }

    setIsGenerating(true);
    setGenerationStage(
      text.length > 250
        ? 'Processing long text into natural prosody...'
        : 'Synthesizing voice audio...'
    );

    try {
      const endpoint = text.length > 250 ? '/api/generate-long' : '/api/generate';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          language: selectedLanguageCode,
          voice_id: selectedVoiceId,
          provider,
          speed,
          pitch,
          stability,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Voice generation failed. Please try again.');
      }

      const result: SpeechResult = data;
      setCurrentResult(result);

      // Save to local history
      const currentVoice = voices.find((v) => v.id === selectedVoiceId);
      const newHistoryItem: HistoryItem = {
        id: result.fileId,
        text: text.trim().slice(0, 180),
        languageCode: selectedLanguageCode,
        languageName: currentLang?.name || 'Indian Language',
        scriptName: currentLang?.nativeName || '',
        voiceId: selectedVoiceId,
        voiceName: result.voiceName || currentVoice?.name || 'Indian Voice',
        provider: result.provider,
        audioUrl: result.audioUrl,
        downloadUrl: result.downloadUrl,
        filename: result.filename,
        durationSeconds: result.durationEstimateSeconds,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 29)];
      setHistory(updatedHistory);
      localStorage.setItem('ivs_history', JSON.stringify(updatedHistory));

      addToast('success', 'Voice generated successfully! Playing preview.');

      // Smooth scroll to audio player
      setTimeout(() => {
        const playerEl = document.getElementById('audio-player-anchor');
        playerEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } catch (err: any) {
      console.error('Generation failure:', err);
      addToast('error', err.message || 'Unable to connect to the voice service. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // History controls
  const handlePlayHistoryItem = (item: HistoryItem) => {
    if (historyAudioRef.current) {
      historyAudioRef.current.pause();
    }

    if (currentPlayingHistoryUrl === item.audioUrl) {
      setCurrentPlayingHistoryUrl(null);
      return;
    }

    const audio = new Audio(item.audioUrl);
    historyAudioRef.current = audio;
    setCurrentPlayingHistoryUrl(item.audioUrl);

    audio.onended = () => setCurrentPlayingHistoryUrl(null);
    audio.onerror = () => setCurrentPlayingHistoryUrl(null);
    audio.play().catch(() => setCurrentPlayingHistoryUrl(null));
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('ivs_history', JSON.stringify(updated));
    addToast('info', 'Item removed from history.');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your generation history?')) {
      setHistory([]);
      localStorage.removeItem('ivs_history');
      addToast('info', 'History cleared.');
    }
  };

  const currentLanguageConfig =
    languages.find((l) => l.code === selectedLanguageCode) || languages[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        providers={providers}
        onOpenProviderModal={() => setIsProviderModalOpen(true)}
        onOpenVoiceGallery={() => setIsVoiceGalleryOpen(true)}
        onScrollToStudio={() => {
          document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onScrollToHistory={() => {
          document.getElementById('history-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero Banner */}
      <HeroBanner
        languages={languages}
        onSelectLanguage={handleSelectLanguage}
        onStartCreating={() => {
          document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreVoices={() => setIsVoiceGalleryOpen(true)}
      />

      {/* Main Studio Workspace Container */}
      <main id="studio-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Step Indicator Flow Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-6 sm:gap-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Text</span>
            </span>
            <span>→</span>
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Language</span>
            </span>
            <span>→</span>
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Voice</span>
            </span>
            <span>→</span>
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                4
              </span>
              <span>Generate</span>
            </span>
            <span>→</span>
            <span className="text-slate-500 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold">
                5
              </span>
              <span>Download MP3</span>
            </span>
          </div>
        </div>

        {/* 2-Column Studio Grid: Left = Text Editor & Audio Player; Right = Voice & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Text Input & Output Player */}
          <div className="lg:col-span-7 space-y-6">
            <TextEditor
              text={text}
              onChange={setText}
              selectedLanguage={currentLanguageConfig}
              onUseSampleText={handleUseSampleText}
              onClearText={handleClearText}
              onCopyText={handleCopyText}
              onPasteText={handlePasteText}
              onImportFile={handleImportFile}
              maxChars={5000}
            />

            {/* Prominent Generate Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGenerateVoice}
                disabled={isGenerating || !text.trim()}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide text-white shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer ${
                  isGenerating || !text.trim()
                    ? 'bg-slate-400 dark:bg-slate-800 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:from-amber-500 hover:to-orange-500 shadow-orange-500/25 active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{generationStage}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 fill-current" />
                    <span>Generate Voice ({currentLanguageConfig.name})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>

            {/* Generated Audio Player Area */}
            {currentResult && (
              <div id="audio-player-anchor" className="pt-2 animate-in fade-in duration-300">
                <AudioPlayer
                  result={currentResult}
                  onGenerateAnother={() => {
                    document.querySelector('textarea')?.focus();
                  }}
                  onToast={addToast}
                />
              </div>
            )}
          </div>

          {/* Right Column: Language, Voice Selector & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <LanguageSelector
              languages={languages}
              selectedCode={selectedLanguageCode}
              onSelect={handleSelectLanguage}
              selectedProvider={provider}
            />

            <VoiceSelector
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={setSelectedVoiceId}
              onPlayPreview={handlePlayPreview}
              selectedLanguageCode={selectedLanguageCode}
            />

            <VoiceSettings
              speed={speed}
              onChangeSpeed={setSpeed}
              pitch={pitch}
              onChangePitch={setPitch}
              provider={provider}
              onChangeProvider={setProvider}
              stability={stability}
              onChangeStability={setStability}
              providers={providers}
              onOpenProviderModal={() => setIsProviderModalOpen(true)}
            />
          </div>
        </div>

        {/* History Section */}
        <div className="pt-8">
          <GenerationHistory
            history={history}
            onPlayItem={handlePlayHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
            currentPlayingUrl={currentPlayingHistoryUrl}
          />
        </div>
      </main>

      {/* Modals */}
      <ProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
        providers={providers}
        onRefreshProviders={fetchProvidersAndVoices}
      />

      <VoiceExplorerModal
        isOpen={isVoiceGalleryOpen}
        onClose={() => setIsVoiceGalleryOpen(false)}
        voices={voices}
        languages={languages}
        selectedVoiceId={selectedVoiceId}
        onSelectVoiceAndLanguage={(voiceId, langCode) => {
          setSelectedLanguageCode(langCode);
          setSelectedVoiceId(voiceId);
          addToast('success', 'Voice selected from gallery!');
        }}
        onPlayPreview={handlePlayPreview}
      />

      {/* Footer */}
      <Footer
        languages={languages}
        providers={providers}
        onSelectLanguage={handleSelectLanguage}
        onOpenProviderModal={() => setIsProviderModalOpen(true)}
      />
    </div>
  );
}
