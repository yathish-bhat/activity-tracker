import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('pulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Only redirect on 401 for NON-auth routes
api.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || '';
    const isAuthRoute = url.includes('/api/auth/login') || url.includes('/api/auth/register') ||
                        url.includes('/api/auth/forgot') || url.includes('/api/auth/reset');

    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('pulse_token');
      localStorage.removeItem('pulse_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;