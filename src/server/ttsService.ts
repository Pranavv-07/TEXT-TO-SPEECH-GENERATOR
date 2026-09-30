import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import https from 'https';
import { SUPPORTED_LANGUAGES, GOOGLE_VOICES, ELEVENLABS_DEFAULT_VOICES, VoiceOption } from './voiceConfig.ts';

const execFileAsync = promisify(execFile);

const AUDIO_DIR = path.resolve(process.cwd(), 'audio_storage');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Clean up temporary audio files older than 2 hours periodically
export function cleanOldAudioFiles() {
  try {
    const files = fs.readdirSync(AUDIO_DIR);
    const now = Date.now();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    for (const file of files) {
      const filePath = path.join(AUDIO_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > twoHoursMs) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('Error cleaning audio files:', err);
  }
}

// Run cleanup every 30 minutes
setInterval(cleanOldAudioFiles, 30 * 60 * 1000);

// Helper: Split text into natural chunks for Google TTS (limit 180 chars per chunk)
export function splitTextIntoChunks(text: string, maxLen = 170): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  // Split along sentence endings (Indian danda ।, full stops ., question marks, exclamation, newlines)
  const sentences = trimmed.split(/([।\.\?\!\n]+)/);
  let currentChunk = '';

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if (!part) continue;

    if ((currentChunk + part).length <= maxLen) {
      currentChunk += part;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // If a single sentence exceeds maxLen, split by commas or spaces
      if (part.length > maxLen) {
        const words = part.split(/([,\s]+)/);
        let subChunk = '';
        for (const word of words) {
          if ((subChunk + word).length <= maxLen) {
            subChunk += word;
          } else {
            if (subChunk.trim()) chunks.push(subChunk.trim());
            subChunk = word;
          }
        }
        currentChunk = subChunk;
      } else {
        currentChunk = part;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Helper: Fetch a single audio buffer from Google TTS
function fetchGoogleTTSChunk(text: string, langCode: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Map lang code if needed (e.g. en-IN -> en)
    const effectiveLang = langCode === 'en-IN' ? 'en' : langCode;
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${effectiveLang}&client=tw-ob`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Google TTS returned HTTP status ${res.statusCode}`));
          return;
        }

        const dataChunks: Buffer[] = [];
        res.on('data', (chunk) => dataChunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(dataChunks)));
      }
    );

    req.on('error', (err) => reject(err));
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('Google TTS request timed out.'));
    });
  });
}

export interface SpeechRequestOptions {
  text: string;
  language: string;
  voiceId?: string;
  provider?: 'google' | 'elevenlabs';
  speed?: number; // 0.5 to 2.0 (default 1.0)
  pitch?: 'low' | 'normal' | 'high' | number;
  stability?: number;
}

export interface SpeechResult {
  success: boolean;
  fileId: string;
  filename: string;
  audioUrl: string;
  downloadUrl: string;
  format: 'mp3';
  sizeBytes: number;
  durationEstimateSeconds: number;
  language: string;
  provider: 'google' | 'elevenlabs';
  voiceId: string;
  voiceName: string;
}

export class TTSService {
  // Check provider status
  static getProviderStatus() {
    const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
    const hasElevenLabs = Boolean(elevenKey && elevenKey.length > 5 && elevenKey !== 'your_elevenlabs_api_key_here');

    return {
      providers: [
        {
          id: 'google',
          name: 'Google TTS',
          status: 'available',
          isReady: true,
          badge: 'Available & Free',
          description: 'High-clarity neural speech with comprehensive Indian regional language support. No API key needed.',
        },
        {
          id: 'elevenlabs',
          name: 'ElevenLabs',
          status: hasElevenLabs ? 'available' : 'not_configured',
          isReady: hasElevenLabs,
          badge: hasElevenLabs ? 'Connected' : 'Not configured',
          description: hasElevenLabs
            ? 'Connected via ELEVENLABS_API_KEY. Using Eleven Multilingual v2 models.'
            : 'Requires ELEVENLABS_API_KEY in .env for ultra-realistic AI voice synthesis.',
        },
      ],
      defaultProvider: 'google',
      supportedLanguagesCount: SUPPORTED_LANGUAGES.filter((l) => l.providers.google).length,
    };
  }

  // Retrieve voices, dynamically fetching from ElevenLabs if key is present
  static async getVoices(): Promise<VoiceOption[]> {
    const allVoices: VoiceOption[] = [...GOOGLE_VOICES];
    const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();

    if (elevenKey && elevenKey.length > 5 && elevenKey !== 'your_elevenlabs_api_key_here') {
      try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
          headers: { 'xi-api-key': elevenKey },
        });

        if (response.ok) {
          const data = (await response.json()) as { voices: any[] };
          if (Array.isArray(data.voices)) {
            // Map custom user voices or default voices
            const fetchedVoices: VoiceOption[] = data.voices.slice(0, 10).map((v) => ({
              id: `eleven-${v.voice_id}`,
              name: `${v.name} (ElevenLabs)`,
              gender: v.labels?.gender === 'female' ? 'Female' : 'Male',
              languageCode: 'hi', // Multilingual supports all Indian languages
              languageName: 'Multilingual (Indian)',
              scriptName: 'हिन्दी / Regional',
              accent: v.labels?.accent || 'Natural',
              description: v.description || 'ElevenLabs Ultra-realistic multilingual voice.',
              provider: 'elevenlabs',
              samplePreview: 'नमस्ते, आपका स्वागत है।',
              providerVoiceId: v.voice_id,
              isPopular: true,
            }));
            return [...allVoices, ...fetchedVoices];
          }
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic ElevenLabs voices, falling back to defaults:', err);
      }
    }

    // Default ElevenLabs voice set
    return [...allVoices, ...ELEVENLABS_DEFAULT_VOICES];
  }

  // Core generation function
  static async generate(options: SpeechRequestOptions): Promise<SpeechResult> {
    const { text, language, voiceId, provider = 'google', speed = 1.0, pitch = 'normal', stability = 0.5 } = options;

    if (!text || text.trim().length === 0) {
      throw new Error('Please enter some text before generating audio.');
    }

    if (text.length > 10000) {
      throw new Error('Your text is too long. Please shorten it to under 10,000 characters.');
    }

    // Check language availability
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language);
    if (!langConfig) {
      throw new Error(`The selected language (${language}) is not supported.`);
    }

    if (provider === 'elevenlabs') {
      return await this.generateWithElevenLabs({
        text,
        language,
        voiceId,
        langConfig,
        speed,
        stability,
      });
    }

    // Default: Google TTS
    return await this.generateWithGoogle({
      text,
      language,
      voiceId,
      langConfig,
      speed,
      pitch,
    });
  }

  // Google TTS generation with chunking and ffmpeg post-processing
  private static async generateWithGoogle(params: {
    text: string;
    language: string;
    voiceId?: string;
    langConfig: any;
    speed: number;
    pitch: any;
  }): Promise<SpeechResult> {
    const { text, language, voiceId, langConfig, speed, pitch } = params;

    if (!langConfig.providers.google) {
      throw new Error(
        `This language (${langConfig.name} - ${langConfig.nativeName}) is currently unavailable with Google TTS.`
      );
    }

    // Identify target voice option for metadata & pitch/gender characteristics
    const matchedVoice =
      GOOGLE_VOICES.find((v) => v.id === voiceId) ||
      GOOGLE_VOICES.find((v) => v.languageCode === language) ||
      GOOGLE_VOICES[0];

    const isMale = matchedVoice.gender === 'Male';

    // Split text into chunks
    const chunks = splitTextIntoChunks(text, 170);
    if (chunks.length === 0) {
      throw new Error('No readable text found to generate speech.');
    }

    // Fetch all audio chunks
    const audioBuffers: Buffer[] = [];
    for (const chunk of chunks) {
      const buffer = await fetchGoogleTTSChunk(chunk, language);
      audioBuffers.push(buffer);
    }

    // Merge audio chunks into initial raw MP3
    const mergedRawBuffer = Buffer.concat(audioBuffers);

    const fileBaseId = `ivs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const rawFilePath = path.join(AUDIO_DIR, `${fileBaseId}_raw.mp3`);
    const finalFilename = `indian-voice-studio-${language}-${new Date().toISOString().slice(0, 10)}-${fileBaseId.slice(-4)}.mp3`;
    const finalFilePath = path.join(AUDIO_DIR, finalFilename);

    fs.writeFileSync(rawFilePath, mergedRawBuffer);

    // Apply speed and pitch modulation with FFmpeg if requested
    // Speed: 0.5 to 2.0 (atempo)
    // Pitch: if Male voice, subtle pitch reduction (-7%) for natural baritone warmth; if Female, keep natural / crystal clear
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed || 1.0));

    let audioFilters: string[] = [];

    // Pitch filter
    let pitchMultiplier = 1.0;
    if (pitch === 'low') {
      pitchMultiplier = 0.9;
    } else if (pitch === 'high') {
      pitchMultiplier = 1.1;
    } else if (typeof pitch === 'number') {
      pitchMultiplier = 1.0 + pitch * 0.1;
    } else if (isMale) {
      // Default male profile: slightly deeper resonance
      pitchMultiplier = 0.92;
    }

    if (Math.abs(pitchMultiplier - 1.0) > 0.01) {
      // ffmpeg pitch adjustment formula using asetrate and atempo
      const sampleRate = 44100;
      const newRate = Math.round(sampleRate * pitchMultiplier);
      audioFilters.push(`asetrate=${newRate}`);
      audioFilters.push(`atempo=${(1.0 / pitchMultiplier).toFixed(4)}`);
    }

    // Speed filter
    if (Math.abs(clampedSpeed - 1.0) > 0.02) {
      if (clampedSpeed > 2.0) {
        audioFilters.push('atempo=2.0');
        audioFilters.push(`atempo=${(clampedSpeed / 2.0).toFixed(4)}`);
      } else if (clampedSpeed < 0.5) {
        audioFilters.push('atempo=0.5');
        audioFilters.push(`atempo=${(clampedSpeed / 0.5).toFixed(4)}`);
      } else {
        audioFilters.push(`atempo=${clampedSpeed.toFixed(4)}`);
      }
    }

    try {
      if (audioFilters.length > 0) {
        // Run FFmpeg
        const filterString = audioFilters.join(',');
        await execFileAsync('ffmpeg', [
          '-y',
          '-i',
          rawFilePath,
          '-filter:a',
          filterString,
          '-c:a',
          'libmp3lame',
          '-q:a',
          '2',
          finalFilePath,
        ]);
        // Remove raw temp file
        if (fs.existsSync(rawFilePath)) fs.unlinkSync(rawFilePath);
      } else {
        // No filter needed, rename raw to final
        fs.renameSync(rawFilePath, finalFilePath);
      }
    } catch (ffmpegErr) {
      console.warn('FFmpeg processing error, falling back to raw MP3:', ffmpegErr);
      if (fs.existsSync(rawFilePath) && !fs.existsSync(finalFilePath)) {
        fs.renameSync(rawFilePath, finalFilePath);
      }
    }

    const stats = fs.statSync(finalFilePath);
    // Estimate duration: ~150 words per minute / ~30 chars per second
    const durationSeconds = Math.max(1, Math.round((text.length / 20) * (1.0 / clampedSpeed)));

    return {
      success: true,
      fileId: path.basename(finalFilePath, '.mp3'),
      filename: finalFilename,
      audioUrl: `/api/audio/${finalFilename}`,
      downloadUrl: `/api/download/${finalFilename}`,
      format: 'mp3',
      sizeBytes: stats.size,
      durationEstimateSeconds: durationSeconds,
      language,
      provider: 'google',
      voiceId: matchedVoice.id,
      voiceName: matchedVoice.name,
    };
  }

  // ElevenLabs Generation
  private static async generateWithElevenLabs(params: {
    text: string;
    language: string;
    voiceId?: string;
    langConfig: any;
    speed: number;
    stability: number;
  }): Promise<SpeechResult> {
    const { text, language, voiceId, langConfig, speed, stability } = params;

    const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!elevenKey || elevenKey === 'your_elevenlabs_api_key_here') {
      throw new Error(
        'TTS provider ElevenLabs is not configured with an API key. Please add ELEVENLABS_API_KEY in .env or switch to Google TTS.'
      );
    }

    if (!langConfig.providers.elevenlabs) {
      throw new Error(
        `This language (${langConfig.name}) is currently unavailable with ElevenLabs.`
      );
    }

    // Determine target voice ID
    let targetVoiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel default
    let voiceName = 'Ananya (ElevenLabs)';

    const foundDefault = ELEVENLABS_DEFAULT_VOICES.find((v) => v.id === voiceId || v.providerVoiceId === voiceId);
    if (foundDefault && foundDefault.providerVoiceId) {
      targetVoiceId = foundDefault.providerVoiceId;
      voiceName = foundDefault.name;
    } else if (voiceId && voiceId.startsWith('eleven-')) {
      targetVoiceId = voiceId.replace('eleven-', '');
      voiceName = `Voice ${targetVoiceId.substring(0, 6)}`;
    }

    const requestPayload = {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: Math.max(0.1, Math.min(1.0, stability || 0.5)),
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    };

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenKey,
        },
        body: JSON.stringify(requestPayload),
      }
    );

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = (await response.json()) as any;
        errorDetail = errorJson.detail?.message || errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = await response.text();
      }

      if (response.status === 401) {
        throw new Error('ElevenLabs API authentication failed. Please verify your ELEVENLABS_API_KEY.');
      } else if (response.status === 429) {
        throw new Error('The voice service is temporarily rate-limited or quota exceeded. Please wait and try again.');
      } else {
        throw new Error(`ElevenLabs error (${response.status}): ${errorDetail || 'Voice generation failed.'}`);
      }
    }

    const audioArrayBuffer = await response.arrayBuffer();
    const rawBuffer = Buffer.from(audioArrayBuffer);

    const fileBaseId = `ivs_el_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const finalFilename = `indian-voice-studio-${language}-${new Date().toISOString().slice(0, 10)}-${fileBaseId.slice(-4)}.mp3`;
    const finalFilePath = path.join(AUDIO_DIR, finalFilename);

    // If speed is adjusted, run FFmpeg
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed || 1.0));
    if (Math.abs(clampedSpeed - 1.0) > 0.02) {
      const rawFilePath = path.join(AUDIO_DIR, `${fileBaseId}_raw.mp3`);
      fs.writeFileSync(rawFilePath, rawBuffer);
      try {
        await execFileAsync('ffmpeg', [
          '-y',
          '-i',
          rawFilePath,
          '-filter:a',
          `atempo=${clampedSpeed.toFixed(4)}`,
          '-c:a',
          'libmp3lame',
          '-q:a',
          '2',
          finalFilePath,
        ]);
        if (fs.existsSync(rawFilePath)) fs.unlinkSync(rawFilePath);
      } catch (err) {
        fs.writeFileSync(finalFilePath, rawBuffer);
      }
    } else {
      fs.writeFileSync(finalFilePath, rawBuffer);
    }

    const stats = fs.statSync(finalFilePath);
    const durationSeconds = Math.max(1, Math.round((text.length / 20) * (1.0 / clampedSpeed)));

    return {
      success: true,
      fileId: path.basename(finalFilePath, '.mp3'),
      filename: finalFilename,
      audioUrl: `/api/audio/${finalFilename}`,
      downloadUrl: `/api/download/${finalFilename}`,
      format: 'mp3',
      sizeBytes: stats.size,
      durationEstimateSeconds: durationSeconds,
      language,
      provider: 'elevenlabs',
      voiceId: targetVoiceId,
      voiceName,
    };
  }

  // Convert MP3 to WAV using FFmpeg
  static async convertToWav(mp3Filename: string): Promise<string> {
    const mp3Path = path.join(AUDIO_DIR, mp3Filename);
    if (!fs.existsSync(mp3Path)) {
      throw new Error('Source audio file not found.');
    }

    const wavFilename = mp3Filename.replace(/\.mp3$/, '.wav');
    const wavPath = path.join(AUDIO_DIR, wavFilename);

    if (!fs.existsSync(wavPath)) {
      await execFileAsync('ffmpeg', ['-y', '-i', mp3Path, '-c:a', 'pcm_s16le', wavPath]);
    }

    return wavFilename;
  }
}
