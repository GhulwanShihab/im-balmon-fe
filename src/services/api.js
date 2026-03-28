import axios from 'axios';
import API_CONFIG from '../config/api.js';
import { TokenManager } from './auth/TokenManager.js';
import { setupInterceptors, setupAutoRefresh } from './auth/axiosInterceptors.js';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup request and response interceptors
setupInterceptors(apiClient);

// 🔥 Export utilities
export { TokenManager, setupAutoRefresh };
export default apiClient;