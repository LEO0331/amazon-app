import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '/';
const baseURL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : '';
}

apiClient.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrfToken = readCookie('csrf_token');
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  return config;
});

export async function initializeCsrfToken() {
  try {
    await apiClient.get('/api/auth/csrf-token');
  } catch (error) {
    // Non-blocking for local startup when backend is unavailable.
  }
}

export default apiClient;
