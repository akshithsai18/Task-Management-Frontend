import client, { isMockMode, TOKEN_KEY } from './axiosClient.js';
import { mockApi } from './mockApi.js';

function normalizeUser(user) {
  if (!user) return user;
  return { ...user, name: user.name || user.fullName };
}

export const authApi = {
  async register(payload) {
    if (isMockMode) return mockApi.register(payload);
    const { data } = await client.post('/auth/register', payload);
    return data;
  },
  async login(payload) {
    const result = isMockMode ? await mockApi.login(payload) : (await client.post('/auth/login', payload)).data;
    if (result.token) sessionStorage.setItem(TOKEN_KEY, result.token);
    return { ...result, user: normalizeUser(result.user) };
  },
  async getCurrentUser() {
    if (isMockMode) return mockApi.me();
    const { data } = await client.get('/auth/me');
    return normalizeUser(data.user || data);
  },
  async logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    if (isMockMode) await mockApi.logout();
  },
};
