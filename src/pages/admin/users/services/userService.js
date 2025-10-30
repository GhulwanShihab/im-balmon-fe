import apiClient from "../../../../services/api";

const USER_ENDPOINT = "/users";
const ROLE_ENDPOINT = "/users/roles"; // ✅ ganti ini

export const getUsers = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
  const response = await apiClient.get(USER_ENDPOINT, { params: cleanParams });
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`${USER_ENDPOINT}/${id}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post(USER_ENDPOINT, userData);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await apiClient.put(`${USER_ENDPOINT}/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`${USER_ENDPOINT}/${id}`);
  return response.data;
};

// ✅ Tambahkan fungsi ini untuk statistik user
export const getUserStats = async () => {
  const response = await apiClient.get(`${USER_ENDPOINT}/stats`);
  return response.data;
};

export const getPendingUsers = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined
    )
  );
  const response = await apiClient.get(`${USER_ENDPOINT}/pending`, { params: cleanParams });
  return response.data;
};

export const approveUser = async (id) => {
  const response = await apiClient.patch(`${USER_ENDPOINT}/${id}/approve`);
  return response.data;
};

export const rejectUser = async (id) => {
  const response = await apiClient.patch(`${USER_ENDPOINT}/${id}/reject`);
  return response.data;
};

export const updateUserRole = async (id, data) => {
  const response = await apiClient.put(`${USER_ENDPOINT}/${id}/roles`, data);
  return response.data;
};

export const getRoles = async () => {
  const response = await apiClient.get(ROLE_ENDPOINT);
  return response.data;
};
