import axios from 'axios';

const API_URL = 'http://localhost:8000';

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
  return axios.post(`${API_URL}/users/register`, user);
};

export const getUserById = (id, token) => {
  return axios.get(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getMe = () => axios.get(`${API_URL}/users/me`);