import { useState } from 'react';

export default function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [profile, setProfile] = useState(() => {
    const p = localStorage.getItem('profile'); return p ? JSON.parse(p) : null;
  });

  function saveAuth(t, p) {
    setToken(t); setProfile(p);
    localStorage.setItem('token', t || '');
    localStorage.setItem('profile', p ? JSON.stringify(p) : '');
  }
  function clearAuth() { saveAuth('', null); }
  return { token, profile, saveAuth, clearAuth };
}
