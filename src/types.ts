export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  languageCode: string;
  languageName: string;
  scriptName: string;
  accent: string;
  description: string;
  provider: 'google' | 'elevenlabs';
  samplePreview: string;
  providerVoiceId?: string;
  isPopular?: boolean;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  sampleText: string;
  shortPreviewText: string;
  providers: {
    google: boolean;
    elevenlabs: boolean;
  };
}

export interface ProviderInfo {
  id: 'google' | 'elevenlabs';
  name: string;
  status: 'available' | 'not_configured';
  isReady: boolean;
  badge: string;
  description: string;
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
  chunksProcessed?: number;
  isLongText?: boolean;
}

export interface HistoryItem {
  id: string;
  text: string;
  languageCode: string;
  languageName: string;
  scriptName: string;
  voiceId: string;
  voiceName: string;
  provider: 'google' | 'elevenlabs';
  audioUrl: string;
  downloadUrl: string;
  filename: string;
  durationSeconds: number;
  createdAt: string;
}

export type ThemeMode = 'light' | 'dark';
