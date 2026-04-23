import axios from 'axios';
import API_CONFIG from '../../config/api.js';
import { TokenManager } from './TokenManager.js';

// 🔥 Refresh token logic
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

export const refreshAccessToken = async () => {
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
    
    // Clear tokens and redirect to login
    TokenManager.clearTokens();
    
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    
    throw error;
  }
};

// 🔥 Setup auto-refresh interval
export const setupAutoRefresh = () => {
  // Clear existing interval if any
  if (window.tokenRefreshInterval) {
    clearInterval(window.tokenRefreshInterval);
  }


  // Check every 1 minute
  window.tokenRefreshInterval = setInterval(async () => {
    const token = TokenManager.getAccessToken();
    const refreshToken = TokenManager.getRefreshToken();
    
    // ✅ FIX: Only refresh if BOTH tokens exist and token expiring soon
    if (token && refreshToken && TokenManager.isTokenExpiringSoon() && !isRefreshing) {
      try {
        await refreshAccessToken();
      } catch (error) {
      }
    }
  }, 60000); // Check every 1 minute
};

export const setupInterceptors = (apiClient) => {
  // Request interceptor to add auth token
  apiClient.interceptors.request.use(
    async (config) => {
      // ✅ FIX: Skip refresh check for login/register endpoints
      const isAuthEndpoint = config.url?.includes('/auth/login') || 
                            config.url?.includes('/auth/register') ||
                            config.url?.includes('/auth/refresh');
      
      if (isAuthEndpoint) {
        return config;
      }
      
      // ✅ FIX: Only check refresh if BOTH tokens exist
      const token = TokenManager.getAccessToken();
      const refreshToken = TokenManager.getRefreshToken();
      
      if (token && refreshToken && TokenManager.isTokenExpiringSoon() && !isRefreshing) {
        try {
          const newToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      }
      
      // Add token if exists
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

      // ✅ FIX: Don't retry auth endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/auth/register') ||
                            originalRequest.url?.includes('/auth/refresh');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        // ✅ FIX: Check if refresh token exists before attempting refresh
        const refreshToken = TokenManager.getRefreshToken();
        
        if (!refreshToken) {
          TokenManager.clearTokens();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

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
          
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};