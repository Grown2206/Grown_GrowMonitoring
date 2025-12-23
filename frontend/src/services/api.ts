import axios from 'axios';
import { setupApiInterceptors } from './apiInterceptor';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Setup error handling and retry logic
setupApiInterceptors(api);

// Auth
export const authAPI = {
  login: (username: string, password: string) => api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
  getApiKeys: () => api.get('/auth/api-keys'),
  createApiKey: (name: string, description: string) => api.post('/auth/api-keys', { name, description }),
  updateApiKey: (id: number, isActive: boolean) => api.patch(`/auth/api-keys/${id}`, { isActive }),
  deleteApiKey: (id: number) => api.delete(`/auth/api-keys/${id}`),
};

// Plants
export const plantsAPI = {
  getAll: () => api.get('/plants'),
  getOne: (id: number) => api.get(`/plants/${id}`),
  create: (data: any) => api.post('/plants', data),
  update: (id: number, data: any) => api.put(`/plants/${id}`, data),
  delete: (id: number) => api.delete(`/plants/${id}`),
};

// Strains
export const strainsAPI = {
  getAll: () => api.get('/strains'),
  create: (data: any) => api.post('/strains', data),
  update: (id: number, data: any) => api.put(`/strains/${id}`, data),
  delete: (id: number) => api.delete(`/strains/${id}`),
};

// Sensors
export const sensorsAPI = {
  getLatest: (limit?: number) => api.get('/sensors/latest', { params: { limit } }),
  getHistory: (sensorId?: number, hours?: number) => api.get('/sensors/history', { params: { sensorId, hours } }),
  getStatus: () => api.get('/sensors/status'),
};

// Relays
export const relaysAPI = {
  getAll: () => api.get('/relays'),
  create: (data: any) => api.post('/relays', data),
  update: (id: number, data: any) => api.put(`/relays/${id}`, data),
  control: (id: number, status: boolean) => api.post(`/relays/${id}/control`, { status }),
  delete: (id: number) => api.delete(`/relays/${id}`),
};

// Irrigation
export const irrigationAPI = {
  getConfigs: () => api.get('/irrigation/config'),
  getConfigForPlant: (plantId: number) => api.get(`/irrigation/config/plant/${plantId}`),
  saveConfig: (data: any) => api.post('/irrigation/config', data),
  manualTrigger: (plantId: number, pumpId: number, durationSeconds: number) =>
    api.post('/irrigation/manual', { plantId, pumpId, durationSeconds }),
  getHistory: (plantId?: number, limit?: number) => api.get('/irrigation/history', { params: { plantId, limit } }),
};

// Alerts
export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  create: (data: any) => api.post('/alerts', data),
  update: (id: number, data: any) => api.put(`/alerts/${id}`, data),
  delete: (id: number) => api.delete(`/alerts/${id}`),
};

// Notes
export const notesAPI = {
  getAll: (plantId?: number) => api.get('/notes', { params: { plantId } }),
  create: (data: any) => api.post('/notes', data),
  update: (id: number, data: any) => api.put(`/notes/${id}`, data),
  delete: (id: number) => api.delete(`/notes/${id}`),
};

// Events
export const eventsAPI = {
  getAll: (plantId?: number, startDate?: string, endDate?: string) =>
    api.get('/events', { params: { plantId, startDate, endDate } }),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

// Export
export const exportAPI = {
  sensorData: (format: string, days: number) => api.get('/export/sensor-data', { params: { format, days } }),
  plants: (format: string) => api.get('/export/plants', { params: { format } }),
  fullBackup: () => api.get('/export/full-backup'),
};

// Sensors Management
export const sensorsManagementAPI = {
  getAll: () => api.get('/sensors-management'),
  getOne: (id: number) => api.get(`/sensors-management/${id}`),
  create: (data: any) => api.post('/sensors-management', data),
  update: (id: number, data: any) => api.put(`/sensors-management/${id}`, data),
  calibrate: (id: number, offset: number) => api.post(`/sensors-management/${id}/calibrate`, { offset }),
  delete: (id: number) => api.delete(`/sensors-management/${id}`),
};

// Automation
export const automationAPI = {
  getAll: () => api.get('/automation'),
  getOne: (id: number) => api.get(`/automation/${id}`),
  create: (data: any) => api.post('/automation', data),
  update: (id: number, data: any) => api.put(`/automation/${id}`, data),
  trigger: (id: number) => api.post(`/automation/${id}/trigger`),
  delete: (id: number) => api.delete(`/automation/${id}`),
};

// Activity Logs
export const activityAPI = {
  getAll: (params?: any) => api.get('/activity', { params }),
  getStats: () => api.get('/activity/stats'),
};

// Settings
export const settingsAPI = {
  getAll: (category?: string) => api.get('/settings', { params: { category } }),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  save: (data: any) => api.post('/settings', data),
  delete: (key: string) => api.delete(`/settings/${key}`),
  getAllUsers: () => api.get('/settings/users/all'),
  updateUser: (id: number, data: any) => api.patch(`/settings/users/${id}`, data),
};

// Schedules
export const schedulesAPI = {
  getAll: () => api.get('/schedules'),
  create: (data: any) => api.post('/schedules', data),
  update: (id: number, data: any) => api.put(`/schedules/${id}`, data),
  delete: (id: number) => api.delete(`/schedules/${id}`),
};

// Harvests
export const harvestsAPI = {
  getAll: () => api.get('/harvests'),
  create: (data: any) => api.post('/harvests', data),
  update: (id: number, data: any) => api.put(`/harvests/${id}`, data),
  delete: (id: number) => api.delete(`/harvests/${id}`),
};

export default api;
