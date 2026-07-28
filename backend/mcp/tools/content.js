import { z } from 'zod';
import axios from 'axios';
import { db } from '../../config/database.js';

export function registerContentTools(server, { getUserCtx }) {

  server.tool(
    'generate_custom_voice',
    'Generate a custom AI voice from a text description (tone, style, use case). Returns an audio preview URL.',
    {
      description: z.string().min(1).describe('Description of the voice character'),
      tone: z.string().optional().describe('Voice tone (e.g. warm, authoritative, playful)'),
      style: z.string().optional().describe('Voice style (e.g. conversational, dramatic)'),
      use_case: z.string().optional().describe('Use case (e.g. podcast, audiobook, ads)'),
      test_script: z.string().optional().describe('Sample text to test the voice with'),
    },
    async ({ description, tone, style, use_case, test_script }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      try {
        const promptParts = [description, tone, style, use_case].filter(Boolean);
        const prompt = promptParts.join(', ');

        const ttsBody = JSON.stringify({
          api_key: process.env.TTS_API_KEY,
          mode: 'prompt_voices',
          prompt,
          tts_text: test_script || '',
        });

        const ttsResponse = await axios.post(
          process.env.TTS_API_URL || 'https://srv16.aisoftllc.com/apis/api.php',
          ttsBody,
          { headers: { 'Content-Type': 'text/plain' }, timeout: 60000 }
        );

        const result = ttsResponse.data;
        if (result?.status !== 'success' || !result?.data?.output_url) {
          return { content: [{ type: 'text', text: `Voice generation failed: ${result?.message || 'Unknown error'}` }], isError: true };
        }

        // Download and save locally
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

        const filename = `custom_voice_${Date.now()}-${Math.round(Math.random() * 1e9)}.mp3`;
        const localPath = path.join(uploadDir, filename);

        const audioResponse = await axios.get(result.data.output_url, { responseType: 'arraybuffer', timeout: 60000 });
        fs.writeFileSync(localPath, Buffer.from(audioResponse.data));

        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        const localUrl = `${baseUrl}/uploads/${filename}`;

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              audio_url: localUrl,
              job_id: result.data.job_id || null,
            }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'generate_ai_content',
    'Generate AI content (scripts, ad copy, etc.) using the DeepSeek LLM. Provide a detailed prompt.',
    {
      prompt: z.string().min(1).describe('The prompt for content generation'),
      json_mode: z.boolean().optional().default(false).describe('Whether to return structured JSON'),
    },
    async ({ prompt, json_mode }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      try {
        const { callDeepSeek } = await import('../../controllers/aiController.js');
        const result = await callDeepSeek(
          'You are a professional content creator specializing in marketing, sales copy, and voiceover scripts.',
          prompt,
          { maxTokens: 4000, temperature: 0.7, jsonMode: json_mode }
        );
        return { content: [{ type: 'text', text: result }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `AI generation error: ${err.message}` }], isError: true };
      }
    }
  );

  server.tool(
    'scrape_webpage',
    'Scrape a webpage and extract structured content (title, headings, body text). Useful for generating scripts from product pages.',
    {
      url: z.string().url().describe('The URL to scrape'),
    },
    async ({ url }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      try {
        const cheerio = await import('cheerio');
        const response = await axios.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AITalkerBot/1.0)' },
        });
        const $ = cheerio.load(response.data);

        $('script, style, nav, footer, header, iframe, noscript').remove();
        const title = $('title').text().trim();
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        const headings = [];
        $('h1, h2, h3').each((_, el) => {
          const txt = $(el).text().trim();
          if (txt && headings.length < 20) headings.push(txt);
        });
        const bodyParts = [];
        $('p, li, blockquote').each((_, el) => {
          const txt = $(el).text().trim();
          if (txt && bodyParts.length < 50) bodyParts.push(txt);
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ title, meta_description: metaDesc, headings, body: bodyParts.join('\n').slice(0, 5000) }, null, 2),
          }],
        };
      } catch (err) {
        return { content: [{ type: 'text', text: `Scrape error: ${err.message}` }], isError: true };
      }
    }
  );
}
