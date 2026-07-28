import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { resolveUserId, getUserById } from './api-client.js';
import { registerVoiceTools } from './tools/voice.js';
import { registerEntityTools } from './tools/entity.js';
import { registerContentTools } from './tools/content.js';
import { registerAccountTools } from './tools/account.js';
import { registerResources } from './resources/index.js';
import { z } from 'zod';

function createMcpServer(userId) {
  const server = new McpServer({
    name: 'aitalker',
    version: '1.0.0',
  });

  const deps = {
    getUserCtx: async (extra) => {
      const user = await getUserById(userId);
      return { user, userId };
    },
  };

  registerVoiceTools(server, deps);
  registerContentTools(server, deps);
  registerAccountTools(server, deps);
  registerResources(server, deps);

  const entityConfigs = [
    {
      toolPrefix: 'voiceover',
      tableName: 'voiceovers',
      entityName: 'voiceover',
      description: 'Queues text for voice generation with selected voice and emotion.',
      fields: ['title', 'keywords', 'script', 'script_source', 'voice_id', 'voice_name', 'voice_url',
               'language', 'emotion', 'emotion_strength', 'scene_mode', 'voice_consistency', 'api_type',
               'background_music', 'background_music_enabled', 'background_music_volume', 'status', 'audio_url', 'is_favorite', 'tags'],
      createSchema: {
        title: z.string().optional().describe('Title for the voiceover'),
        script: z.string().min(1).describe('The text script to convert to audio'),
        voice_url: z.string().describe('Audio URL of the voice model'),
        voice_name: z.string().optional().describe('Voice name for display'),
        emotion: z.enum(['neutral', 'happy', 'sad', 'excited', 'calm', 'serious']).default('neutral'),
        language: z.string().optional().default('en'),
      },
    },
    {
      toolPrefix: 'voice_clone',
      tableName: 'voice_clones',
      entityName: 'voice clone',
      description: 'Submits a voice sample for AI cloning.',
      fields: ['name', 'description', 'script', 'language', 'gender', 'clone_mode', 'sample_url', 'audio_url', 'source_type', 'status', 'is_favorite', 'is_public'],
      createSchema: {
        name: z.string().min(1).describe('Name for the cloned voice'),
        description: z.string().optional().describe('Description of the voice'),
        sample_url: z.string().describe('URL of the voice sample audio file'),
        clone_mode: z.enum(['quick', 'standard', 'studio']).default('standard'),
        language: z.string().optional(),
      },
    },
    {
      toolPrefix: 'vsl_script',
      tableName: 'vsl_copies',
      entityName: 'VSL script',
      description: 'Stores a Video Sales Letter script.',
      fields: ['product_name', 'sales_page_url', 'framework', 'emotion', 'tone', 'keywords', 'script', 'hook', 'variations', 'status'],
      createSchema: {
        product_name: z.string().min(1).describe('Product name for the VSL'),
        script: z.string().optional().describe('The VSL script text'),
        framework: z.enum(['pas', 'aida', 'hero', 'story']).default('pas'),
        emotion: z.string().default('excited'),
        tone: z.string().default('friendly'),
      },
    },
    {
      toolPrefix: 'ad_copy',
      tableName: 'ad_copies',
      entityName: 'ad copy',
      description: 'Stores advertising copy for social media platforms.',
      fields: ['product_name', 'product_url', 'platform', 'style', 'headline', 'copy_text', 'variations', 'status'],
      createSchema: {
        product_name: z.string().min(1).describe('Product name'),
        platform: z.enum(['facebook', 'google', 'instagram', 'email', 'linkedin', 'twitter']).default('facebook'),
        headline: z.string().optional().describe('Ad headline'),
        copy_text: z.string().optional().describe('Ad body text'),
      },
    },
    {
      toolPrefix: 'transcription',
      tableName: 'transcriptions',
      entityName: 'transcription',
      description: 'Submits audio/video for speech-to-text transcription.',
      fields: ['title', 'source_url', 'source_type', 'output_format', 'language', 'status', 'transcript', 'duration', 'word_count'],
      createSchema: {
        title: z.string().min(1).describe('Title for the transcription'),
        source_url: z.string().describe('URL of audio/video to transcribe'),
        source_type: z.enum(['youtube', 'upload']).default('youtube'),
        output_format: z.enum(['text', 'srt', 'vtt', 'json']).default('text'),
        language: z.string().default('en'),
      },
    },
    {
      toolPrefix: 'audio_mix',
      tableName: 'audio_mixes',
      entityName: 'audio mix',
      description: 'Mixes voiceovers with background music.',
      fields: ['name', 'voiceover_ids', 'music_url', 'music_source', 'voice_volume', 'music_volume', 'auto_ducking', 'preset', 'status', 'output_url'],
      createSchema: {
        name: z.string().optional().describe('Name for the mix'),
        voiceover_ids: z.array(z.number()).describe('Array of voiceover IDs to include'),
        music_url: z.string().optional().describe('Background music URL'),
        voice_volume: z.number().min(0).max(100).default(100),
        music_volume: z.number().min(0).max(100).default(30),
      },
    },
    {
      toolPrefix: 'conversation',
      tableName: 'conversational_voices',
      entityName: 'conversational audio',
      description: 'Creates multi-speaker dialogue audio.',
      fields: ['title', 'full_script', 'speakers', 'segments', 'audio_url', 'duration', 'status'],
      createSchema: {
        title: z.string().optional(),
        full_script: z.string().min(1).describe('Full dialogue script'),
      },
    },
    {
      toolPrefix: 'brand_project',
      tableName: 'brand_studio_projects',
      entityName: 'Brand Studio project',
      description: 'Creates a brand voice profile with VSL generation.',
      fields: ['title', 'website_url', 'brand_voice_profile', 'vsl_script', 'voice_prompt', 'additional_scripts', 'audio_url', 'duration_seconds', 'status'],
      createSchema: {
        title: z.string().optional(),
        website_url: z.string().optional().describe('Website to analyze for brand voice'),
      },
    },
    {
      toolPrefix: 'audiobook',
      tableName: 'audiobooks',
      entityName: 'audiobook',
      description: 'Converts text/book files to audiobook format.',
      fields: ['title', 'original_file', 'file_url', 'voice_id', 'voice_name', 'voice_type', 'voice_url', 'language', 'audio_url', 'status'],
      createSchema: {
        title: z.string().min(1).describe('Book title'),
        file_url: z.string().describe('URL of the uploaded book/text file'),
        voice_url: z.string().optional().describe('Voice audio URL for narration'),
        language: z.string().default('en'),
      },
    },
  ];

  for (const config of entityConfigs) {
    registerEntityTools(server, deps, config);
  }

  return server;
}

async function resolveApiKey(req) {
  return req.headers['x-api-key'] ||
    (() => { try { return JSON.parse(req.headers['extra-headers'] || '{}')['X-Api-Key']; } catch { return null; } })();
}

// Legacy SSE sessions (GET /sse → stream, POST /messages → JSON-RPC)
const sseSessions = new Map();

export function mountMcpEndpoints(app) {

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY SSE TRANSPORT (what most platforms use today)
  // GET  /sse      → establishes SSE stream, sends endpoint event
  // POST /messages → receives JSON-RPC messages
  // ═══════════════════════════════════════════════════════════════════════════

  app.get('/sse', async (req, res) => {
    const apiKey = await resolveApiKey(req);
    if (!apiKey) return res.status(401).json({ error: 'Missing X-Api-Key' });

    const userId = await resolveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Invalid API key' });

    const server = createMcpServer(userId);
    const transport = new SSEServerTransport('/messages', res);

    sseSessions.set(transport.sessionId, { server, transport });

    res.on('close', () => {
      sseSessions.delete(transport.sessionId);
      transport.close();
    });

    await server.connect(transport);
  });

  app.post('/messages', async (req, res) => {
    const sessionId = req.query.sessionId;
    const session = sseSessions.get(sessionId);
    if (!session) {
      return res.status(400).json({ error: 'Invalid or expired session. Connect to /sse first.' });
    }
    await session.transport.handlePostMessage(req, res);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STREAMABLE HTTP TRANSPORT (newer MCP spec)
  // POST /mcp → handles initialize + tool calls
  // GET  /mcp → SSE streaming
  // ═══════════════════════════════════════════════════════════════════════════

  app.post('/mcp', async (req, res) => {
    const apiKey = await resolveApiKey(req);
    if (!apiKey) return res.status(401).json({ error: 'Missing X-Api-Key header' });

    const userId = await resolveUserId(req);
    if (!userId) return res.status(401).json({ error: 'Invalid API key' });

    try {
      const server = createMcpServer(userId);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => transport.close());
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('[MCP] Error handling request:', err.message);
      if (!res.headersSent) res.status(500).json({ error: 'MCP server error' });
    }
  });

  app.get('/mcp', async (req, res) => {
    const apiKey = await resolveApiKey(req);
    if (!apiKey) return res.status(401).json({ error: 'Missing X-Api-Key' });

    const mockReq = { headers: { 'x-api-key': apiKey } };
    const userId = await resolveUserId(mockReq);
    if (!userId) return res.status(401).json({ error: 'Invalid API key' });

    const server = createMcpServer(userId);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });

  app.delete('/mcp', async (req, res) => {
    res.status(200).json({ message: 'Session closed' });
  });

  console.log('[MCP] Endpoints mounted: /sse + /messages (legacy SSE) | /mcp (streamable HTTP)');
}
