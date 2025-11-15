import axios from 'axios';
import API_CONFIG from '../config/api.js';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 NEW: Token management helpers
const TokenManager = {
  getAccessToken: () => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  },
  
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  },
  
  getTokenExpiry: () => {
    const expiry = localStorage.getItem('token_expires_at') || sessionStorage.getItem('token_expires_at');
    return expiry ? parseInt(expiry) : null;
  },
  
  setTokens: (accessToken, refreshToken, expiresIn) => {
    const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
    
    storage.setItem('access_token', accessToken);
    storage.setItem('token', accessToken); // Keep compatibility
    
    if (refreshToken) {
      storage.setItem('refresh_token', refreshToken);
    }
    
    // Calculate expiry time
    const expiresAt = Date.now() + (expiresIn * 1000);
    storage.setItem('token_expires_at', expiresAt.toString());
  },
  
  clearTokens: () => {
    // Clear from both storages
    ['access_token', 'refresh_token', 'token', 'token_expires_at', 'user', 'roles', 'rememberMe'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  },
  
  isTokenExpiringSoon: () => {
    const expiresAt = TokenManager.getTokenExpiry();
    if (!expiresAt) return true;
    
    const timeUntilExpiry = expiresAt - Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return timeUntilExpiry < fiveMinutes;
  },
  
  isTokenExpired: () => {
    const expiresAt = TokenManager.getTokenExpiry();
    if (!expiresAt) return true;
    
    return Date.now() >= expiresAt;
  }
};

// 🔥 NEW: Refresh token logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = TokenManager.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(
      `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/refresh`,
      { refresh_token: refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    
    // Update tokens
    TokenManager.setTokens(access_token, refresh_token, expires_in || 1800);
    
    return access_token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Clear tokens and redirect to login
    TokenManager.clearTokens();
    window.location.href = '/login';
    
    throw error;
  }
};

// 🔥 NEW: Setup auto-refresh interval
const setupAutoRefresh = () => {
  // Clear existing interval if any
  if (window.tokenRefreshInterval) {
    clearInterval(window.tokenRefreshInterval);
  }

  // Check every 1 minute
  window.tokenRefreshInterval = setInterval(async () => {
    const token = TokenManager.getAccessToken();
    
    // Only refresh if user is logged in and token will expire soon
    if (token && TokenManager.isTokenExpiringSoon() && !isRefreshing) {
      console.log('🔄 Token akan expire, melakukan auto-refresh...');
      try {
        await refreshAccessToken();
        console.log('✅ Token berhasil di-refresh');
      } catch (error) {
        console.error('❌ Auto-refresh gagal:', error);
        // Logout handled in refreshAccessToken
      }
    }
  }, 60000); // Check every 1 minute
};

// Initialize auto-refresh if user is logged in
if (TokenManager.getAccessToken()) {
  setupAutoRefresh();
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // 🔥 NEW: Check if token needs refresh before request
    if (TokenManager.isTokenExpiringSoon() && !isRefreshing) {
      try {
        await refreshAccessToken();
      } catch (error) {
        // Will be handled by redirect in refreshAccessToken
        return Promise.reject(error);
      }
    }
    
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        
        isRefreshing = false;
        processQueue(null, newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Tokens cleared and redirected in refreshAccessToken
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 🔥 NEW: Export utilities
export { TokenManager, setupAutoRefresh };
export default apiClient;