import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import { initCronJobs } from './utils/cron.js';
import { verifyToken } from './middleware/auth.js';
import { buildEntityRouter } from './routes/entityRouter.js';

// Route imports
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import uploadRoutes from './routes/uploads.js';
import planRoutes, { usageRouter, dfyOffersRouter } from './routes/plan.js';
import agencyRoutes from './routes/agency.js';
import scrapeRoutes from './routes/scrape.js';
import extractScriptRoutes from './routes/extractScript.js';
import backgroundMusicRoutes from './routes/backgroundMusic.js';
import voiceCloneRoutes from './routes/voiceClones.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));
app.use('/music', express.static(path.join(__dirname, 'music')));
// ── Entity Route Definitions ──────────────────────────────────────────────────
// Format: buildEntityRouter(tableName, [allowedFields], userScoped)

const voiceoverRoutes = buildEntityRouter('voiceovers', [
  'title', 'keywords', 'script', 'script_source', 'voice_type', 'voice_id', 'voice_name', 'voice_url',
  'language', 'emotion', 'emotion_strength', 'scene_mode', 'voice_consistency',
  'background_music', 'status', 'audio_url', 'is_favorite', 'tags',
]);

// voiceCloneRoutes is now imported from routes/voiceClones.js (adds /public endpoint)

const customVoiceRoutes = buildEntityRouter('custom_voices', [
  'name', 'description', 'tone', 'style', 'use_case',
  'test_script', 'audio_url', 'category', 'status', 'is_favorite', 'is_brand_voice', 'generation_version',
]);

const audioMixRoutes = buildEntityRouter('audio_mixes', [
  'name', 'voiceover_ids', 'music_url', 'music_source',
  'voice_volume', 'music_volume', 'auto_ducking', 'preset',
  'status', 'output_url',
]);

const vslCopyRoutes = buildEntityRouter('vsl_copies', [
  'product_name', 'sales_page_url', 'framework', 'emotion', 'tone',
  'keywords', 'script', 'hook', 'status', 'variations',
]);

const adCopyRoutes = buildEntityRouter('ad_copies', [
  'product_name', 'product_url', 'platform', 'style',
  'headline', 'copy_text', 'variations', 'status',
]);

const transcriptionRoutes = buildEntityRouter('transcriptions', [
  'title', 'source_url', 'source_type', 'output_format',
  'language', 'status', 'transcript', 'duration', 'word_count',
]);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/users',             usersRoutes);
app.use('/api/ai',                aiRoutes);
app.use('/api/uploads',           uploadRoutes);
app.use('/api/plan-limits',       planRoutes);
app.use('/api/usage-monthly',     usageRouter);
app.use('/api/dfy-offers',        dfyOffersRouter);
app.use('/api/agency',            agencyRoutes);
app.use('/api/scrape',            scrapeRoutes);
app.use('/api/extract-script',   extractScriptRoutes);
app.use('/api/background-music',  backgroundMusicRoutes);

// Entity routes (all protected)
app.use('/api/voiceovers',        verifyToken, voiceoverRoutes);
app.use('/api/voice-clones',      verifyToken, voiceCloneRoutes);
app.use('/api/custom-voices',     verifyToken, customVoiceRoutes);
app.use('/api/audio-mixes',       verifyToken, audioMixRoutes);
app.use('/api/vsl-copies',        verifyToken, vslCopyRoutes);
app.use('/api/ad-copies',         verifyToken, adCopyRoutes);
app.use('/api/transcriptions',    verifyToken, transcriptionRoutes);

// (Agency routes are now handled by /routes/agency.js)

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
const start = async () => {
  await testConnection();
  initCronJobs();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
