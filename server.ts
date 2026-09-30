import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { TTSService, splitTextIntoChunks } from './src/server/ttsService.ts';
import { SUPPORTED_LANGUAGES, GOOGLE_VOICES } from './src/server/voiceConfig.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const AUDIO_DIR = path.resolve(process.cwd(), 'audio_storage');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Indian Voice Studio',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    providers: TTSService.getProviderStatus(),
  });
});

// List Providers
app.get('/api/providers', (_req: Request, res: Response) => {
  res.json(TTSService.getProviderStatus());
});

// List Supported Languages
app.get('/api/languages', (_req: Request, res: Response) => {
  res.json({
    languages: SUPPORTED_LANGUAGES,
    total: SUPPORTED_LANGUAGES.length,
  });
});

// List Voices (with optional language or provider filter)
app.get('/api/voices', async (req: Request, res: Response) => {
  try {
    const language = (req.query.language as string) || '';
    const provider = (req.query.provider as string) || '';
    const allVoices = await TTSService.getVoices();

    let filtered = allVoices;
    if (language) {
      filtered = filtered.filter((v) => v.languageCode === language || (v.provider === 'elevenlabs' && v.languageCode === 'hi'));
    }
    if (provider) {
      filtered = filtered.filter((v) => v.provider === provider);
    }

    res.json({
      voices: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve voices.' });
  }
});

// Generate Voice Speech
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { text, language, voice_id, provider, speed, pitch, stability } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Please enter some text before generating audio.' });
      return;
    }

    const result = await TTSService.generate({
      text: text.trim(),
      language: language || 'hi',
      voiceId: voice_id,
      provider: provider || 'google',
      speed: speed ? Number(speed) : 1.0,
      pitch: pitch || 'normal',
      stability: stability ? Number(stability) : 0.5,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Generation error:', err);
    res.status(400).json({ error: err.message || 'Voice generation failed. Please try again.' });
  }
});

// Voice Preview (Generates short sample speech)
app.post('/api/preview', async (req: Request, res: Response) => {
  try {
    const { voice_id, language, sample_text, provider } = req.body;

    const allVoices = await TTSService.getVoices();
    const voice = allVoices.find((v) => v.id === voice_id);
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === (language || voice?.languageCode || 'hi'));

    const previewText = sample_text || voice?.samplePreview || langConfig?.shortPreviewText || 'नमस्ते, आपका स्वागत है।';
    const effectiveLanguage = language || voice?.languageCode || 'hi';
    const effectiveProvider = provider || voice?.provider || 'google';

    const result = await TTSService.generate({
      text: previewText,
      language: effectiveLanguage,
      voiceId: voice_id,
      provider: effectiveProvider,
      speed: 1.0,
      pitch: 'normal',
    });

    res.json(result);
  } catch (err: any) {
    console.error('Preview error:', err);
    res.status(400).json({ error: err.message || 'Failed to generate voice preview.' });
  }
});

// Long Text Generation (Splits text and informs section count)
app.post('/api/generate-long', async (req: Request, res: Response) => {
  try {
    const { text, language, voice_id, provider, speed, pitch, stability } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Please enter some text before generating audio.' });
      return;
    }

    const chunks = splitTextIntoChunks(text, 170);

    const result = await TTSService.generate({
      text: text.trim(),
      language: language || 'hi',
      voiceId: voice_id,
      provider: provider || 'google',
      speed: speed ? Number(speed) : 1.0,
      pitch: pitch || 'normal',
      stability: stability ? Number(stability) : 0.5,
    });

    res.json({
      ...result,
      chunksProcessed: chunks.length,
      isLongText: chunks.length > 1,
    });
  } catch (err: any) {
    console.error('Long generation error:', err);
    res.status(400).json({ error: err.message || 'Long text voice generation failed.' });
  }
});

// Convert existing MP3 to WAV
app.post('/api/convert-wav/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const wavFilename = await TTSService.convertToWav(filename);
    res.json({
      success: true,
      wavFilename,
      downloadUrl: `/api/download/${wavFilename}?format=wav`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to convert audio to WAV format.' });
  }
});

// Stream Audio file
app.get('/api/audio/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(AUDIO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Audio file not found or expired.');
    return;
  }

  const stat = fs.statSync(filePath);
  const isWav = filename.endsWith('.wav');
  const contentType = isWav ? 'audio/wav' : 'audio/mpeg';

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// Force File Download
app.get('/api/download/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(AUDIO_DIR, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Audio file not found or expired.');
    return;
  }

  const isWav = filename.endsWith('.wav');
  const contentType = isWav ? 'audio/wav' : 'audio/mpeg';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  fs.createReadStream(filePath).pipe(res);
});

// Dev & Production serving setup
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Indian Voice Studio] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
