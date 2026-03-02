// App configuration — Base44 completely removed.
// JWT token management is handled by src/api/base44Client.js via localStorage.

export const appParams = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
};
