import axios from 'axios';
 
const baseURL = 'http://localhost:8000';
 
const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json',
  },
});
 
// ✅ Attach token on every request, not just at import time.
// This fixes the bug where components loaded before login had no Authorization header.
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
 
// ✅ On 401, attempt token refresh once, then redirect to login on failure.
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
 
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.code === 'token_not_valid' &&
      !originalRequest._retry  // prevent infinite retry loop
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
 
      if (refreshToken) {
        try {
          const tokenResponse = await axios.post(`${baseURL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
 
          const newAccess = tokenResponse.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
 
          return axiosInstance(originalRequest);
        } catch (err) {
          console.error('Refresh token invalid. Logging out...');
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
 
    return Promise.reject(error);
  }
);
 
export default axiosInstance;