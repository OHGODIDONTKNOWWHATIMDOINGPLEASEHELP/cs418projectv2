// src/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // is there even a token?
    const token = localStorage.getItem('token');
    if (!token) {
      setReady(true);
      return;
    }

    // ask backend if this token is still valid
    api('/auth/me')
      .then(({ user }) => {
        setProfile(user);
        setReady(true);
      })
      .catch(() => {
        // bad/expired token – throw it away
        localStorage.removeItem('token');
        setProfile(null);
        setReady(true);
      });
  }, []);

  function login(token, user) {
    localStorage.setItem('token', token);
    setProfile(user);
  }

  function logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('loginEmail');
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthed: !!profile,
        profile,
        login,
        logout,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
