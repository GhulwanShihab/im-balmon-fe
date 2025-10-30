const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  API_VERSION: '/api/v1',
  TIMEOUT: 10000,
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