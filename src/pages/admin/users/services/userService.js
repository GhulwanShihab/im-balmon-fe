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
    console.error("Error fetching users:", error);
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
    console.error(`Error fetching user ${id}:`, error);
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
    console.error(`Error fetching user ${id} with roles:`, error);
    throw error;
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
    console.error(`Error fetching user ${id} status:`, error);
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
    console.error("Error creating user:", error);
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
    console.error(`Error updating user ${id}:`, error);
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
    console.error(`Error updating user ${id} status:`, error);
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
    console.error(`Error deleting user ${id}:`, error);
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
    console.error("Error fetching user stats:", error);
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
    console.error("Error fetching pending users:", error);
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
    console.error(`Error approving user ${id}:`, error);
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
    console.error(`Error rejecting user ${id}:`, error);
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
    console.error(`Error updating user ${id} roles:`, error);
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
    console.error("Error fetching roles:", error);
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
    console.error(`Error unlocking user ${id}:`, error);
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
    console.error("Error fetching current user:", error);
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
    console.error("Error fetching current user with roles:", error);
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
    console.error("Error updating current user:", error);
    throw error;
  }
};