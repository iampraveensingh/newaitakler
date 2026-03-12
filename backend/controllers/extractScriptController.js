import axios from 'axios';
import * as cheerio from 'cheerio';
import { YoutubeTranscript } from 'youtube-transcript';
import { successResponse, errorResponse } from '../utils/response.js';

function extractYoutubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;

      const shortMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortMatch) return shortMatch[1];
    }
  } catch {}
  return null;
}

export const extractScript = async (req, res) => {

  const { url } = req.body;

  if (!url) return errorResponse(res, 'URL is required', 400);

  let youtubeId = extractYoutubeId(url);

  /* ─────────────── YOUTUBE TRANSCRIPT ─────────────── */

  if (youtubeId) {

    let script = '';

    try {

      /* try youtube-transcript first */

      let segments = [];

      try {
        segments = await YoutubeTranscript.fetchTranscript(youtubeId, { lang: 'en' });
      } catch {}

      if (!segments || segments.length === 0) {
        try {
          segments = await YoutubeTranscript.fetchTranscript(youtubeId);
        } catch {}
      }

      if (segments && segments.length > 0) {

        script = segments
          .map(s => s.text.replace(/\[.*?\]/g, '').trim())
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

      }

    } catch {}

    /* ─────────────── FALLBACK → yt-dlp API ─────────────── */

    if (!script) {

      try {

        const api = await axios.post(
          "https://srv14.aisoftllc.com/expresivevoice/youtube_caption_api.php",
          { url },
          { timeout: 20000 }
        );

        if (api.data?.success) {
          script = api.data.transcript;
        }

      } catch {}

    }

    if (!script) {
      return errorResponse(res, 'Could not extract transcript from this video.', 422);
    }

    /* fetch title */

    let title = '';

    try {

      const page = await axios.get(`https://www.youtube.com/watch?v=${youtubeId}`, {
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const $ = cheerio.load(page.data);

      title = $('title').text().replace(' - YouTube', '').trim();

    } catch {}

    return successResponse(res, {
      script,
      source: 'youtube',
      title
    });

  }

  /* ─────────────── NORMAL WEB SCRAPER ─────────────── */

  try {

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const $ = cheerio.load(response.data);

    $('script,style,noscript,nav,footer,header,iframe,aside').remove();

    const title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      '';

    let script = '';

    $('p').each((_, el) => {

      const text = $(el).text().trim().replace(/\s+/g, ' ');

      if (text.length > 50) script += text + "\n\n";

    });

    script = script.trim().slice(0, 8000);

    if (!script) {
      return errorResponse(res, 'Could not extract meaningful content.', 422);
    }

    return successResponse(res, {
      script,
      source: 'web',
      title
    });

  } catch (err) {

    return errorResponse(res, 'Failed to extract content from this URL.', 422);

  }

};