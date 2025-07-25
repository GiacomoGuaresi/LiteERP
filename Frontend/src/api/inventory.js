// src/api/inventory.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // Cambia se usi una porta diversa

export const getInventory = () => axios.get(`${API_URL}/inventory/`);
export const createInventoryItem = (data) => axios.post(`${API_URL}/inventory/`, data);
export const deleteInventoryItem = (id) => axios.delete(`${API_URL}/inventory/${id}`);
export const getInventoryItem = (id) => axios.get(`${API_URL}/inventory/${id}`);
export const updateInventoryItem = (id, data) => axios.put(`${API_URL}/inventory/${id}`, data);
export const addToInventory = (id, quantity) => axios.post(`${API_URL}/inventory/${id}/add/`, { quantity });
export const addToInventoryByCode = (code, quantity) => axios.post(`${API_URL}/inventory/${code}/addbycode/`, { quantity });
export const removeFromInventory = (id, quantity) => axios.post(`${API_URL}/inventory/${id}/remove/`, { quantity });
export const getInventoryLight = () => {
  const response = axios.get(`${API_URL}/inventory/`, {
    params: {
      fields: 'ID,code,category'
    }
  });
  return response;
};