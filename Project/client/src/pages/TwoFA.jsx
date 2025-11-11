// src/pages/TwoFA.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function TwoFA() {
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    try {
      // we stored tempToken/userId in sessionStorage during /auth/login step
      const tempToken = sessionStorage.getItem('tempToken');
      const userId = sessionStorage.getItem('userId');

      const { token, user } = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { code, tempToken, userId },
      });

      // SAVE final token so api.js can use it
      login(token, user);              // goes into context
      localStorage.setItem('token', token); // backup

      nav('/advising');  // or /me
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Enter 2FA code</h2>
      <input value={code} onChange={e => setCode(e.target.value)} className="input" />
      <button className="btn" type="submit">Verify</button>
      {msg && <p className="alert error">{msg}</p>}
    </form>
  );
}
