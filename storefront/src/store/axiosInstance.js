import axios from 'axios';

// Ensure or generate persistent guest session UUID for Cart service
export const getOrCreateGuestSessionId = () => {
  const STORAGE_KEY = 'veyra_guest_session_id';
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      sessionId = crypto.randomUUID();
    } else {
      sessionId = 'guest-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject customer auth token and guest session ID
axiosInstance.interceptors.request.use(
  (config) => {
    // Inject guest session ID header for cart and guest operations
    const sessionId = getOrCreateGuestSessionId();
    config.headers['x-session-id'] = sessionId;

    // Inject customer JWT if logged in
    const token = localStorage.getItem('veyra_customer_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear customer session if expired or invalid token
      localStorage.removeItem('veyra_customer_token');
      localStorage.removeItem('veyra_customer_user');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
