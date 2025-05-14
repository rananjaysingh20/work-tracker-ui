import axios from 'axios';

const API_URL = 'https://work-tracker-backend-j9dj.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  login: async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    const response = await api.post('/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Projects API
export const projects = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

// Tasks API
export const tasks = {
  getAll: async (projectId: string) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  create: async (projectId: string, data: any) => {
    const response = await api.post(`/tasks/project/${projectId}`, data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  getActive: async () => {
    const response = await api.get('/tasks/active');
    return response.data;
  },
};

// Time Entries API
export const timeEntries = {
  getAll: async (taskId: string) => {
    const response = await api.get(`/time-entries/task/${taskId}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/time-entries/${id}`);
    return response.data;
  },
  create: async (taskId: string, data: any) => {
    const response = await api.post(`/time-entries/task/${taskId}`, data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/time-entries/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/time-entries/${id}`);
    return response.data;
  },
};

// Time Entry Files API
export const timeEntryFiles = {
  list: async (timeEntryId: string) => {
    const response = await api.get(`/time-entries/${timeEntryId}/files`);
    return response.data;
  },
  upload: async (timeEntryId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/time-entries/${timeEntryId}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  delete: async (timeEntryId: string, fileId: string) => {
    const response = await api.delete(`/time-entries/${timeEntryId}/files/${fileId}`);
    return response.data;
  },
};

// Categories API
export const categories = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Clients API
export const clients = {
  getAll: async () => {
    const response = await api.get('/clients');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/clients', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/clients/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },
  uploadFile: async (clientId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/clients/${clientId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getFiles: async (clientId: string) => {
    const response = await api.get(`/clients/${clientId}/files`);
    return response.data;
  },
  deleteFile: async (clientId: string, fileId: string) => {
    const response = await api.delete(`/clients/${clientId}/files/${fileId}`);
    return response.data;
  },
};

// Team Members API
export const teamMembers = {
  getAll: async (projectId: string) => {
    const response = await api.get(`/team-members/project/${projectId}`);
    return response.data;
  },
  add: async (projectId: string, data: any) => {
    const response = await api.post(`/team-members/project/${projectId}`, data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/team-members/${id}`, data);
    return response.data;
  },
  remove: async (id: string) => {
    const response = await api.delete(`/team-members/${id}`);
    return response.data;
  },
};

// Reports API
export const reports = {
  getAll: async () => {
    const response = await api.get('/reports');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/reports', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/reports/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },
  generateTimeTracking: async (data: any) => {
    const response = await api.post('/reports/generate/time-tracking', data);
    return response.data;
  },
  generateProjectStats: async (data: any) => {
    const response = await api.post('/reports/generate/project-stats', data);
    return response.data;
  },
  generateTeamProductivity: async (data: any) => {
    const response = await api.post('/reports/generate/team-productivity', data);
    return response.data;
  },
  generateClientBilling: async (data: any) => {
    const response = await api.post('/reports/generate/client-billing', data);
    return response.data;
  },
  getClientsFullReport: async () => {
    const response = await api.get('/reports/clients-full-report');
    return response.data;
  },
};

// Notifications API
export const notifications = {
  getAll: async (params?: any) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/notifications/${id}`);
    return response.data;
  },
  markAsRead: async (ids?: string[]) => {
    const response = await api.post('/notifications/mark-read', { notification_ids: ids });
    return response.data;
  },
  archive: async (ids?: string[]) => {
    const response = await api.post('/notifications/archive', { notification_ids: ids });
    return response.data;
  },
  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },
  updatePreferences: async (data: any) => {
    const response = await api.put('/notifications/preferences', data);
    return response.data;
  },
};

export default api; 