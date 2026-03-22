import api from './axios';

export const createCard = (data) => api.post('/cards', data);
export const getCardById = (id) => api.get(`/cards/${id}`);
export const updateCard = (id, data) => api.patch(`/cards/${id}`, data);
export const deleteCard = (id) => api.delete(`/cards/${id}`);
export const moveCard = (id, data) => api.patch(`/cards/${id}/move`, data);