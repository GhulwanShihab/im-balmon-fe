// 🛠️ Utility Functions untuk Admin User Management
// File ini berisi helper functions yang bisa digunakan di berbagai komponen

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {boolean} includeTime - Apakah include waktu atau tidak
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return "-";

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return new Date(date).toLocaleString("id-ID", options);
};

/**
 * Format tanggal ke relative time (e.g., "2 hari yang lalu")
 * @param {string|Date} date - Tanggal
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "-";

  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return "Baru saja";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} minggu yang lalu`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
  return `${Math.floor(diffInSeconds / 31536000)} tahun yang lalu`;
};

/**
 * Debounce function untuk search input
 * @param {Function} func - Function yang akan di-debounce
 * @param {number} wait - Waktu tunggu dalam ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {object} Validation result
 */
export const validateUsername = (username) => {
  const errors = [];

  if (!username) {
    errors.push("Username wajib diisi");
  } else if (username.length < 3) {
    errors.push("Username minimal 3 karakter");
  } else if (username.length > 50) {
    errors.push("Username maksimal 50 karakter");
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push("Username hanya boleh huruf, angka, dan underscore");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength score
 */
export const validatePassword = (password) => {
  const errors = [];
  let strength = 0;

  // Length check
  if (!password) {
    errors.push("Password wajib diisi");
    return { valid: false, errors, strength: 0 };
  }

  if (password.length < 8) {
    errors.push("Password minimal 8 karakter");
  } else {
    strength += 1;
  }

  if (password.length >= 12) {
    strength += 1;
  }

  // Character type checks
  if (!/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung huruf besar (A-Z)");
  } else {
    strength += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password harus mengandung huruf kecil (a-z)");
  } else {
    strength += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password harus mengandung angka (0-9)");
  } else {
    strength += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password harus mengandung karakter khusus (!@#$%...)");
  } else {
    strength += 1;
  }

  // Bonus for length
  if (password.length >= 16) {
    strength += 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: Math.min(strength, 5), // Max 5
  };
};

/**
 * Get password strength level
 * @param {number} strength - Strength score (0-5)
 * @returns {object} Level info
 */
export const getPasswordStrengthLevel = (strength) => {
  if (strength <= 2) {
    return { level: "weak", color: "red", text: "Lemah", percentage: 25 };
  }
  if (strength === 3) {
    return { level: "medium", color: "yellow", text: "Sedang", percentage: 50 };
  }
  if (strength === 4) {
    return { level: "strong", color: "green", text: "Kuat", percentage: 75 };
  }
  return { level: "very-strong", color: "emerald", text: "Sangat Kuat", percentage: 100 };
};

/**
 * Truncate text dengan ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/**
 * Get initials from name
 * @param {string} name - Name or username
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return "U";

  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate random color for avatar
 * @param {string} seed - Seed for consistent color (e.g., user ID)
 * @returns {string} Tailwind color class
 */
export const getAvatarColor = (seed) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  if (!seed) return colors[0];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.toString().length; i++) {
    hash = seed.toString().charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Format number dengan thousand separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Download data as JSON file
 * @param {object} data - Data to download
 * @param {string} filename - Filename
 */
export const downloadJSON = (data, filename = "data.json") => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export table data to CSV
 * @param {Array} data - Array of objects
 * @param {string} filename - Filename
 */
export const exportToCSV = (data, filename = "export.csv") => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Check if user has specific role
 * @param {Array} userRoles - User's roles
 * @param {string} requiredRole - Required role
 * @returns {boolean} Has role
 */
export const hasRole = (userRoles, requiredRole) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.some(
    (role) => (typeof role === "string" ? role : role.name) === requiredRole
  );
};

/**
 * Check if user has any of specified roles
 * @param {Array} userRoles - User's roles
 * @param {Array} requiredRoles - Required roles
 * @returns {boolean} Has any role
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  if (!requiredRoles || !Array.isArray(requiredRoles)) return false;

  return requiredRoles.some((requiredRole) => hasRole(userRoles, requiredRole));
};

/**
 * Parse error message from API response
 * @param {object} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const parseErrorMessage = (error) => {
  if (!error.response) {
    return "Terjadi kesalahan jaringan. Periksa koneksi internet Anda.";
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data?.detail || "Permintaan tidak valid";
    case 401:
      return "Sesi Anda telah berakhir. Silakan login kembali.";
    case 403:
      return "Anda tidak memiliki akses untuk melakukan tindakan ini.";
    case 404:
      return data?.detail || "Data tidak ditemukan";
    case 422:
      if (Array.isArray(data?.detail)) {
        return data.detail.map((err) => err.msg).join(", ");
      }
      return data?.detail || "Validasi gagal";
    case 423:
      return data?.detail || "Akun terkunci sementara";
    case 500:
      return "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
    default:
      return data?.detail || "Terjadi kesalahan yang tidak diketahui";
  }
};

/**
 * Create query string from object
 * @param {object} params - Parameters object
 * @returns {string} Query string
 */
export const createQueryString = (params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );

  return new URLSearchParams(cleanParams).toString();
};

/**
 * Safe JSON parse
 * @param {string} jsonString - JSON string
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed value or default
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return defaultValue;
  }
};

/**
 * Get status badge color based on status
 * @param {boolean} isActive - Is active status
 * @returns {string} Tailwind color classes
 */
export const getStatusBadgeColor = (isActive) => {
  return isActive
    ? "bg-green-100 text-green-700 border-green-200"
    : "bg-red-100 text-red-700 border-red-200";
};

/**
 * Sleep function for testing/delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate random ID (for temporary IDs)
 * @returns {string} Random ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if object is empty
 * @param {object} obj - Object to check
 * @returns {boolean} Is empty
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Deep clone object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Export all utilities as default object
export default {
  formatDate,
  formatRelativeTime,
  debounce,
  isValidEmail,
  validateUsername,
  validatePassword,
  getPasswordStrengthLevel,
  truncateText,
  getInitials,
  getAvatarColor,
  formatNumber,
  copyToClipboard,
  downloadJSON,
  exportToCSV,
  hasRole,
  hasAnyRole,
  parseErrorMessage,
  createQueryString,
  safeJSONParse,
  getStatusBadgeColor,
  sleep,
  generateId,
  isEmpty,
  deepClone,
};