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
  getHistory: (alertId?: number, limit?: number) =>
    api.get('/alerts/history', { params: { alertId, limit } }),
  acknowledgeHistory: (id: number, acknowledgedBy?: string) =>
    api.post(`/alerts/history/${id}/acknowledge`, { acknowledgedBy }),
  getStats: () => api.get('/alerts/stats'),
  testAlert: (id: number, value?: number) =>
    api.post(`/alerts/${id}/test`, { value }),
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

// Milestones
export const milestonesAPI = {
  getAll: (plantId?: number) => api.get('/milestones', { params: { plantId } }),
  getOne: (id: number) => api.get(`/milestones/${id}`),
  create: (data: any) => api.post('/milestones', data),
  update: (id: number, data: any) => api.put(`/milestones/${id}`, data),
  delete: (id: number) => api.delete(`/milestones/${id}`),
};

// Journal
export const journalAPI = {
  getTimeline: (plantId: number, startDate?: string, endDate?: string) =>
    api.get(`/journal/timeline/${plantId}`, { params: { startDate, endDate } }),
  getSummary: (plantId: number) => api.get(`/journal/summary/${plantId}`),
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

// Devices
export const devicesAPI = {
  getAll: () => api.get('/devices'),
  getOne: (id: number) => api.get(`/devices/${id}`),
  create: (data: any) => api.post('/devices', data),
  update: (id: number, data: any) => api.put(`/devices/${id}`, data),
  delete: (id: number) => api.delete(`/devices/${id}`),
  heartbeat: (id: number, data: any) => api.post(`/devices/${id}/heartbeat`, data),
  getStats: (id: number) => api.get(`/devices/${id}/stats`),
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

// Comparison Analytics
export const comparisonAPI = {
  comparePlants: (plantIds: number[], startDate?: string, endDate?: string) =>
    api.post('/comparison/plants', { plantIds, startDate, endDate }),
  getCycles: (limit?: number) => api.get('/comparison/cycles', { params: { limit } }),
  getStrains: () => api.get('/comparison/strains'),
  getSensorTrends: (sensorIds: number[], interval: string, startDate?: string, endDate?: string) =>
    api.post('/comparison/sensor-trends', { sensorIds, interval, startDate, endDate }),
};

// Reports
export const reportsAPI = {
  getAll: () => api.get('/reports'),
  getOne: (id: number) => api.get(`/reports/${id}`),
  create: (data: any) => api.post('/reports', data),
  update: (id: number, data: any) => api.put(`/reports/${id}`, data),
  delete: (id: number) => api.delete(`/reports/${id}`),
  sendNow: (id: number) => api.post(`/reports/${id}/send-now`),
  toggle: (id: number) => api.patch(`/reports/${id}/toggle`),
};

// Development Tools (only available in development mode)
export const devAPI = {
  getStatus: () => api.get('/dev/status'),
  seedQuick: () => api.post('/dev/seed/quick'),
  seedFull: () => api.post('/dev/seed/full'),
  seedCustom: (options: any) => api.post('/dev/seed/custom', options),
  clearData: () => api.delete('/dev/seed'),
};

// SMS Service
export const smsAPI = {
  getStatus: () => api.get('/sms/status'),
  getStats: () => api.get('/sms/stats'),
  getHistory: (limit?: number) => api.get('/sms/history', { params: { limit } }),
  updateSettings: (settings: any) => api.post('/sms/settings', settings),
  sendTest: () => api.post('/sms/test'),
};

export default api;
