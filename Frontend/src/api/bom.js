import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Cambia se usi una porta diversa

export const getBOMs = () => axios.get(`${API_URL}/bom/`);
export const getChildrenByParentID = (id) => axios.get(`${API_URL}/bom/${id}/children`);
export const createBOM = (data) => axios.post(`${API_URL}/bom`, data);
export const updateBOM = (id, data) => axios.put(`${API_URL}/bom/${id}`, data);
export const deleteBOM = (id) => axios.delete(`${API_URL}/bom/${id}`);
