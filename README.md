# Indian Voice Studio

> **“Turn your text into natural Indian voices.”**

Indian Voice Studio is a production-grade full-stack Text-to-Speech (TTS) web platform dedicated to Indian regional languages and Indian-accented voices. Users can enter or paste text, select an Indian language, pick from authentic male and female voices, fine-tune speaking speed and vocal pitch, synthesize natural speech, preview the audio in a professional interactive player, and download it instantly as an MP3 or WAV file.

---

## Key Features

- **Broad Indic Language Support**:
  - **Hindi** (हिन्दी)
  - **Telugu** (తెలుగు)
  - **Tamil** (தமிழ்)
  - **Kannada** (ಕನ್ನಡ)
  - **Malayalam** (മലയാളം)
  - **Marathi** (मराठी)
  - **Bengali** (বাংলা)
  - **Gujarati** (ગુજરાતી)
  - **Punjabi** (ਪੰਜਾਬੀ)
  - **Urdu** (اردو)
  - **English (India)** with urban Indian accent
  - Transparent availability badges for unsupported/experimental languages (Odia, Assamese)
- **Multi-Provider Architecture**:
  - **Google TTS**: Built-in, high-clarity neural speech engine with Indian regional accents. Free, fast, and ready out of the box with zero API keys required.
  - **ElevenLabs**: Direct integration with Eleven Multilingual v2 models when `ELEVENLABS_API_KEY` is provided in `.env`.
- **Authentic Voice Catalog**:
  - Distinct Male and Female voice profiles (e.g. *Ananya*, *Aarav*, *Shravya*, *Sai Krishna*, *Meera*, *Karthik*, *Sahana*, *Manjunath*, *Priya*, *Vikram*).
  - Accurate regional cadence, pronunciation, and timbre.
  - Instant voice sample preview buttons with loading states.
- **Large Studio Text Editor**:
  - Word counter and real-time character counter (`/ 5,000 chars`).
  - One-click authentic sample text insertion for every Indian language.
  - Text file import (`.txt`), Copy to clipboard, Paste from clipboard, and Clear.
- **Vocal Engineering Controls**:
  - Speaking speed multiplier (`0.5x` to `2.0x`) with audio resynthesis.
  - Vocal pitch & timbre adjustment (*Low*, *Normal*, *High*).
  - Stability control for generative voice models.
- **Professional Audio Player**:
  - Real-time animated audio soundwave frequency visualizer.
  - Scrubbable seek bar with elapsed and remaining time (`00:18 / 00:42`).
  - Volume slider and one-click mute toggle.
  - Playback speed chips (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
  - Meaningful downloadable filename format (e.g. `indian-voice-studio-hindi-2026-09-30-xxxx.mp3`).
  - One-click **Download MP3** and **Download WAV** formats.
- **Local Generation History**:
  - Automatically saves previous audio generations in `localStorage`.
  - Inline playback, MP3 download, and delete controls without needing an external database.
- **Responsive & Dark Mode**:
  - Clean light and dark modes with persistent local preference.
  - Fluid mobile-friendly design conforming to strict anti-slop guidelines.

---

## Architecture & Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Tailwind CSS v4
  - Lucide React iconography
- **Backend**:
  - Node.js + Express with TypeScript execution (`tsx`)
  - Vite dev server middleware mounted for SPA rendering
- **Audio Processing**:
  - FFmpeg engine for audio filtering (`atempo`, `asetrate`), MP3 concatenation, and WAV conversions
  - Automatic 2-hour disk cache cleanup for temporary audio artifacts
- **TTS Layer**:
  - Google Neural Text-to-Speech client with intelligent chunking
  - ElevenLabs API client (Multilingual v2)

---

## Getting Started

### 1. Requirements

- **Node.js**: v18.0.0 or higher
- **FFmpeg**: System package installed (`ffmpeg` in PATH)

### 2. Installation

```bash
git clone <repository_url>
cd indian-voice-studio
npm install
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if you would like to enable ElevenLabs:

```env
# Optional: Provide ElevenLabs API key for AI ultra-realistic voices
ELEVENLABS_API_KEY=your_key_here
```

*Note: If no key is set, the application will default to Google TTS seamlessly without errors.*

### 4. Running the Application

Start the development server:

```bash
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

### 5. Building for Production

```bash
npm run build
npm run start
```

---

## REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, version, and provider status |
| `GET` | `/api/providers` | Lists active TTS providers and status |
| `GET` | `/api/languages` | Supported Indian languages and availability flags |
| `GET` | `/api/voices` | Catalog of available voices with metadata |
| `POST` | `/api/generate` | Synthesizes text to MP3 audio |
| `POST` | `/api/preview` | Generates short sample preview for a voice |
| `POST` | `/api/generate-long`| Chunks long text and merges into a single MP3 |
| `POST` | `/api/convert-wav/:filename` | Converts an existing MP3 into WAV format |
| `GET` | `/api/audio/:filename` | Streams MP3/WAV audio with range request support |
| `GET` | `/api/download/:filename` | Triggers browser attachment download |

### Example Generation Request

`POST /api/generate`

```json
{
  "text": "నమస్కారం! ఇది ఇండియన్ వాయిస్ స్టూడియో.",
  "language": "te",
  "provider": "google",
  "voice_id": "google-te-shravya",
  "speed": 1.0,
  "pitch": "normal"
}
```

Response:

```json
{
  "success": true,
  "fileId": "indian-voice-studio-te-2026-09-30-xxxx",
  "filename": "indian-voice-studio-te-2026-09-30-xxxx.mp3",
  "audioUrl": "/api/audio/indian-voice-studio-te-2026-09-30-xxxx.mp3",
  "downloadUrl": "/api/download/indian-voice-studio-te-2026-09-30-xxxx.mp3",
  "format": "mp3",
  "sizeBytes": 29184,
  "durationEstimateSeconds": 2,
  "language": "te",
  "provider": "google",
  "voiceId": "google-te-shravya",
  "voiceName": "Shravya"
}
```

---

## Troubleshooting

- **Audio doesn't play automatically**: Modern browsers enforce autoplay policies. Click the **Play** button on the audio player to begin playback.
- **ElevenLabs shows 'Not configured'**: Verify that `ELEVENLABS_API_KEY` is present in `.env` and restart the server.
- **Unsupported Language Notice**: If selecting Odia (`or`) or Assamese (`as`), the system clearly marks them as unavailable per provider constraints.
- **FFmpeg not found**: Install ffmpeg on Linux (`sudo apt install ffmpeg`), macOS (`brew install ffmpeg`), or Windows (`winget install Gyan.FFmpeg`).

---

## License

Apache-2.0
