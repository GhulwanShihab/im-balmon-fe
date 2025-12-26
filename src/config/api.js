const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.imbalmonlampung.site',
  API_VERSION: '/api/v1',
  TIMEOUT: 10000,
};

/**
 * Helper function to get full media URL from relative path
 * @param {string} relativePath - The relative path (e.g., /uploads/photos/device.jpg)
 * @returns {string} - Full URL (e.g., http://localhost:8000/uploads/photos/device.jpg)
 */
export const getMediaUrl = (relativePath) => {
  if (!relativePath) return '';
  // If already full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  return `${API_CONFIG.BASE_URL}${relativePath}`;
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // MFA endpoints
  MFA_SETUP: '/auth/mfa/setup',
  MFA_VERIFY: '/auth/mfa/verify',
  MFA_DISABLE: '/auth/mfa/disable',
  
  // Users endpoints
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  
  // Devices endpoints
  DEVICES: '/devices',
  DEVICE_BY_ID: (id) => `/devices/${id}`,
  DEVICE_AVAILABILITY: '/devices/availability',
  
  // Loans endpoints
  LOANS: '/loans',
  LOAN_BY_ID: (id) => `/loans/${id}`,
  LOAN_BORROW: '/loans/borrow',
  LOAN_RETURN: '/loans/return',
  USER_LOANS: '/loans/user',
  
  // Export endpoints
  EXPORT_LOANS: '/export/loans',
  EXPORT_DEVICES: '/export/devices',
  EXPORT_USERS: '/export/users',
};

export default API_CONFIG;