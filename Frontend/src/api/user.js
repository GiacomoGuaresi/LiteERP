import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const getUsers = () => axios.get(`${API_URL}/users/`)

export const login = async (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  return axios.post(`${API_URL}/users/login`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const register = (user) => {
  return axios.post(`${API_URL}/users/`, user);
};

export const getUserById = (id, token) => {
  return axios.get(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getMe = () => axios.get(`${API_URL}/users/me`);

export const updateUser = (id, data) => axios.put(`${API_URL}/users/${id}`, data);

export const deleteUser = (id) => axios.delete(`${API_URL}/users/${id}`);