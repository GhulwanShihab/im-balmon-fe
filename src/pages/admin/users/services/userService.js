import apiClient from "../../../../services/api";

const USER_ENDPOINT = "/users";
const ROLE_ENDPOINT = "/users/roles";

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (params = {}) => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );
    const response = await apiClient.get(USER_ENDPOINT, { params: cleanParams });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  try {
    const response = await apiClient.get(`${USER_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user with roles
 */
export const getUserWithRoles = async (id) => {
  try {
    const response = await apiClient.get(`${USER_ENDPOINT}/${id}/roles`);
    return response.data;
  } catch (error) {
    // Jika error 401 atau 403, throw ulang untuk di-handle oleh interceptor
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw error;
    }
    
    // Untuk error lain (404, 500, dll), skip dan return empty roles
    return { roles: [] };
  }
};

/**
 * Get user account status
 */
export const getUserAccountStatus = async (id) => {
  try {
    const response = await apiClient.get(`${USER_ENDPOINT}/${id}/status`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new user
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post(USER_ENDPOINT, userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user
 */
export const updateUser = async (id, data) => {
  try {
    const response = await apiClient.put(`${USER_ENDPOINT}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user status (active/inactive)
 */
export const updateUserStatus = async (id, is_active) => {
  try {
    const response = await apiClient.put(`${USER_ENDPOINT}/${id}/status`, {
      is_active,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (id) => {
  try {
    const response = await apiClient.delete(`${USER_ENDPOINT}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  try {
    const response = await apiClient.get(`${USER_ENDPOINT}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending users (waiting for admin approval)
 */
export const getPendingUsers = async (params = {}) => {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== "" && value !== null && value !== undefined
      )
    );
    const response = await apiClient.get(`${USER_ENDPOINT}/pending`, {
      params: cleanParams,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Approve user registration
 */
export const approveUser = async (id) => {
  try {
    const response = await apiClient.patch(`${USER_ENDPOINT}/${id}/approve`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject user registration (permanent delete)
 */
export const rejectUser = async (id) => {
  try {
    const response = await apiClient.patch(`${USER_ENDPOINT}/${id}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user roles
 */
export const updateUserRole = async (id, data) => {
  try {
    const response = await apiClient.put(`${USER_ENDPOINT}/${id}/roles`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all available roles
 */
export const getRoles = async () => {
  try {
    const response = await apiClient.get(ROLE_ENDPOINT);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Unlock user account (admin only)
 */
export const unlockUserAccount = async (id) => {
  try {
    const response = await apiClient.post(`${USER_ENDPOINT}/${id}/unlock`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get(`${USER_ENDPOINT}/me`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user with roles
 */
export const getCurrentUserWithRoles = async () => {
  try {
    const response = await apiClient.get(`${USER_ENDPOINT}/me/roles`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update current user
 */
export const updateCurrentUser = async (data) => {
  try {
    const response = await apiClient.put(`${USER_ENDPOINT}/me`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};