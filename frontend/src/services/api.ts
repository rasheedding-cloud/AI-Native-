import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // 减少超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 后端返回格式: { success: true, data: actualData }
    // 如果response.data.success为true，则返回response.data.data
    if (response.data && response.data.success) {
      return response;
    }
    // 如果没有success字段，直接返回response
    return response;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// API接口定义
export const strategyApi = {
  getAll: () => api.get('/api/strategies'),
  create: (data: any) => api.post('/api/strategies', data),
  getById: (id: string) => api.get(`/api/strategies/${id}`),
  update: (id: string, data: any) => api.put(`/api/strategies/${id}`, data),
  delete: (id: string) => api.delete(`/api/strategies/${id}`),
};

export const initiativeApi = {
  getAll: () => api.get('/api/initiatives'),
  create: (data: any) => api.post('/api/initiatives', data),
};

export const projectApi = {
  getAll: () => api.get('/api/projects'),
  getById: (id: string) => api.get(`/api/projects/${id}`),
  create: (data: any) => api.post('/api/projects', data),
  update: (id: string, data: any) => api.put(`/api/projects/${id}`, data),
  delete: (id: string) => api.delete(`/api/projects/${id}`),
};

export const taskApi = {
  getAll: () => api.get('/api/tasks'),
  getById: (id: string) => api.get(`/api/tasks/${id}`),
  create: (data: any) => api.post('/api/tasks', data),
  update: (id: string, data: any) => api.put(`/api/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/api/tasks/${id}`),
  createSubtask: (taskId: string, data: any) => api.post(`/api/tasks/${taskId}/subtasks`, data),
  updateSubtask: (subtaskId: string, data: any) => api.put(`/api/tasks/subtasks/${subtaskId}`, data),
  deleteSubtask: (subtaskId: string) => api.delete(`/api/tasks/subtasks/${subtaskId}`),
};

export const kpiApi = {
  getAll: () => api.get('/api/kpis'),
  getById: (id: string) => api.get(`/api/kpis/${id}`),
  create: (data: any) => api.post('/api/kpis', data),
  update: (id: string, data: any) => api.put(`/api/kpis/${id}`, data),
  delete: (id: string) => api.delete(`/api/kpis/${id}`),
  updateCurrent: (id: string, current: number) => api.patch(`/api/kpis/${id}/current`, { current }),
};

export const aiApi = {
  calculatePriority: (data: any) => api.post('/api/ai/priority', data),
  getScheduling: (data: any) => api.post('/api/ai/scheduling', data),
  checkCompliance: (data: any) => api.post('/api/ai/compliance', data),
  generateReport: (data: any) => api.post('/api/ai/report', data),
};

export const calendarApi = {
  getAll: (params?: any) => api.get('/api/calendar', { params }),
  getById: (id: string) => api.get(`/api/calendar/${id}`),
  create: (data: any) => api.post('/api/calendar', data),
  update: (id: string, data: any) => api.put(`/api/calendar/${id}`, data),
  delete: (id: string) => api.delete(`/api/calendar/${id}`),
  getStats: (params?: any) => api.get('/api/calendar/stats/overview', { params }),
  aiPlanWeek: (data: any) => api.post('/api/calendar/ai-plan-week', data),
};

export default api;