import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { isMockMode, TOKEN_KEY } from '../api/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!isMockMode && !token) {
      setLoading(false);
      return undefined;
    }
    authApi.getCurrentUser()
      .then((current) => { if (active) setUser(current); })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_KEY);
        if (active) setUser(null);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const expireSession = () => {
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      navigate('/login', { replace: true, state: { message: 'Your session expired. Please sign in again.' } });
    };
    window.addEventListener('daymark:session-expired', expireSession);
    return () => window.removeEventListener('daymark:session-expired', expireSession);
  }, [navigate]);

  async function login(credentials) {
    const result = await authApi.login(credentials);
    const current = result.user || await authApi.getCurrentUser();
    setUser(current);
    return current;
  }

  async function register(details) {
    return authApi.register(details);
  }

  async function logout() {
    try { await authApi.logout(); } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
