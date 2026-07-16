import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30 * 1000;
let refreshPromise = null;

const axiosInstance = axios.create({
  baseURL,
  // Render can take 10-30 seconds to wake and Neon can take a moment to
  // establish its first connection. Five seconds causes false failures.
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
});

function accessTokenExpiresSoon(token) {
  try {
    const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
    return !payload.exp || payload.exp * 1000 <= Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS;
  } catch {
    // Let the response interceptor handle a malformed token consistently.
    return false;
  }
}

function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return Promise.reject(new Error('No refresh token is available.'));

  // Concurrent page requests share a single refresh instead of each sending
  // an expired access token and producing multiple 401 responses.
  if (!refreshPromise) {
    refreshPromise = axios.post(`${baseURL}/api/token/refresh/`, { refresh: refreshToken })
      .then(response => {
        const newAccess = response.data.access;
        localStorage.setItem('access_token', newAccess);
        return newAccess;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// Refresh close-to-expiry tokens before the protected request is sent.
// This prevents the visible 401-then-retry sequence in the browser console.
axiosInstance.interceptors.request.use(async config => {
  let token = localStorage.getItem('access_token');
  if (token && accessTokenExpiresSoon(token)) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response.data?.code === 'email_not_verified') {
      localStorage.clear();
      window.location.href = '/verify-email';
      return Promise.reject(error);
    }

    // Keep a reactive retry as a fallback for tokens revoked before their
    // expiry timestamp. Normally the request interceptor avoids this path.
    if (
      error.response?.status === 401 &&
      error.response.data?.code === 'token_not_valid' &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Do not leave a stale profile in the app after any other 401 response.
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
