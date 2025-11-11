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
      const tempToken = sessionStorage.getItem('tempToken');
      const userId = sessionStorage.getItem('userId');

      const { token, user } = await api('/auth/verify-2fa', {
        method: 'POST',
        body: { code, tempToken, userId },
      });

      // 👇 THIS is the important part
      login(token, user);                   // goes into context
      localStorage.setItem('token', token); // so api.js can read it

      nav('/advising');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>Enter 2FA code</h2>
      <input
        className="input"
        value={code}
        onChange={e => setCode(e.target.value)}
        required
      />
      <button className="btn" type="submit">Verify</button>
      {msg && <p className="alert error">{msg}</p>}
    </form>
  );
}
