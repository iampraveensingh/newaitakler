import axios from 'axios';
import * as cheerio from 'cheerio';
import { successResponse, errorResponse } from '../utils/response.js';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL   = 'deepseek-chat';

/**
 * Shared helper — calls DeepSeek chat completions.
 * @param {string}  systemPrompt
 * @param {string}  userPrompt
 * @param {object}  [opts]  { maxTokens, temperature, jsonMode }
 */
async function callDeepSeek(systemPrompt, userPrompt, { maxTokens = 4000, temperature = 0.7, jsonMode = false } = {}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not configured.');

  const { data } = await axios.post(
    DEEPSEEK_API_URL,
    {
      model:    DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      max_tokens:  maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 90000,
    }
  );

  return data.choices[0]?.message?.content || '';
}

// ─── Content Generation ───────────────────────────────────────────────────────

/**
 * POST /api/ai/generate
 * Body: { prompt: string, response_json_schema: object }
 */
export const generateContent = async (req, res) => {
  const { prompt, response_json_schema } = req.body;

  if (!prompt) return errorResponse(res, 'Prompt is required', 400);

  if (!process.env.DEEPSEEK_API_KEY) {
    console.warn('⚠️  DEEPSEEK_API_KEY not set. Returning mock AI response.');
    return successResponse(res, buildMockFromSchema(response_json_schema));
  }

  try {
    const systemPrompt = response_json_schema
      ? `You are a helpful assistant. Always respond with valid JSON matching this schema: ${JSON.stringify(response_json_schema)}. Do not include any text outside the JSON.`
      : 'You are a helpful assistant.';

    const raw = await callDeepSeek(systemPrompt, prompt, {
      maxTokens:   4000,
      temperature: 0.7,
      jsonMode:    !!response_json_schema,
    });

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { result: raw };
    }

    // Strip emotion/style bracketed tags (e.g. "[Excited, friendly tone]") from all string values
    parsed = stripBracketTags(parsed);

    return successResponse(res, parsed);
  } catch (error) {
    console.error('AI generation error:', error.response?.data || error.message);
    return errorResponse(res, 'AI generation failed. Please try again.', 500);
  }
};

// ─── Brand Analysis ───────────────────────────────────────────────────────────

/**
 * POST /api/ai/brand-analyze
 * Body: { url: string }
 */
export const analyzeBrand = async (req, res) => {
  const { url } = req.body;

  if (!url) return errorResponse(res, 'URL is required', 400);
  try { new URL(url); } catch {
    return errorResponse(res, 'Invalid URL format', 400);
  }

  // ── Step 1: Scrape ──────────────────────────────────────────────────────────
  let scrapedContent = '';
  let pageTitle      = '';

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept':     'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    $('script, style, noscript, nav, footer, header, iframe, .cookie-banner, .popup, .modal').remove();

    pageTitle        = $('h1').first().text().trim() || $('title').text().trim() || '';
    const metaDesc   = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

    const headings = [];
    $('h1, h2, h3').each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > 2) headings.push(t);
    });

    const bodyParts = [];
    $('p, li, blockquote').each((_, el) => {
      const t = $(el).text().trim().replace(/\s+/g, ' ');
      if (t.length > 30) bodyParts.push(t);
    });

    const bodyText = [...new Set(bodyParts)].slice(0, 60).join('\n').slice(0, 6000);

    scrapedContent = `
Page Title: ${pageTitle}
Meta Description: ${metaDesc}
Headings: ${headings.slice(0, 15).join(' | ')}
Content:
${bodyText}`.trim();
  } catch (err) {
    console.warn('Brand Studio scrape failed, continuing without scraped data:', err.message);
  }

  // ── Step 2: DeepSeek AI Generation ─────────────────────────────────────────
  if (!process.env.DEEPSEEK_API_KEY) {
    return successResponse(res, buildMockBrandData(pageTitle || url, url));
  }

  const systemPrompt = `You are an expert brand strategist and VSL copywriter.
Analyze the provided website content and return a JSON object with EXACTLY these fields:
{
  "brand_name": string,
  "brand_voice_profile": {
    "website_type": string,
    "emotion": string,
    "tone": string,
    "style": string,
    "personality": string,
    "target_audience": string,
    "tagline": string,
    "content_summary": string,
    "speaker_style": string,
    "voice_prompt": string,
    "key_messages": [string, string, string]
  },
  "vsl_sections": {
    "hook": string,
    "body": string,
    "cta": string
  },
  "vsl_script": string
}
website_type: classify the site (e.g. "Digital Product / SaaS", "E-Commerce", "Service Business", "Blog / Media", "Agency", "Personal Brand").
emotion: the primary emotional tone conveyed (e.g. "Excited", "Trustworthy", "Inspiring", "Urgent", "Calm").
tone: describe the writing/voice tone (e.g. "Bold", "Professional", "Friendly", "Authoritative").
content_summary: 2–3 sentence plain-English summary of what the brand does, who it serves, and its key value proposition.
speaker_style: a short label describing the ideal voice narrator (e.g. "Confident, energetic male narrator with authoritative warmth").
voice_prompt: a 2–3 sentence TTS voice description following this exact structure — (1) start with gender (Male/Female), age range (e.g. "young adult in their late 20s", "middle-aged"), pitch (high/medium/low), pace (fast/medium/slow), and primary emotion; (2) add 2–3 voice characteristics (e.g. "warm, magnetic, crisp, rich, soothing, powerful"); (3) end with the ideal use case for this brand. Example: "A confident male voice in his mid-30s, medium pitch and steady pace, with a calm and authoritative tone. Warm, magnetic, and rich in quality — purposeful without being aggressive. Ideal for professional service brands, VSL narration, and trust-building campaigns."
vsl_sections.hook: the opening hook paragraph of the VSL (1–2 sentences that grab attention).
vsl_sections.body: the middle story/proof section (several sentences building desire).
vsl_sections.cta: the closing call-to-action paragraph.
vsl_script: the complete VSL combining all sections — a high-converting Video Sales Letter with hook, story, offer, and CTA. Minimum 300 words, conversational tone optimized for voice delivery.
Return ONLY valid JSON. No markdown. No extra text.`;

  const userPrompt = scrapedContent
    ? `Analyze this website and generate a complete brand package:\n\nURL: ${url}\n\n${scrapedContent}`
    : `Analyze this website and generate a complete brand package based on the URL: ${url}`;

  try {
    const raw    = await callDeepSeek(systemPrompt, userPrompt, { maxTokens: 3000, temperature: 0.7, jsonMode: true });
    let   parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = buildMockBrandData(pageTitle || url, url);
    }
    return successResponse(res, parsed);
  } catch (error) {
    console.error('DeepSeek brand analyze error:', error.response?.data || error.message);
    return errorResponse(res, 'Brand analysis failed. Please try again.', 500);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively removes bracketed emotion/style tags like "[Excited, friendly tone]"
 * from all string values in a parsed AI response object.
 */
function stripBracketTags(value) {
  if (typeof value === 'string') {
    return value.replace(/\[.*?\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  if (Array.isArray(value)) return value.map(stripBracketTags);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, stripBracketTags(v)]));
  }
  return value;
}

function buildMockBrandData(title, url) {
  const brand = title.replace(/^https?:\/\//, '').split(/[./]/)[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    brand_name: brand,
    brand_voice_profile: {
      website_type:    'Business / Service',
      emotion:         'Trustworthy',
      tone:            'Professional & Engaging',
      style:           'Conversational',
      personality:     'Authoritative, Trustworthy',
      target_audience: 'Business professionals and entrepreneurs',
      tagline:         'Empowering your success',
      content_summary: `${brand} is a professional platform dedicated to helping businesses and entrepreneurs achieve their goals. It offers proven solutions designed to streamline operations and drive measurable results. The brand targets ambitious professionals looking for reliable, expert-backed support.`,
      speaker_style:   'Confident, professional narrator with warm authority',
      voice_prompt:    `A confident male voice in his mid-30s, medium pitch and steady pace, with a calm and authoritative tone. Warm, magnetic, and rich in quality — purposeful without being aggressive. Ideal for professional service brands, VSL narration, and trust-building campaigns.`,
      key_messages: [
        'Quality solutions tailored to your needs',
        'Proven results you can rely on',
        'Expert support every step of the way',
      ],
    },
    vsl_sections: {
      hook: `Are you tired of struggling with the same challenges in your business? What if there was a proven way to change your results — starting today?`,
      body: `Introducing ${brand} — a complete solution built for entrepreneurs who are serious about growth. We've helped thousands of business owners streamline their operations and achieve measurable results within the first 30 days. Our system doesn't just give you tools — it gives you the clarity, strategy, and support you need to win.`,
      cta:  `Don't let another day pass without taking action. Click the button below, and let's start building your success story together. Your transformation begins now.`,
    },
    vsl_script: `Are you tired of struggling with the same challenges in your business? What if there was a proven way to change your results — starting today?\n\nIntroducing ${brand} — a complete solution built for entrepreneurs who are serious about growth.\n\nWe've helped thousands of business owners streamline their operations and achieve measurable results within the first 30 days. Our system doesn't just give you tools — it gives you the clarity, strategy, and support you need to win.\n\nHere's what makes us different: We don't just promise results — we deliver a complete system designed around your specific goals.\n\nOur clients consistently see significant improvements within the first month. And with the right tools in place, those results keep compounding.\n\nDon't let another day pass without taking action. Click the button below, and let's start building your success story together. Your transformation begins now.`,
  };
}

function buildMockFromSchema(schema) {
  if (!schema?.properties) return {};
  const result = {};
  for (const [key, def] of Object.entries(schema.properties)) {
    if (def.type === 'string')       result[key] = `[Mock ${key}] Set DEEPSEEK_API_KEY to generate real content.`;
    else if (def.type === 'number')  result[key] = 0;
    else if (def.type === 'boolean') result[key] = false;
    else                             result[key] = null;
  }
  return result;
}
