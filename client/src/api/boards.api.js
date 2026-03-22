import api from './axios';

export const getBoards = () => api.get('/boards');
export const getBoardById = (id) => api.get(`/boards/${id}`);
export const createBoard = (data) => api.post('/boards', data);
export const updateBoard = (id, data) => api.patch(`/boards/${id}`, data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`);
export const addMember = (id, email) => api.post(`/boards/${id}/members`, { email });
export const removeMember = (id, memberId) => api.delete(`/boards/${id}/members/${memberId}`);