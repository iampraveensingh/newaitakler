import axios from 'axios';
import * as cheerio from 'cheerio';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * POST /api/ai/generate
 * Body: { prompt: string, response_json_schema: object }
 *
 * Proxies to OpenAI chat completions with JSON mode.
 * Falls back to a mock response in development if OPENAI_API_KEY is not set.
 */
export const generateContent = async (req, res) => {
  const { prompt, response_json_schema } = req.body;

  if (!prompt) {
    return errorResponse(res, 'Prompt is required', 400);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Development fallback - return mock data shaped like the schema
    console.warn('⚠️  OPENAI_API_KEY not set. Returning mock AI response.');
    const mockData = buildMockFromSchema(response_json_schema);
    return successResponse(res, mockData);
  }

  try {
    const systemPrompt = response_json_schema
      ? `You are a helpful assistant. Always respond with valid JSON matching this schema: ${JSON.stringify(response_json_schema)}. Do not include any text outside the JSON.`
      : 'You are a helpful assistant.';

    const { data } = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        response_format: response_json_schema ? { type: 'json_object' } : undefined,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const content = data.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { result: content };
    }

    return successResponse(res, parsed);
  } catch (error) {
    console.error('AI generation error:', error.response?.data || error.message);
    return errorResponse(res, 'AI generation failed. Please try again.', 500);
  }
};

// ─── Brand Analysis (DeepSeek) ────────────────────────────────────────────────

/**
 * POST /api/ai/brand-analyze
 * Body: { url: string }
 * 1. Scrapes the URL
 * 2. Sends scraped content to DeepSeek
 * 3. Returns { title, brand_voice_profile, vsl_script }
 */
export const analyzeBrand = async (req, res) => {
  const { url } = req.body;

  if (!url) return errorResponse(res, 'URL is required', 400);

  try { new URL(url); } catch {
    return errorResponse(res, 'Invalid URL format', 400);
  }

  // ── Step 1: Scrape ──────────────────────────────────────────────────────────
  let scrapedContent = '';
  let pageTitle = '';

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);
    $('script, style, noscript, nav, footer, header, iframe, .cookie-banner, .popup, .modal').remove();

    pageTitle = $('h1').first().text().trim() || $('title').text().trim() || '';
    const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

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
  const apiKey = process.env.DEEPSEEK_API_KEY;

  const systemPrompt = `You are an expert brand strategist and VSL copywriter.
Analyze the provided website content and return a JSON object with EXACTLY these fields:
{
  "brand_name": string,
  "brand_voice_profile": {
    "tone": string,
    "style": string,
    "personality": string,
    "target_audience": string,
    "tagline": string,
    "key_messages": [string, string, string]
  },
  "vsl_script": string
}
The vsl_script must be a complete, high-converting Video Sales Letter — hook, story, offer, CTA.
Write it in a natural, conversational tone optimized for voice delivery. Minimum 300 words.
Return ONLY valid JSON. No markdown. No extra text.`;

  const userPrompt = scrapedContent
    ? `Analyze this website and generate a complete brand package:\n\nURL: ${url}\n\n${scrapedContent}`
    : `Analyze this website and generate a complete brand package based on the URL: ${url}`;

  if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    // Fallback: use OpenAI if DeepSeek key not configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return successResponse(res, buildMockBrandData(pageTitle || url, url));
    }
    try {
      const { data } = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 3000,
        },
        { headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' }, timeout: 60000 }
      );
      const parsed = JSON.parse(data.choices[0]?.message?.content || '{}');
      return successResponse(res, parsed);
    } catch (err) {
      console.error('OpenAI brand analyze error:', err.response?.data || err.message);
      return successResponse(res, buildMockBrandData(pageTitle || url, url));
    }
  }

  try {
    const { data } = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 3000,
        temperature: 0.7,
      },
      {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        timeout: 90000,
      }
    );

    let parsed;
    try {
      parsed = JSON.parse(data.choices[0]?.message?.content || '{}');
    } catch {
      parsed = buildMockBrandData(pageTitle || url, url);
    }
    return successResponse(res, parsed);
  } catch (error) {
    console.error('DeepSeek brand analyze error:', error.response?.data || error.message);
    return errorResponse(res, 'Brand analysis failed. Please try again.', 500);
  }
};

function buildMockBrandData(title, url) {
  const brand = title.replace(/^https?:\/\//, '').split(/[./]/)[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    brand_name: brand,
    brand_voice_profile: {
      tone: 'Professional & Engaging',
      style: 'Conversational',
      personality: 'Authoritative, Trustworthy',
      target_audience: 'Business professionals and entrepreneurs',
      tagline: 'Empowering your success',
      key_messages: [
        'Quality solutions tailored to your needs',
        'Proven results you can rely on',
        'Expert support every step of the way',
      ],
    },
    vsl_script: `Are you tired of struggling with the same challenges in your business?\n\nIntroducing ${brand} — a proven solution that changes everything.\n\nWe've helped thousands of entrepreneurs and business owners transform their results with cutting-edge tools and strategies.\n\nHere's what makes us different: We don't just give you tools — we give you a complete system designed for real results.\n\nOur clients consistently see measurable improvements within the first 30 days.\n\nDon't let another day pass without taking action. Click the button below and start your transformation today.\n\nYour success story begins now.`,
  };
}

// ─── Schema mock helper ───────────────────────────────────────────────────────

function buildMockFromSchema(schema) {
  if (!schema?.properties) return {};
  const result = {};
  for (const [key, def] of Object.entries(schema.properties)) {
    if (def.type === 'string') {
      result[key] = `[Mock ${key}] This is placeholder content. Connect OpenAI API key to generate real content.`;
    } else if (def.type === 'number') {
      result[key] = 0;
    } else if (def.type === 'boolean') {
      result[key] = false;
    } else {
      result[key] = null;
    }
  }
  return result;
}
