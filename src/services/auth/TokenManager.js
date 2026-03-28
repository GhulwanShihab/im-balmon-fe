export const TokenManager = {
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
    if (!expiresAt) return false; // ✅ FIX: Return false if no token
    
    const timeUntilExpiry = expiresAt - Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return timeUntilExpiry < fiveMinutes;
  },
  
  isTokenExpired: () => {
    const expiresAt = TokenManager.getTokenExpiry();
    if (!expiresAt) return true;
    
    return Date.now() >= expiresAt;
  }
};
