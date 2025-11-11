import { createContext, useContext, useState, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('profile') || 'null'); }
    catch { return null; }
  });

  const login = (newToken, user) => {
    setToken(newToken);
    setProfile(user);
    localStorage.setItem('token', newToken || '');
    localStorage.setItem('profile', JSON.stringify(user || null));
  };

  const logout = () => {
    setToken('');
    setProfile(null);
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
  };

  const value = useMemo(() => ({
    token,
    profile,
    isAuthed: !!token,
    login,
    logout,
  }), [token, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
