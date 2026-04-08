import axios from 'axios';
import * as cheerio from 'cheerio';
import { successResponse, errorResponse } from '../utils/response.js';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  'Accept': 'application/json, text/html, */*',
};

// ── Freelancer ────────────────────────────────────────────────────────────────
// Response: { aaData: [ [col0, col1, col2, ..., col32], ... ] }
// col[1]  = title (HTML)
// col[2]  = description (HTML)
// col[8]  = time_left (HTML)
// col[9]  = budget fallback (HTML)
// col[21] = job path  e.g. "/projects/..."
// col[32] = { minbudget_usd, maxbudget_usd }
async function fetchFreelancer(keyword) {
  const url = `https://www.freelancer.com/ajax/table/project_contest_datatable.php?tag=${encodeURIComponent(keyword)}`;
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });

  const rows = Array.isArray(data?.aaData) ? data.aaData : [];

  return rows.slice(0, 12).map((row) => {
    const title       = cheerio.load(row[1] || '').text().trim() || 'Freelancer Job';
    const description = cheerio.load(row[2] || '').text().trim();
    const timeLeft    = cheerio.load(row[8] || '').text().trim();
    const path        = row[21] || '';
    const jobUrl      = path ? `https://www.freelancer.com${path}` : `https://www.freelancer.com/jobs?keyword=${encodeURIComponent(keyword)}`;

    let budget = cheerio.load(row[9] || '').text().trim();
    if (row[32] && row[32].minbudget_usd != null) {
      budget = `$${Math.round(row[32].minbudget_usd)} - $${Math.round(row[32].maxbudget_usd)}`;
    }

    return {
      job_title:       title,
      job_description: description || 'See full description on Freelancer.',
      platform:        'freelancer',
      budget:          budget || null,
      job_type:        'fixed',
      skills_required: [],
      posted_date:     timeLeft || null,
      proposals_count: null,
      client_name:     null,
      job_url:         jobUrl,
    };
  });
}

// ── GoLance ───────────────────────────────────────────────────────────────────
// Response: { results: [ { name, description, payment, createdOn, _id }, ... ] }
// name        = string or array (take [0])
// description = array (take [0], strip tags)
// payment.hourlyRate or payment.budget
// createdOn   = ISO date string
// _id         = job ID → URL: https://golance.com/work/?jobId=<_id>
async function fetchGoLance(keyword) {
  const url = `https://golance.com/api/v1/jobs/search?limit=20&page=1&query=${encodeURIComponent(keyword)}`;
  const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });

  const list = data?.results;
  if (!Array.isArray(list)) return [];

  return list.slice(0, 12).map((job) => {
    // Title: may be array or string
    let title = Array.isArray(job.name) ? job.name[0] : job.name;
    title = (title || 'GoLance Job').replace(/"/g, '');

    // Description: first element of array, strip HTML
    const rawDesc = Array.isArray(job.description) ? job.description[0] : (job.description || '');
    const description = cheerio.load(rawDesc).text().trim();

    // Budget
    let budget = null;
    if (job.payment?.hourlyRate != null) {
      budget = `$${job.payment.hourlyRate}/hr`;
    } else if (job.payment?.budget != null) {
      budget = `$${job.payment.budget}`;
    }

    // Date
    const posted_date = job.createdOn ? formatDate(job.createdOn) : null;

    // URL
    const jobUrl = job._id
      ? `https://golance.com/work/?jobId=${job._id}`
      : `https://golance.com/jobs?search=${encodeURIComponent(keyword)}`;

    return {
      job_title:       title,
      job_description: description || 'See full description on GoLance.',
      platform:        'golance',
      budget,
      job_type:        'fixed',
      skills_required: [],
      posted_date,
      proposals_count: null,
      client_name:     null,
      job_url:         jobUrl,
    };
  });
}

// ── PeoplePerHour ─────────────────────────────────────────────────────────────
// Response: { data: [ { attributes: { title, proj_desc, budget, posted_dt, url } }, ... ] }
async function fetchPeoplePerHour(keyword) {
  const url =
    `https://www.peopleperhour.com/v2/projects/listAll` +
    `?app_id=23h2j27d&app_key=48c4a5fb862168be0a029894f4eca210` +
    `&filter%5Bkeyword%5D=${encodeURIComponent(keyword)}` +
    `&page%5Bnumber%5D=1&page%5Bsize%5D=20`;

  const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });

  const list = data?.data;
  if (!Array.isArray(list)) return [];

  return list.slice(0, 12).map((item) => {
    const attr = item.attributes || {};

    const title       = attr.title || 'PeoplePerHour Job';
    const description = cheerio.load(attr.proj_desc || '').text().trim();
    const budget      = attr.budget != null ? `$${attr.budget}` : null;
    const posted_date = attr.posted_dt ? formatDate(attr.posted_dt) : null;
    const jobUrl      = attr.url || `https://www.peopleperhour.com/freelance-jobs?keyword=${encodeURIComponent(keyword)}`;

    return {
      job_title:       title,
      job_description: description || 'See full description on PeoplePerHour.',
      platform:        'peopleperhour',
      budget,
      job_type:        'fixed',
      skills_required: [],
      posted_date,
      proposals_count: null,
      client_name:     null,
      job_url:         jobUrl,
    };
  });
}

// ── Fiverr ────────────────────────────────────────────────────────────────────
// Fiverr is protected by Cloudflare. We try two strategies:
//   1. Fetch the HTML and extract __NEXT_DATA__ JSON (works when CF allows it)
//   2. Try Fiverr's internal search JSON endpoint with XHR headers
// On any failure we return [] so the other sources are never blocked.
async function fetchFiverr(keyword) {
  const searchUrl = `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(keyword)}&source=sorting_by&filter=new`;

  // Strategy 1 — HTML + __NEXT_DATA__
  try {
    const { data: html, status } = await axios.get(searchUrl, {
      headers: {
        'User-Agent':                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language':           'en-US,en;q=0.9',
        'Accept-Encoding':           'gzip, deflate, br',
        'Connection':                'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest':            'document',
        'Sec-Fetch-Mode':            'navigate',
        'Sec-Fetch-Site':            'none',
        'Sec-Fetch-User':            '?1',
        'Cache-Control':             'max-age=0',
      },
      timeout: 15000,
      validateStatus: () => true, // never throw on HTTP errors
    });

    if (status === 200 && typeof html === 'string') {
      const gigs = parseFiverrNextData(html, keyword);
      if (gigs.length > 0) return gigs;
    }
    console.warn(`[jobs] Fiverr strategy-1 got status ${status} or no gigs`);
  } catch (err) {
    console.warn('[jobs] Fiverr strategy-1 error:', err.message);
  }

  // Strategy 2 — internal XHR/JSON endpoint
  try {
    const { data, status } = await axios.get(searchUrl, {
      headers: {
        'User-Agent':        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
        'Accept':            'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With':  'XMLHttpRequest',
        'Referer':           'https://www.fiverr.com/',
        'Accept-Language':   'en-US,en;q=0.9',
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (status === 200 && data && typeof data === 'object') {
      const gigs =
        data?.listings?.gigs ||
        data?.gigs ||
        data?.data?.gigs ||
        [];
      if (Array.isArray(gigs) && gigs.length > 0) return normalizeFiverrGigs(gigs, keyword);
    }
    console.warn(`[jobs] Fiverr strategy-2 got status ${status} or no gigs`);
  } catch (err) {
    console.warn('[jobs] Fiverr strategy-2 error:', err.message);
  }

  return [];
}

function parseFiverrNextData(html, keyword) {
  const $ = cheerio.load(html);
  const scriptContent = $('#__NEXT_DATA__').html();
  if (!scriptContent) return [];

  let nextData;
  try { nextData = JSON.parse(scriptContent); } catch { return []; }

  const pageProps = nextData?.props?.pageProps || {};
  const gigs =
    pageProps?.listings?.gigs ||
    pageProps?.categoryData?.gigs ||
    pageProps?.initialData?.listings?.gigs ||
    pageProps?.results?.gigs ||
    pageProps?.data?.gigs ||
    [];

  return normalizeFiverrGigs(Array.isArray(gigs) ? gigs : [], keyword);
}

function normalizeFiverrGigs(gigs, keyword) {
  return gigs.slice(0, 12).map((gig) => {
    const title      = gig.title || gig.gig_title || 'Fiverr Gig';
    const sellerName = gig.seller?.name || gig.seller_name || gig.username || null;
    const gigSlug    = gig.gig_slug || gig.url || null;
    const jobUrl     = gigSlug && sellerName
      ? `https://www.fiverr.com/${sellerName}/${gigSlug}`
      : `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(keyword)}&source=sorting_by&filter=new`;

    let budget = null;
    if (Array.isArray(gig.packages) && gig.packages.length > 0) {
      const price = gig.packages[0]?.price ?? gig.packages[0]?.p;
      if (price != null) budget = `From $${price}`;
    } else if (gig.price != null) {
      budget = `From $${gig.price}`;
    }

    const description = gig.description
      ? cheerio.load(gig.description).text().trim()
      : null;

    return {
      job_title:       title,
      job_description: description || `Freelance gig for "${keyword}" on Fiverr.`,
      platform:        'fiverr',
      budget,
      job_type:        'fixed',
      skills_required: [],
      posted_date:     null,
      proposals_count: null,
      client_name:     sellerName,
      job_url:         jobUrl,
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(raw) {
  if (!raw) return null;
  try {
    const d    = new Date(raw);
    const diff = Date.now() - d.getTime();
    if (diff < 3_600_000)   return `${Math.round(diff / 60_000)} minutes ago`;
    if (diff < 86_400_000)  return `${Math.round(diff / 3_600_000)} hours ago`;
    if (diff < 172_800_000) return 'Yesterday';
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return raw;
  }
}

// ── Controller ────────────────────────────────────────────────────────────────
export const searchJobs = async (req, res) => {
  const keyword = (req.query.q || '').trim();
  if (!keyword) return errorResponse(res, 'Query parameter "q" is required', 400);

  const [freelancerResult, golanceResult, pphResult, fiverrResult] = await Promise.allSettled([
    fetchFreelancer(keyword),
    fetchGoLance(keyword),
    fetchPeoplePerHour(keyword),
    fetchFiverr(keyword),
  ]);

  if (freelancerResult.status === 'rejected') console.warn('[jobs] Freelancer failed:',    freelancerResult.reason?.message);
  if (golanceResult.status    === 'rejected') console.warn('[jobs] GoLance failed:',        golanceResult.reason?.message);
  if (pphResult.status        === 'rejected') console.warn('[jobs] PeoplePerHour failed:',  pphResult.reason?.message);
  if (fiverrResult.status     === 'rejected') console.warn('[jobs] Fiverr failed:',          fiverrResult.reason?.message);

  const jobs = [
    ...(freelancerResult.status === 'fulfilled' ? freelancerResult.value : []),
    ...(golanceResult.status    === 'fulfilled' ? golanceResult.value    : []),
    ...(pphResult.status        === 'fulfilled' ? pphResult.value        : []),
    ...(fiverrResult.status     === 'fulfilled' ? fiverrResult.value     : []),
  ];

  return successResponse(res, {
    jobs,
    sources: {
      freelancer:    freelancerResult.status,
      golance:       golanceResult.status,
      peopleperhour: pphResult.status,
      fiverr:        fiverrResult.status,
    },
  });
};
