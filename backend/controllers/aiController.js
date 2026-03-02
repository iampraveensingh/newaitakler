import axios from 'axios';
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
