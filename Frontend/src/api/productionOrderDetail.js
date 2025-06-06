// src/api/producutionOrder.js
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Cambia se usi una porta diversa

export const getProductionOrderDetails = () => axios.get(`${API_URL}/details/`);
export const getProductionOrderDetailsWithStatus = (status) => axios.get(`${API_URL}/details/`, { params: { status: status }});
export const createProductionOrderDetail = (data) => axios.post(`${API_URL}/details/`, data);
export const deleteProductionOrderDetail = (id) => axios.delete(`${API_URL}/details/${id}`);
export const updateProductionOrderDetail = (id, data) => axios.put(`${API_URL}/details/${id}`, data);
