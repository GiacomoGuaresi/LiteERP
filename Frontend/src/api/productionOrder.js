// src/api/producutionOrder.js
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Cambia se usi una porta diversa

export const getProductionOrder = () => axios.get(`${API_URL}/orders/`);
export const createProductionOrderItem = (data) => axios.post(`${API_URL}/orders/`, data);
export const deleteProductionOrderItem = (id) => axios.delete(`${API_URL}/orders/${id}`);
