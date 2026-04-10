import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mycourses_token') || '');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('mycourses_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setReady(true);
  }, []);

  const authValue = useMemo(
    () => ({
      user,
      token,
      ready,
      isAuthenticated: Boolean(token),
      async login(username, password) {
        const response = await api.post('/auth/login', { username, password });
        const { token: nextToken, user: nextUser } = response.data;
        localStorage.setItem('mycourses_token', nextToken);
        localStorage.setItem('mycourses_user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      async register(username, password, role) {
        const response = await api.post('/auth/register', { username, password, role });
        const { token: nextToken, user: nextUser } = response.data;
        localStorage.setItem('mycourses_token', nextToken);
        localStorage.setItem('mycourses_user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      async googleLogin(credential, role) {
        const response = await api.post('/auth/google', { credential, role });
        const { token: nextToken, user: nextUser } = response.data;
        localStorage.setItem('mycourses_token', nextToken);
        localStorage.setItem('mycourses_user', JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
      },
      logout() {
        localStorage.removeItem('mycourses_token');
        localStorage.removeItem('mycourses_user');
        setToken('');
        setUser(null);
      },
    }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
