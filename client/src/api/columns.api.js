import api from './axios';

export const createColumn = (data) => api.post('/columns', data);
export const updateColumn = (id, data) => api.patch(`/columns/${id}`, data);
export const deleteColumn = (id) => api.delete(`/columns/${id}`);
export const reorderColumns = (data) => api.patch('/columns/reorder', data);