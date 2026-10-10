import client, { isMockMode } from './axiosClient.js';
import { mockApi } from './mockApi.js';

const unwrapTasks = (data) => Array.isArray(data) ? data : data?.content || data?.tasks || [];

export const taskApi = {
  async getTasks() {
    if (isMockMode) return mockApi.getTasks();
    const { data } = await client.get('/tasks');
    return unwrapTasks(data);
  },
  async getTask(id) {
    if (isMockMode) return mockApi.getTask(id);
    const { data } = await client.get(`/tasks/${encodeURIComponent(id)}`);
    return data.task || data;
  },
  async createTask(payload) {
    if (isMockMode) return mockApi.createTask(payload);
    const { data } = await client.post('/tasks', payload);
    return data.task || data;
  },
  async updateTask(id, payload) {
    if (isMockMode) return mockApi.updateTask(id, payload);
    const { data } = await client.put(`/tasks/${encodeURIComponent(id)}`, payload);
    return data.task || data;
  },
  async deleteTask(id) {
    if (isMockMode) return mockApi.deleteTask(id);
    await client.delete(`/tasks/${encodeURIComponent(id)}`);
  },
};
