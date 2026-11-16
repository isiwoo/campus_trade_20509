import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api('/auth/me').then(data => {
      if (active) setUser(data.user);
    }).catch(() => {
      if (active) setUser(null);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function login(data) {
    const result = await api('/auth/login', { method: 'POST', body: data });
    setUser(result.user);
    return result;
  }

  async function register(data) {
    const result = await api('/auth/register', { method: 'POST', body: data });
    setUser(result.user);
    return result;
  }

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); }
    finally { setUser(null); }
  }

  async function updateProfile(data) {
    const result = await api('/auth/me', { method: 'PATCH', body: data });
    setUser(result.user);
    return result;
  }

  function clearUser() { setUser(null); }

  return <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, clearUser }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider가 필요합니다.');
  return value;
}
