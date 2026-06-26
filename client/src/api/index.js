import api from './client';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const boardsApi = {
  list: () => api.get('/boards'),
  get: (id) => api.get(`/boards/${id}`),
  create: (data) => api.post('/boards', data),
  update: (id, data) => api.patch(`/boards/${id}`, data),
  delete: (id) => api.delete(`/boards/${id}`),
};

export const tasksApi = {
  create: (boardId, data) => api.post(`/boards/${boardId}/tasks`, data),
  update: (id, data) => api.patch(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const aiApi = {
  suggestEstimate: (data) => api.post('/ai/suggest-estimate', data),
};
