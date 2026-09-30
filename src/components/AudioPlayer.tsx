import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  FileAudio,
  Check,
  Loader2,
} from 'lucide-react';
import { SpeechResult } from '../types.ts';

interface AudioPlayerProps {
  result: SpeechResult;
  onGenerateAnother: () => void;
  onToast: (type: 'success' | 'error' | 'info', msg: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  result,
  onGenerateAnother,
  onToast,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isConvertingWav, setIsConvertingWav] = useState(false);
  const [wavUrl, setWavUrl] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when new result arrives
    setIsPlaying(false);
    setCurrentTime(0);
    setWavUrl(null);

    const audio = audioRef.current;
    if (audio) {
      audio.load();
      // Auto-play the newly generated speech!
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browser autoplay restriction, wait for user click
          setIsPlaying(false);
        });
    }
  }, [result.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || result.durationEstimateSeconds);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDownloadMp3 = () => {
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.setAttribute('download', result.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast('success', `MP3 downloaded: ${result.filename}`);
  };

  const handleDownloadWav = async () => {
    if (wavUrl) {
      const link = document.createElement('a');
      link.href = wavUrl;
      link.setAttribute('download', result.filename.replace('.mp3', '.wav'));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('success', 'WAV audio downloaded successfully!');
      return;
    }

    try {
      setIsConvertingWav(true);
      const res = await fetch(`/api/convert-wav/${result.filename}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to convert to WAV format.');
      }

      setWavUrl(data.downloadUrl);
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.setAttribute('download', data.wavFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('success', 'Converted to WAV and downloaded!');
    } catch (err: any) {
      onToast('error', err.message || 'WAV conversion failed.');
    } finally {
      setIsConvertingWav(false);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      <audio
        ref={audioRef}
        src={result.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-base font-bold text-white font-['Cabinet_Grotesk']">
              Generated Audio Player
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Voice: <strong className="text-slate-200">{result.voiceName}</strong></span>
            <span>·</span>
            <span className="uppercase">{result.language}</span>
            <span>·</span>
            <span className="capitalize">{result.provider}</span>
            {result.isLongText && (
              <>
                <span>·</span>
                <span className="text-amber-400 font-semibold">{result.chunksProcessed} Sections Merged</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGenerateAnother}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Generate Another</span>
          </button>
        </div>
      </div>

      {/* Animated Sound Waveform Visualizer */}
      <div className="h-14 flex items-center justify-center gap-1 px-4 bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => {
          // Dynamic heights based on index and playback state
          const baseHeight = 12 + Math.sin(i * 0.4) * 8 + Math.cos(i * 0.7) * 6;
          const activeHeight = isPlaying ? Math.max(8, (baseHeight * (1 + Math.sin(Date.now() / 200 + i) * 0.6))) : baseHeight;
          const isPassed = (i / 48) * 100 <= progressPercent;

          return (
            <span
              key={i}
              style={{ height: `${activeHeight}px` }}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPassed
                  ? 'bg-amber-400 shadow-xs shadow-amber-400/50'
                  : 'bg-slate-700/60'
              }`}
            />
          );
        })}
      </div>

      {/* Progress Bar & Seek */}
      <div className="space-y-1.5">
        <input
          type="range"
          min="0"
          max={duration || result.durationEstimateSeconds || 100}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
        />

        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || result.durationEstimateSeconds)}</span>
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Play / Pause & Volume */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              aria-label="Volume slider"
            />
          </div>
        </div>

        {/* Speed Multiplier chips */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`px-2 py-1 text-xs font-mono rounded-md transition-colors ${
                playbackRate === rate
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadMp3}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Download MP3</span>
          </button>

          <button
            onClick={handleDownloadWav}
            disabled={isConvertingWav}
            className="px-3 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Convert and download uncompressed WAV format"
          >
            {isConvertingWav ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>WAV...</span>
              </>
            ) : (
              <>
                <FileAudio className="w-3.5 h-3.5 text-slate-400" />
                <span>WAV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
