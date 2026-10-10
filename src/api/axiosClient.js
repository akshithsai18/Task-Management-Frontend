import axios from 'axios';

export const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
export const isMockMode = API_MODE === 'mock';
export const TOKEN_KEY = 'daymark_access_token';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 12000,
});

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.message || error.response?.data?.error;
    const messages = {
      400: detail || 'Please check the information you entered.',
      401: 'Your session has expired. Please sign in again.',
      403: 'You do not have permission to do that.',
      404: 'The requested item could not be found.',
      500: 'The server encountered a problem. Please try again.',
    };
    if (status === 401 && sessionStorage.getItem(TOKEN_KEY)) {
      window.dispatchEvent(new Event('daymark:session-expired'));
    }
    error.userMessage = messages[status] || (error.response ? detail || 'Something went wrong.' : 'Could not reach the server. Check your connection and API settings.');
    return Promise.reject(error);
  },
);

export function errorMessage(error) {
  return error?.userMessage || error?.message || 'Something went wrong. Please try again.';
}

export default client;
