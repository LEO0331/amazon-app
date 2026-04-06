import axios from 'axios';

function normalizeBaseUrl(rawValue) {
  const value = (rawValue || '/').trim();
  if (value === '/') {
    return '/';
  }
  if (/^https?:\/\//i.test(value)) {
    return value.endsWith('/') ? value.slice(0, -1) : value;
  }
  if (value.startsWith('//')) {
    const prefixed = `https:${value}`;
    return prefixed.endsWith('/') ? prefixed.slice(0, -1) : prefixed;
  }
  // Support domain-only secret values like "my-api.vercel.app".
  const withProtocol = `https://${value.replace(/^\/+/, '')}`;
  return withProtocol.endsWith('/') ? withProtocol.slice(0, -1) : withProtocol;
}

const baseURL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});
let csrfTokenCache = '';

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}

apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrfToken = csrfTokenCache || readCookie('csrf_token');
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  const token = response?.data?.csrfToken;
  if (token) {
    csrfTokenCache = token;
  }
  return response;
});

export async function initializeCsrfToken() {
  try {
    const response = await apiClient.get('/api/auth/csrf-token');
    csrfTokenCache = response?.data?.csrfToken || csrfTokenCache;
  } catch (error) {
    // Non-blocking for local startup when backend is unavailable.
  }
}

export default apiClient;
