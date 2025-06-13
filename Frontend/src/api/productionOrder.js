// src/api/producutionOrder.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; // Cambia se usi una porta diversa

export const getProductionOrders = () => axios.get(`${API_URL}/orders/`);
export const getProductionOrder = (id) => axios.get(`${API_URL}/orders/${id}`);
export const createProductionOrderItem = (data) => axios.post(`${API_URL}/orders/`, data);
export const deleteProductionOrderItem = (id) => axios.delete(`${API_URL}/orders/${id}`);
export const updateProductionOrderItem = (id, data) => axios.put(`${API_URL}/orders/${id}`, data);
export const updateProductionOrderStatusItem = (id, newStatus) => {
  return axios.post(`${API_URL}/orders/${id}/updateStatus`, {
    new_status: newStatus
  });
};
export const getProductionOrderDetailsItems = (id) => axios.get(`${API_URL}/orders/${id}/details`);
