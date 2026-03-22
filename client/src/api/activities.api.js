import api from './axios';

export const getActivities = (boardId, params) =>
  api.get(`/activities/${boardId}`, { params });