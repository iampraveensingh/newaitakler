import axios from 'axios';
import * as cheerio from 'cheerio';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * POST /api/scrape
 * Body: { url: string }
 *
 * Fetches the given URL, parses its HTML with cheerio, and returns
 * structured content (title, meta description, headings, body text)
 * to be used as context for AI copy generation.
 */
export const scrapeUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return errorResponse(res, 'URL is required', 400);
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return errorResponse(res, 'Invalid URL format', 400);
  }

  try {
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      maxRedirects: 5,
    });

    const $ = cheerio.load(response.data);

    // Remove noise — scripts, styles, navbars, footers, popups
    $('script, style, noscript, nav, footer, header, iframe, .cookie-banner, .popup, .modal, .overlay, [role="dialog"]').remove();

    // Page title
    const title = $('h1').first().text().trim() || $('title').text().trim() || '';

    // Meta description
    const metaDescription =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Headings — h1 through h3 (max 20)
    const headings = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2) headings.push(text);
    });

    // Body content — paragraphs, list items, blockquotes with meaningful text
    const bodyParts = [];
    $('p, li, blockquote, .hero-text, .description, .feature, .benefit').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text && text.length > 30) bodyParts.push(text);
    });

    // Deduplicate and limit
    const uniqueBody = [...new Set(bodyParts)].slice(0, 50);
    const bodyText = uniqueBody.join('\n').slice(0, 5000);

    return successResponse(res, {
      title: title.slice(0, 300),
      metaDescription: metaDescription.slice(0, 500),
      headings: headings.slice(0, 20),
      bodyText,
    });
  } catch (error) {
    console.error('Scrape error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return errorResponse(res, 'Could not reach the URL. Please check the address and try again.', 422);
    }
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return errorResponse(res, 'The page took too long to respond. Try again or skip the URL.', 422);
    }
    if (error.response?.status === 403 || error.response?.status === 429) {
      return errorResponse(res, 'The page is blocking automated access. AI will generate without scraped data.', 422);
    }

    return errorResponse(res, 'Failed to scrape URL. AI will generate using the URL reference only.', 422);
  }
};
