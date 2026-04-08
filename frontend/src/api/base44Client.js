// BACKEND API (Express + MySQL)
// Base URL: /api  (proxied via vite dev server, or set VITE_API_BASE_URL in .env)
// Base44 has been completely removed. All calls go to Express backend via axios + JWT.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally → clear token and redirect to SignIn
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/SignIn';
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const auth = {
  login: async (username, password) => {
    const { data } = await apiClient.post('/auth/login', { username, password });
    if (data.data?.token) {
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.data.user));
    }
    // Return in a shape compatible with SignIn page
    return {
      success: data.success,
      code: data.data?.user ? 'OK' : 'ERROR',
      message: data.message,
      user: data.data?.user,
    };
  },

  me: async () => {
    const { data } = await apiClient.get('/users/me');
    return data.data;
  },

  isAuthenticated: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    try {
      await apiClient.get('/auth/check');
      return true;
    } catch {
      return false;
    }
  },

  logout: (redirectUrl) => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = redirectUrl || '/SignIn';
  },

  redirectToLogin: () => {
    window.location.href = '/SignIn';
  },

  updateMe: async (payload) => {
    const { data } = await apiClient.put('/users/me', payload);
    return data.data;
  },
};

// ─── ENTITY FACTORY ─────────────────────────────────────────────────────────
// Mimics base44.entities.X.list / filter / create / update / delete

function createEntityApi(endpoint) {
  return {
    list: async (sort = '-created_at', limit) => {
      const params = { sort };
      if (limit) params.limit = limit;
      const { data } = await apiClient.get(`/${endpoint}`, { params });
      return data.data;
    },

    filter: async (filters = {}) => {
      const { data } = await apiClient.get(`/${endpoint}`, { params: filters });
      return data.data;
    },

    create: async (payload) => {
      const { data } = await apiClient.post(`/${endpoint}`, payload);
      return data.data;
    },

    update: async (id, payload) => {
      const { data } = await apiClient.put(`/${endpoint}/${id}`, payload);
      return data.data;
    },

    get: async (id) => {
      const { data } = await apiClient.get(`/${endpoint}/${id}`);
      return data.data;
    },

    delete: async (id) => {
      const { data } = await apiClient.delete(`/${endpoint}/${id}`);
      return data.data;
    },
  };
}

// ─── ENTITIES ────────────────────────────────────────────────────────────────

export const entities = {
  VoiceOver:         createEntityApi('voiceovers'),
  VoiceClone:        {
    ...createEntityApi('voice-clones'),
    // Returns all ready clones with is_public = 1, regardless of owner
    publicList: async () => {
      const { data } = await apiClient.get('/voice-clones/public');
      return data.data;
    },
  },
  CustomVoice:       createEntityApi('custom-voices'),
  AudioMix:          createEntityApi('audio-mixes'),
  VSLCopy:           createEntityApi('vsl-copies'),
  AdCopy:            createEntityApi('ad-copies'),
  Transcription:          createEntityApi('transcriptions'),
  ConversationalVoice:    createEntityApi('conversational-voices'),
  BrandStudioProject:     createEntityApi('brand-studio-projects'),
  Audiobook:              createEntityApi('audiobooks'),
  DFYOffer:          createEntityApi('dfy-offers'),
  PlanLimits:        createEntityApi('plan-limits'),
  UserUsageMonthly:     createEntityApi('usage-monthly'),
  User:                 createEntityApi('users'),
  BackgroundMusicTrack: createEntityApi('background-music'),
};

// ─── USAGE TRACKING ──────────────────────────────────────────────────────────
// feature: 'credits' | 'clones' | 'vsl' | 'ad' | 'custom' | 'transcriptions' | 'brand_studio' | 'conversational' | 'audio_mix'
export const trackUsage = async (feature, amount = 1) => {
  const { data } = await apiClient.post('/usage-monthly/track', { feature, amount });
  return data.data;
};

// ─── UPLOADS ─────────────────────────────────────────────────────────────────

export const uploads = {
  listAudio: async () => {
    const { data } = await apiClient.get('/uploads', { params: { type: 'audio' } });
    return data.data;
  },

  deleteUpload: async (id) => {
    const { data } = await apiClient.delete(`/uploads/${id}`);
    return data.data;
  },
};

// ─── AGENCY ──────────────────────────────────────────────────────────────────

export const agency = {
  listUsers: async () => {
    const { data } = await apiClient.get('/agency/users');
    return data.data;
  },

  createUser: async (payload) => {
    const { data } = await apiClient.post('/agency/users', payload);
    return data.data;
  },

  updateUser: async (id, payload) => {
    const { data } = await apiClient.put(`/agency/users/${id}`, payload);
    return data.data;
  },

  removeUser: async (id) => {
    const { data } = await apiClient.delete(`/agency/users/${id}`);
    return data.data;
  },

  allocateCredits: async (id, amount) => {
    const { data } = await apiClient.post(`/agency/users/${id}/credits`, { amount });
    return data.data;
  },

  getStats: async () => {
    const { data } = await apiClient.get('/agency/stats');
    return data.data;
  },
};

// ─── SYSTEM VOICES ───────────────────────────────────────────────────────────

export const systemVoices = {
  list: async () => {
    const { data } = await apiClient.get('/system-voices');
    return data.data;
  },

  listAll: async () => {
    const { data } = await apiClient.get('/system-voices/all');
    return data.data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post('/system-voices', payload);
    return data.data;
  },

  update: async (id, payload) => {
    const { data } = await apiClient.put(`/system-voices/${id}`, payload);
    return data.data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/system-voices/${id}`);
    return data.data;
  },
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export const notifications = {
  list: async () => {
    const { data } = await apiClient.get('/notifications');
    return data.data; // { notifications, unreadCount }
  },

  markRead: async (id) => {
    const { data } = await apiClient.put(`/notifications/${id}/read`);
    return data.data;
  },

  markAllRead: async () => {
    const { data } = await apiClient.put('/notifications/read-all');
    return data.data;
  },

  delete: async (id) => {
    const { data } = await apiClient.delete(`/notifications/${id}`);
    return data.data;
  },
};

// ─── AI INTEGRATIONS ─────────────────────────────────────────────────────────

export const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema }) => {
      const { data } = await apiClient.post('/ai/generate', {
        prompt,
        response_json_schema,
      });
      return data.data;
    },

    ScrapePage: async ({ url }) => {
      const { data } = await apiClient.post('/scrape', { url });
      return data.data; // { title, metaDescription, headings, bodyText }
    },

    ExtractScript: async ({ url }) => {
      const { data } = await apiClient.post('/extract-script', { url });
      return data.data; // { script, source, title }
    },

    AnalyzeBrand: async ({ url }) => {
      const { data } = await apiClient.post('/ai/brand-analyze', { url });
      return data.data; // { brand_name, brand_voice_profile, vsl_script }
    },

    UploadFile: async ({ file, track = true }) => {
      const formData = new FormData();
      formData.append('file', file);
      const url = track ? '/uploads/file' : '/uploads/file?track=false';
      const { data } = await apiClient.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data; // { file_url }
    },
  },
};

// ─── JOBS ─────────────────────────────────────────────────────────────────────

export const jobs = {
  search: async (keyword) => {
    const { data } = await apiClient.get('/jobs/search', { params: { q: keyword } });
    return data.data; // { jobs, sources }
  },
};

// ─── DEFAULT COMPAT EXPORT ───────────────────────────────────────────────────
// Keeps all existing page imports working: `import { base44 } from '@/api/base44Client'`

export const base44 = {
  auth,
  entities,
  uploads,
  agency,
  notifications,
  systemVoices,
  jobs,
  trackUsage,
  integrations,
  functions: {
    invoke: async (fnName, payload) => {
      if (fnName === 'login44') {
        const result = await auth.login(payload.username, payload.password);
        return { data: result };
      }
      throw new Error(`Unknown function: ${fnName}`);
    },
  },
};

export default apiClient;
